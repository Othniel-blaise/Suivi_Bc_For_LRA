-- CreateEnum
CREATE TYPE "TypeReception" AS ENUM ('TOTAL', 'PARTIEL');

-- AlterEnum: remplace l'enum entier pour ajouter RECU_BASE et EN_LIVRAISON
BEGIN;
CREATE TYPE "StatutBC_new" AS ENUM ('TRANSMIS', 'RECU_BASE', 'EN_LIVRAISON', 'LIVRE');
ALTER TABLE "BonCommande" ALTER COLUMN "statut" TYPE "StatutBC_new" USING ("statut"::text::"StatutBC_new");
DROP TYPE "StatutBC";
ALTER TYPE "StatutBC_new" RENAME TO "StatutBC";
COMMIT;

-- AlterTable
ALTER TABLE "BonCommande"
  ADD COLUMN "numeroDA"            TEXT,
  ADD COLUMN "dateReceptionBase"   TIMESTAMP(3),
  ADD COLUMN "lieuBase"            TEXT,
  ADD COLUMN "typeReceptionBase"   "TypeReception",
  ADD COLUMN "observationsBase"    TEXT,
  ADD COLUMN "agentLivreur"        TEXT,
  ADD COLUMN "lieuDestination"     TEXT,
  ADD COLUMN "dateLivraison"       TIMESTAMP(3),
  ADD COLUMN "typeReceptionFinale" "TypeReception",
  ADD COLUMN "observationsFinales" TEXT;
