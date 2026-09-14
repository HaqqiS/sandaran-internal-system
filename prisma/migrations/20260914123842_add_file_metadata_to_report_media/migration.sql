-- AlterTable
ALTER TABLE "ReportMedia" ADD COLUMN     "fileName" TEXT,
ADD COLUMN     "fileSize" INTEGER,
ADD COLUMN     "mimeType" TEXT,
ADD COLUMN     "resourceType" TEXT NOT NULL DEFAULT 'image';
