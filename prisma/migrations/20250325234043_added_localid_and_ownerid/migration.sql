/*
  Warnings:

  - The primary key for the `Character` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `system` on the `Character` table. All the data in the column will be lost.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `localID` to the `Character` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Character` DROP PRIMARY KEY,
    DROP COLUMN `system`,
    ADD COLUMN `localID` VARCHAR(191) NOT NULL,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `ownerID` VARCHAR(191) NOT NULL,
    MODIFY `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `User` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- CreateIndex
CREATE INDEX `Character_localID_idx` ON `Character`(`localID`);
