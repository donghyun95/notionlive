/*
  Warnings:

  - You are about to drop the column `content` on the `Page` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Page" DROP COLUMN "content";

-- CreateTable
CREATE TABLE "PagePart" (
    "id" SERIAL NOT NULL,
    "pageId" INTEGER NOT NULL,
    "partNo" INTEGER NOT NULL,
    "roomId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PagePart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PagePartSnapshot" (
    "id" SERIAL NOT NULL,
    "pagePartId" INTEGER NOT NULL,
    "version" INTEGER NOT NULL,
    "contentJson" JSONB NOT NULL,
    "contentHtml" TEXT,
    "contentText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PagePartSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PagePart_roomId_key" ON "PagePart"("roomId");

-- CreateIndex
CREATE INDEX "PagePart_pageId_idx" ON "PagePart"("pageId");

-- CreateIndex
CREATE UNIQUE INDEX "PagePart_pageId_partNo_key" ON "PagePart"("pageId", "partNo");

-- CreateIndex
CREATE INDEX "PagePartSnapshot_pagePartId_idx" ON "PagePartSnapshot"("pagePartId");

-- CreateIndex
CREATE UNIQUE INDEX "PagePartSnapshot_pagePartId_version_key" ON "PagePartSnapshot"("pagePartId", "version");

-- AddForeignKey
ALTER TABLE "PagePart" ADD CONSTRAINT "PagePart_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PagePartSnapshot" ADD CONSTRAINT "PagePartSnapshot_pagePartId_fkey" FOREIGN KEY ("pagePartId") REFERENCES "PagePart"("id") ON DELETE CASCADE ON UPDATE CASCADE;
