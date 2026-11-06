CREATE TABLE `CaptureSettings` (
    `id` VARCHAR(191) NOT NULL DEFAULT 'global',
    `period` VARCHAR(6) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
