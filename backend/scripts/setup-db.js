import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setup() {
  console.log('[setup-db] Vérification du schéma...');

  // 1. Créer TypeReception si absent (DO block = safe si déjà existant)
  await prisma.$executeRawUnsafe(`
    DO $$ BEGIN
      CREATE TYPE "TypeReception" AS ENUM ('TOTAL', 'PARTIEL');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$
  `);

  // 2. Ajouter valeurs enum StatutBC — doit être HORS transaction (appel direct)
  await prisma.$executeRawUnsafe(
    `ALTER TYPE "StatutBC" ADD VALUE IF NOT EXISTS 'RECU_BASE'`
  );
  await prisma.$executeRawUnsafe(
    `ALTER TYPE "StatutBC" ADD VALUE IF NOT EXISTS 'EN_LIVRAISON'`
  );

  // 3. Ajouter les colonnes manquantes (idempotent)
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "BonCommande"
      ADD COLUMN IF NOT EXISTS "numeroDA"            TEXT,
      ADD COLUMN IF NOT EXISTS "dateReceptionBase"   TIMESTAMP(3),
      ADD COLUMN IF NOT EXISTS "lieuBase"            TEXT,
      ADD COLUMN IF NOT EXISTS "typeReceptionBase"   "TypeReception",
      ADD COLUMN IF NOT EXISTS "observationsBase"    TEXT,
      ADD COLUMN IF NOT EXISTS "agentLivreur"        TEXT,
      ADD COLUMN IF NOT EXISTS "lieuDestination"     TEXT,
      ADD COLUMN IF NOT EXISTS "dateLivraison"       TIMESTAMP(3),
      ADD COLUMN IF NOT EXISTS "typeReceptionFinale" "TypeReception",
      ADD COLUMN IF NOT EXISTS "observationsFinales" TEXT
  `);

  console.log('[setup-db] Schéma OK.');
  await prisma.$disconnect();
}

setup().catch((e) => {
  console.error('[setup-db] ERREUR:', e.message);
  process.exit(1);
});
