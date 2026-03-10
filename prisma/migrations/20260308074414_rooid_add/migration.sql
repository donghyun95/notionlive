/*
  Warnings:

  - Added the required column `roomId` to the `PagePartSnapshot` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Page" DROP CONSTRAINT "Page_parentId_fkey";

-- AlterTable
ALTER TABLE "PagePartSnapshot" ADD COLUMN     "roomId" TEXT NOT NULL;
