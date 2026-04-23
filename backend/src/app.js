import Fastify from 'fastify';
import fastifyJwt from '@fastify/jwt';
import fastifyCors from '@fastify/cors';
import fastifyMultipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import prismaPlugin from './plugins/prisma.js';
import authRoutes from './routes/auth.js';
import bonsCommandeRoutes from './routes/bons-commande.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const fastify = Fastify({ logger: true });

// Plugins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:19000',
  'http://localhost:19001',
  'http://localhost:19006',
  /^http:\/\/192\.168\./,
  /^exp:\/\//,
];

// Ajouter l'URL Vercel (ou autre frontend) définie dans les variables d'env
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

await fastify.register(fastifyCors, {
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

await fastify.register(fastifyJwt, {
  secret: process.env.JWT_SECRET || 'suivi_bc_jwt_secret_32chars_minimum_xyz',
});

await fastify.register(fastifyMultipart, {
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
});

await fastify.register(fastifyStatic, {
  root: join(__dirname, '../uploads'),
  prefix: '/uploads/',
});

await fastify.register(prismaPlugin);

// Routes
await fastify.register(authRoutes, { prefix: '/api/auth' });
await fastify.register(bonsCommandeRoutes, { prefix: '/api/bons-commande' });

// Health check
fastify.get('/api/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

// Démarrage
const PORT = parseInt(process.env.PORT || '3001', 10);

try {
  await fastify.listen({ port: PORT, host: '0.0.0.0' });
  console.log(`\n🚀 Backend démarré sur http://localhost:${PORT}`);
  console.log(`   → Health: http://localhost:${PORT}/api/health`);
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
