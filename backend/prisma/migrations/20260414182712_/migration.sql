-- DropIndex
DROP INDEX `BonCommande_createdById_fkey` ON `boncommande`;

-- DropIndex
DROP INDEX `BonCommande_receptionnisteId_fkey` ON `boncommande`;

-- AddForeignKey
ALTER TABLE `BonCommande` ADD CONSTRAINT `BonCommande_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BonCommande` ADD CONSTRAINT `BonCommande_receptionnisteId_fkey` FOREIGN KEY (`receptionnisteId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
