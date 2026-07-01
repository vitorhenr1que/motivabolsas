-- CreateTable
CREATE TABLE `Address` (
    `id` VARCHAR(191) NOT NULL,
    `street` VARCHAR(191) NOT NULL,
    `number` VARCHAR(191) NOT NULL,
    `complement` VARCHAR(191) NULL,
    `neighborhood` VARCHAR(191) NOT NULL,
    `uf` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `cep` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,

    INDEX `Address_city_idx`(`city` ASC),
    INDEX `Address_uf_idx`(`uf` ASC),
    INDEX `Address_userId_fkey`(`userId` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Contract` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `version` INTEGER NOT NULL DEFAULT 1,
    `status` ENUM('DRAFT', 'SENT', 'SIGNED', 'REFUSED', 'EXPIRED') NOT NULL DEFAULT 'DRAFT',
    `pdfUrl` VARCHAR(191) NOT NULL,
    `pdfHash` VARCHAR(191) NULL,
    `signedPdfUrl` VARCHAR(191) NULL,
    `signedPdfHash` VARCHAR(191) NULL,
    `signedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Contract_userId_idx`(`userId` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ContractEvent` (
    `id` VARCHAR(191) NOT NULL,
    `contractId` VARCHAR(191) NOT NULL,
    `type` ENUM('VIEWED', 'CONSENTED', 'SIGNED', 'REFUSED') NOT NULL,
    `metadata` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ContractEvent_contractId_idx`(`contractId` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ContractSignature` (
    `id` VARCHAR(191) NOT NULL,
    `contractId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `evidenceId` VARCHAR(191) NOT NULL,
    `signedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ip` VARCHAR(191) NULL,
    `userAgent` VARCHAR(191) NULL,
    `consentText` VARCHAR(191) NOT NULL,
    `evidence` JSON NOT NULL,
    `originalPdfHash` VARCHAR(191) NOT NULL,
    `signedPdfHash` VARCHAR(191) NOT NULL,

    INDEX `ContractSignature_contractId_idx`(`contractId` ASC),
    UNIQUE INDEX `ContractSignature_evidenceId_key`(`evidenceId` ASC),
    INDEX `ContractSignature_userId_idx`(`userId` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `cpf` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NOT NULL,
    `birthDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `currentPayment` BOOLEAN NOT NULL DEFAULT false,
    `phone` VARCHAR(191) NOT NULL,
    `tokenExpiration` VARCHAR(191) NULL,
    `token` VARCHAR(191) NULL,
    `firstPayment` BOOLEAN NOT NULL DEFAULT false,
    `course` VARCHAR(191) NULL,
    `discount` VARCHAR(191) NULL,
    `instituition` VARCHAR(191) NULL,
    `renovacao` INTEGER NULL DEFAULT 0,

    INDEX `User_course_idx`(`course` ASC),
    UNIQUE INDEX `User_cpf_key`(`cpf` ASC),
    INDEX `User_createdAt_idx`(`createdAt` ASC),
    INDEX `User_currentPayment_idx`(`currentPayment` ASC),
    UNIQUE INDEX `User_customerId_key`(`customerId` ASC),
    UNIQUE INDEX `User_email_key`(`email` ASC),
    INDEX `User_renovacao_idx`(`renovacao` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

