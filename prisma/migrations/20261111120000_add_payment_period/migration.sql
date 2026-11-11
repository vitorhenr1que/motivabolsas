CREATE TABLE `PaymentPeriod` (
    `codigoSolicitacao` VARCHAR(191) NOT NULL,
    `period` VARCHAR(6) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`codigoSolicitacao`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
