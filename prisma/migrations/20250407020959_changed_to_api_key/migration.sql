/*
  Warnings:

  - Added the required column `token_expires` to the `Device` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Device` ADD COLUMN `token_expires` DATETIME(3) NOT NULL;
