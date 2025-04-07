/*
  Warnings:

  - You are about to drop the column `refresh_token` on the `Device` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[api_key]` on the table `Device` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `api_key` to the `Device` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Device_refresh_token_key` ON `Device`;

-- AlterTable
ALTER TABLE `Device` DROP COLUMN `refresh_token`,
    ADD COLUMN `api_key` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Device_api_key_key` ON `Device`(`api_key`);
