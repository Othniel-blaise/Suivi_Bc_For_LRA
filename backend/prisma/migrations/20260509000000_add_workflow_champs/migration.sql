-- CreateEnum TypeReception (idempotent)
DO $$ BEGIN
  CREATE TYPE "TypeReception" AS ENUM ('TOTAL', 'PARTIEL');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- AlterEnum StatutBC : ajoute RECU_BASE et EN_LIVRAISON (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'StatutBC' AND e.enumlabel = 'RECU_BASE'
  ) THEN
    CREATE TYPE "StatutBC_new" AS ENUM ('TRANSMIS', 'RECU_BASE', 'EN_LIVRAISON', 'LIVRE');
    ALTER TABLE "BonCommande" ALTER COLUMN "statut" TYPE "StatutBC_new" USING ("statut"::text::"StatutBC_new");
    DROP TYPE "StatutBC";
    ALTER TYPE "StatutBC_new" RENAME TO "StatutBC";
  END IF;
END $$;

-- AlterTable BonCommande (idempotent)
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
  ADD COLUMN IF NOT EXISTS "observationsFinales" TEXT;
