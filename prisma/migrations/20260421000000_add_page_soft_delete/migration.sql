-- AlterTable
ALTER TABLE "Page"
ADD COLUMN "deletedAt" TIMESTAMP(3),
ADD COLUMN "deletedBy" TEXT;

-- CreateIndex
CREATE INDEX "Page_deletedBy_idx" ON "Page"("deletedBy");

-- CreateIndex
CREATE INDEX "Page_workspaceId_parentId_order_deletedAt_idx" ON "Page"("workspaceId", "parentId", "order", "deletedAt");

-- AddForeignKey
ALTER TABLE "Page"
ADD CONSTRAINT "Page_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
