-- AlterTable
ALTER TABLE "User"
ADD COLUMN "deletedAt" TIMESTAMP(3);

-- Index for filtering active non-deleted users in admin screens/auth checks.
CREATE INDEX "User_deletedAt_idx" ON "User"("deletedAt");
