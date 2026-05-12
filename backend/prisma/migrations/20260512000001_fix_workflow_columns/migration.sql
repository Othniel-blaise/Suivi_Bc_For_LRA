-- Crée l'enum TypeReception si absent
DO $$ BEGIN
  CREATE TYPE "TypeReception" AS ENUM ('TOTAL', 'PARTIEL');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Ajoute RECU_BASE et EN_LIVRAISON à StatutBC si absents
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'StatutBC' AND e.enumlabel = 'RECU_BASE'
  ) THEN
    ALTER TYPE "StatutBC" ADD VALUE 'RECU_BASE' BEFORE 'LIVRE';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'StatutBC' AND e.enumlabel = 'EN_LIVRAISON'
  ) THEN
    ALTER TYPE "StatutBC" ADD VALUE 'EN_LIVRAISON' BEFORE 'LIVRE';
  END IF;
END $$;

-- Ajoute les colonnes manquantes (idempotent)
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
