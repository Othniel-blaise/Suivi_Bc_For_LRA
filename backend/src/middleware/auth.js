export async function authenticate(request, reply) {
  try {
    await request.jwtVerify();
    const user = await request.server.prisma.user.findUnique({
      where: { id: request.user.id },
      select: { id: true, username: true, nom: true, role: true },
    });
    if (!user) {
      return reply.status(401).send({ error: 'Utilisateur introuvable' });
    }
    request.currentUser = user;
  } catch (err) {
    reply.status(401).send({ error: 'Token invalide ou expiré' });
  }
}

export function requireRole(...roles) {
  return async (request, reply) => {
    if (!request.currentUser) {
      return reply.status(401).send({ error: 'Non authentifié' });
    }
    if (!roles.includes(request.currentUser.role)) {
      return reply.status(403).send({ error: 'Accès refusé : rôle insuffisant' });
    }
  };
}
