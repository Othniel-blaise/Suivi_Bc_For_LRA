-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `nom` VARCHAR(191) NOT NULL,
    `role` ENUM('PATRON', 'RECEPTIONNISTE') NOT NULL DEFAULT 'RECEPTIONNISTE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BonCommande` (
    `id` VARCHAR(191) NOT NULL,
    `numero` VARCHAR(191) NOT NULL,
    `fournisseur` VARCHAR(191) NOT NULL,
    `objet` VARCHAR(191) NOT NULL,
    `statut` ENUM('TRANSMIS', 'LIVRE') NOT NULL DEFAULT 'TRANSMIS',
    `dateTransmission` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dateReception` DATETIME(3) NULL,
    `articlesRecus` TEXT NULL,
    `photoUrl` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` VARCHAR(191) NOT NULL,
    `receptionnisteId` VARCHAR(191) NULL,

    UNIQUE INDEX `BonCommande_numero_key`(`numero`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `BonCommande` ADD CONSTRAINT `BonCommande_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BonCommande` ADD CONSTRAINT `BonCommande_receptionnisteId_fkey` FOREIGN KEY (`receptionnisteId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
