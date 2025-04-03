/*
  Warnings:

  - You are about to drop the column `localID` on the `Character` table. All the data in the column will be lost.
  - You are about to drop the column `ownerID` on the `Character` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `Character_localID_idx` ON `Character`;

-- AlterTable
ALTER TABLE `Character` DROP COLUMN `localID`,
    DROP COLUMN `ownerID`;
