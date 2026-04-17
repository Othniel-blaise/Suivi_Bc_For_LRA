-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PATRON', 'RECEPTIONNISTE');

-- CreateEnum
CREATE TYPE "StatutBC" AS ENUM ('TRANSMIS', 'LIVRE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'RECEPTIONNISTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BonCommande" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "fournisseur" TEXT NOT NULL,
    "imputation" TEXT NOT NULL,
    "statut" "StatutBC" NOT NULL DEFAULT 'TRANSMIS',
    "dateTransmission" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateReception" TIMESTAMP(3),
    "articlesRecus" TEXT,
    "lieuReception" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,
    "receptionnisteId" TEXT,

    CONSTRAINT "BonCommande_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "BonCommande_numero_key" ON "BonCommande"("numero");

-- AddForeignKey
ALTER TABLE "BonCommande" ADD CONSTRAINT "BonCommande_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BonCommande" ADD CONSTRAINT "BonCommande_receptionnisteId_fkey" FOREIGN KEY ("receptionnisteId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
