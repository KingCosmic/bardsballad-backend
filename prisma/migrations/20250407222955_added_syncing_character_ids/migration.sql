-- DropForeignKey
ALTER TABLE `Character` DROP FOREIGN KEY `Character_user_id_fkey`;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `synced_characters` JSON NOT NULL;
