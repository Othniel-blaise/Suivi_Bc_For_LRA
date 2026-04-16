import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { authenticate } from '../middleware/auth.js';

const loginSchema = z.object({
  username: z.string().min(1, 'Identifiant requis'),
  password: z.string().min(1, 'Mot de passe requis'),
});

export default async function authRoutes(fastify) {
  // POST /api/auth/login
  fastify.post('/login', async (request, reply) => {
    const result = loginSchema.safeParse(request.body);
    if (!result.success) {
      return reply.status(400).send({ error: result.error.errors[0].message });
    }

    const { username, password } = result.data;

    const user = await fastify.prisma.user.findUnique({ where: { username } });
    if (!user) {
      return reply.status(401).send({ error: 'Identifiants incorrects' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return reply.status(401).send({ error: 'Identifiants incorrects' });
    }

    const token = fastify.jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      { expiresIn: '7d' }
    );

    return reply.send({
      token,
      user: { id: user.id, username: user.username, nom: user.nom, role: user.role },
    });
  });

  // GET /api/auth/me
  fastify.get('/me', { preHandler: authenticate }, async (request, reply) => {
    return reply.send({ user: request.currentUser });
  });
}
