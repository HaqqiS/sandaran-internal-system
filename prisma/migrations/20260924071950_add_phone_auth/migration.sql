-- DropForeignKey
ALTER TABLE "LogisticTransaction" DROP CONSTRAINT "LogisticTransaction_itemId_fkey";

-- AddForeignKey
ALTER TABLE "LogisticTransaction" ADD CONSTRAINT "LogisticTransaction_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "LogisticItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
