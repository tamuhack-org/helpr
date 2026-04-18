/*
  Warnings:

  - A unique constraint covering the columns `[discordId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "User_emailVerified_key";

-- CreateIndex
CREATE UNIQUE INDEX "User_discordId_key" ON "User"("discordId");
