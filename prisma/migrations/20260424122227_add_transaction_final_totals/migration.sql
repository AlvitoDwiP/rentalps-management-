-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "durationMinutes" INTEGER,
ADD COLUMN     "grandTotal" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "productTotal" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "rentalTotal" INTEGER NOT NULL DEFAULT 0;
