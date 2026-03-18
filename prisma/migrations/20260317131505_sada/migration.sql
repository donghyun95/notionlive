/*
  Warnings:

  - You are about to drop the column `roomId` on the `Page` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Page_roomId_key";

-- AlterTable
ALTER TABLE "Page" DROP COLUMN "roomId";
