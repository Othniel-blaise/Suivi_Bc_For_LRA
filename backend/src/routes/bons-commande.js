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

  // PATCH /api/bons-commande/:id/reception — confirmer réception (RECEPTIONNISTE)
  fastify.patch('/:id/reception', {
    preHandler: [authenticate, requireRole('RECEPTIONNISTE')],
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
