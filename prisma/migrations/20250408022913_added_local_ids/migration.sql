/*
  Warnings:

  - Added the required column `local_id` to the `Character` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Character_user_id_key` ON `Character`;

-- AlterTable
ALTER TABLE `Character` ADD COLUMN `local_id` VARCHAR(191) NOT NULL;
