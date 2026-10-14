-- AlterTable
ALTER TABLE "Project" ADD COLUMN "shortId" TEXT,
ADD COLUMN "storageKey" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Project_shortId_key" ON "Project"("shortId");

-- CreateIndex
CREATE UNIQUE INDEX "Project_storageKey_key" ON "Project"("storageKey");
