/*
  Warnings:

  - You are about to drop the column `objet` on the `boncommande` table. All the data in the column will be lost.
  - You are about to drop the column `photoUrl` on the `boncommande` table. All the data in the column will be lost.
  - Added the required column `imputation` to the `BonCommande` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `BonCommande_createdById_fkey` ON `boncommande`;

-- DropIndex
DROP INDEX `BonCommande_receptionnisteId_fkey` ON `boncommande`;

-- AlterTable
ALTER TABLE `boncommande` DROP COLUMN `objet`,
    DROP COLUMN `photoUrl`,
    ADD COLUMN `imputation` VARCHAR(191) NOT NULL,
    ADD COLUMN `lieuReception` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `BonCommande` ADD CONSTRAINT `BonCommande_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BonCommande` ADD CONSTRAINT `BonCommande_receptionnisteId_fkey` FOREIGN KEY (`receptionnisteId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
