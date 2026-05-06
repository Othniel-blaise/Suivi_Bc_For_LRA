import { z } from 'zod';
import { authenticate, requireRole } from '../middleware/auth.js';

const createBCSchema = z.object({
  numero: z.string().min(1, 'Numéro de BC requis'),
  fournisseur: z.string().min(1, 'Fournisseur requis'),
  imputation: z.string().optional().default('—'),
});

const receptionSchema = z.object({
  articlesRecus: z.string().min(1, 'Les articles reçus sont obligatoires'),
  lieuReception: z.string().min(1, 'Le lieu de réception est obligatoire'),
});

export default async function bonsCommandeRoutes(fastify) {
  // GET /api/bons-commande — liste tous les BC
  fastify.get('/', { preHandler: authenticate }, async (_request, reply) => {
    const bcs = await fastify.prisma.bonCommande.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: { select: { id: true, nom: true, username: true } },
        receptionniste: { select: { id: true, nom: true, username: true } },
      },
    });
    return reply.send(bcs);
  });

  // GET /api/bons-commande/:id — détail d'un BC
  fastify.get('/:id', { preHandler: authenticate }, async (request, reply) => {
    const bc = await fastify.prisma.bonCommande.findUnique({
      where: { id: request.params.id },
      include: {
        createdBy: { select: { id: true, nom: true, username: true } },
        receptionniste: { select: { id: true, nom: true, username: true } },
      },
    });
    if (!bc) return reply.status(404).send({ error: 'BC introuvable' });
    return reply.send(bc);
  });

  // POST /api/bons-commande — créer un BC (PATRON uniquement)
  fastify.post('/', {
    preHandler: [authenticate, requireRole('PATRON')],
  }, async (request, reply) => {
    const result = createBCSchema.safeParse(request.body);
    if (!result.success) {
      return reply.status(400).send({ error: result.error.errors[0].message });
    }

    const { numero, fournisseur, imputation } = result.data;

    const existing = await fastify.prisma.bonCommande.findUnique({ where: { numero } });
    if (existing) {
      return reply.status(409).send({ error: `Le numéro "${numero}" existe déjà` });
    }

    const bc = await fastify.prisma.bonCommande.create({
      data: { numero, fournisseur, imputation, createdById: request.currentUser.id },
      include: {
        createdBy: { select: { id: true, nom: true, username: true } },
        receptionniste: { select: { id: true, nom: true, username: true } },
      },
    });

    return reply.status(201).send(bc);
  });

  // PATCH /api/bons-commande/:id/reception — confirmer réception (RECEPTIONNISTE ou PATRON)
  fastify.patch('/:id/reception', {
    preHandler: [authenticate, requireRole('RECEPTIONNISTE', 'PATRON')],
  }, async (request, reply) => {
    const bc = await fastify.prisma.bonCommande.findUnique({
      where: { id: request.params.id },
    });

    if (!bc) return reply.status(404).send({ error: 'BC introuvable' });
    if (bc.statut === 'LIVRE') {
      return reply.status(409).send({ error: 'Ce BC a déjà été réceptionné' });
    }

    const result = receptionSchema.safeParse(request.body);
    if (!result.success) {
      return reply.status(400).send({ error: result.error.errors[0].message });
    }

    const { articlesRecus, lieuReception } = result.data;

    const updated = await fastify.prisma.bonCommande.update({
      where: { id: request.params.id },
      data: {
        statut: 'LIVRE',
        dateReception: new Date(),
        articlesRecus,
        lieuReception,
        receptionnisteId: request.currentUser.id,
      },
      include: {
        createdBy: { select: { id: true, nom: true, username: true } },
        receptionniste: { select: { id: true, nom: true, username: true } },
      },
    });

    return reply.send(updated);
  });

  // POST /api/bons-commande/import — import en lot (PATRON uniquement)
  fastify.post('/import', {
    preHandler: [authenticate, requireRole('PATRON')],
  }, async (request, reply) => {
    const items = request.body;
    if (!Array.isArray(items) || items.length === 0) {
      return reply.status(400).send({ error: 'Liste vide ou format invalide' });
    }
    if (items.length > 500) {
      return reply.status(400).send({ error: 'Maximum 500 lignes par import' });
    }

    const resultats = [];
    for (const item of items) {
      const result = createBCSchema.safeParse(item);
      if (!result.success) {
        resultats.push({ numero: item.numero || '?', statut: 'erreur', message: result.error.errors[0].message });
        continue;
      }
      const { numero, fournisseur, imputation } = result.data;
      const existing = await fastify.prisma.bonCommande.findUnique({ where: { numero } });
      if (existing) {
        resultats.push({ numero, statut: 'doublon', message: 'Numéro déjà existant' });
        continue;
      }
      await fastify.prisma.bonCommande.create({
        data: { numero, fournisseur, imputation, createdById: request.currentUser.id },
      });
      resultats.push({ numero, statut: 'ok', message: 'Créé' });
    }

    const crees = resultats.filter((r) => r.statut === 'ok').length;
    const doublons = resultats.filter((r) => r.statut === 'doublon').length;
    const erreurs = resultats.filter((r) => r.statut === 'erreur').length;
    return reply.status(201).send({ crees, doublons, erreurs, resultats });
  });

  // GET /api/bons-commande/stats/par-lieu — stats par lieu (PATRON uniquement)
  fastify.get('/stats/par-lieu', {
    preHandler: [authenticate, requireRole('PATRON')],
  }, async (_request, reply) => {
    const tous = await fastify.prisma.bonCommande.findMany({
      select: { lieuReception: true, statut: true },
    });

    const groupes = {};
    for (const bc of tous) {
      const lieu = bc.lieuReception?.trim() || 'Non défini';
      if (!groupes[lieu]) groupes[lieu] = { lieu, livres: 0, enAttente: 0, total: 0 };
      groupes[lieu].total++;
      if (bc.statut === 'LIVRE') groupes[lieu].livres++;
      else groupes[lieu].enAttente++;
    }

    const resultat = Object.values(groupes)
      .sort((a, b) => {
        if (a.lieu === 'Non défini') return 1;
        if (b.lieu === 'Non défini') return -1;
        return b.total - a.total;
      })
      .map((g) => ({ ...g, tauxLivraison: g.total > 0 ? Math.round((g.livres / g.total) * 100) : 0 }));

    return reply.send({ parLieu: resultat });
  });

  // DELETE /api/bons-commande/:id — supprimer un BC (PATRON uniquement)
  fastify.delete('/:id', {
    preHandler: [authenticate, requireRole('PATRON')],
  }, async (request, reply) => {
    const bc = await fastify.prisma.bonCommande.findUnique({
      where: { id: request.params.id },
    });
    if (!bc) return reply.status(404).send({ error: 'BC introuvable' });

    await fastify.prisma.bonCommande.delete({ where: { id: request.params.id } });
    return reply.status(204).send();
  });
}
