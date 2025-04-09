/*
  Warnings:

  - A unique constraint covering the columns `[local_id,user_id]` on the table `Character` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Character_local_id_user_id_key` ON `Character`(`local_id`, `user_id`);
