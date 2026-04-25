-- AlterTable
ALTER TABLE "Transaction"
ADD COLUMN "packageNameSnapshot" TEXT,
ADD COLUMN "packageDurationMinutesSnapshot" INTEGER;

-- Backfill existing package transactions from the current snapshot/relation fields.
UPDATE "Transaction" AS t
SET
  "packageNameSnapshot" = COALESCE(t."packageNameSnapshot", rp."name"),
  "packageDurationMinutesSnapshot" = COALESCE(
    t."packageDurationMinutesSnapshot",
    t."packageDurationSnapshot",
    rp."durationMinutes"
  )
FROM "RentalPackage" AS rp
WHERE t."rentalPackageId" = rp."id";
