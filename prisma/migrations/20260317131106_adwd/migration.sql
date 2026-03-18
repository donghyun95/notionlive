/*
  Warnings:

  - You are about to drop the `PagePart` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PagePartSnapshot` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[roomId]` on the table `Page` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `roomId` to the `Page` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "PagePart" DROP CONSTRAINT "PagePart_pageId_fkey";

-- DropForeignKey
ALTER TABLE "PagePartSnapshot" DROP CONSTRAINT "PagePartSnapshot_pagePartId_fkey";

-- AlterTable
ALTER TABLE "Page" ADD COLUMN     "roomId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "password" TEXT;

-- DropTable
DROP TABLE "PagePart";

-- DropTable
DROP TABLE "PagePartSnapshot";

-- CreateTable
CREATE TABLE "PageSnapshot" (
    "id" SERIAL NOT NULL,
    "pageId" INTEGER NOT NULL,
    "version" INTEGER NOT NULL,
    "contentJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PageSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PageSnapshot_pageId_idx" ON "PageSnapshot"("pageId");

-- CreateIndex
CREATE UNIQUE INDEX "PageSnapshot_pageId_version_key" ON "PageSnapshot"("pageId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "Page_roomId_key" ON "Page"("roomId");

-- AddForeignKey
ALTER TABLE "PageSnapshot" ADD CONSTRAINT "PageSnapshot_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;
