-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'CASHIER');

-- CreateEnum
CREATE TYPE "ConsoleType" AS ENUM ('PS3', 'PS4', 'PS5');

-- CreateEnum
CREATE TYPE "ConsoleStatus" AS ENUM ('AVAILABLE', 'IN_USE', 'NEED_CONFIRMATION', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "PricingType" AS ENUM ('OPEN', 'PACKAGE');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ProductCategory" AS ENUM ('SNACK', 'DRINK');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayStationUnit" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "consoleType" "ConsoleType" NOT NULL,
    "status" "ConsoleStatus" NOT NULL DEFAULT 'AVAILABLE',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayStationUnit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RentalRate" (
    "id" UUID NOT NULL,
    "consoleType" "ConsoleType" NOT NULL,
    "hourlyRate" DECIMAL(10,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RentalRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RentalPackage" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "consoleType" "ConsoleType" NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RentalPackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "ProductCategory" NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" UUID NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "pricingType" "PricingType" NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'ACTIVE',
    "userId" UUID NOT NULL,
    "playStationUnitId" UUID NOT NULL,
    "rentalRateId" UUID NOT NULL,
    "rentalPackageId" UUID,
    "customerName" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "extraTimeMinutes" INTEGER NOT NULL DEFAULT 0,
    "hourlyRateSnapshot" DECIMAL(10,2) NOT NULL,
    "packagePriceSnapshot" DECIMAL(10,2),
    "packageDurationSnapshot" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransactionItem" (
    "id" UUID NOT NULL,
    "transactionId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPriceSnapshot" DECIMAL(10,2) NOT NULL,
    "subtotalSnapshot" DECIMAL(10,2) NOT NULL,
    "productNameSnapshot" TEXT NOT NULL,
    "productCategorySnapshot" "ProductCategory" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransactionItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_isActive_idx" ON "User"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "PlayStationUnit_code_key" ON "PlayStationUnit"("code");

-- CreateIndex
CREATE INDEX "PlayStationUnit_consoleType_idx" ON "PlayStationUnit"("consoleType");

-- CreateIndex
CREATE INDEX "PlayStationUnit_status_idx" ON "PlayStationUnit"("status");

-- CreateIndex
CREATE INDEX "PlayStationUnit_consoleType_status_idx" ON "PlayStationUnit"("consoleType", "status");

-- CreateIndex
CREATE UNIQUE INDEX "RentalRate_consoleType_key" ON "RentalRate"("consoleType");

-- CreateIndex
CREATE INDEX "RentalRate_isActive_idx" ON "RentalRate"("isActive");

-- CreateIndex
CREATE INDEX "RentalPackage_consoleType_idx" ON "RentalPackage"("consoleType");

-- CreateIndex
CREATE INDEX "RentalPackage_isActive_idx" ON "RentalPackage"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "RentalPackage_consoleType_name_key" ON "RentalPackage"("consoleType", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Product_code_key" ON "Product"("code");

-- CreateIndex
CREATE INDEX "Product_category_idx" ON "Product"("category");

-- CreateIndex
CREATE INDEX "Product_isActive_idx" ON "Product"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_invoiceNumber_key" ON "Transaction"("invoiceNumber");

-- CreateIndex
CREATE INDEX "Transaction_status_idx" ON "Transaction"("status");

-- CreateIndex
CREATE INDEX "Transaction_pricingType_idx" ON "Transaction"("pricingType");

-- CreateIndex
CREATE INDEX "Transaction_userId_idx" ON "Transaction"("userId");

-- CreateIndex
CREATE INDEX "Transaction_playStationUnitId_idx" ON "Transaction"("playStationUnitId");

-- CreateIndex
CREATE INDEX "Transaction_rentalRateId_idx" ON "Transaction"("rentalRateId");

-- CreateIndex
CREATE INDEX "Transaction_rentalPackageId_idx" ON "Transaction"("rentalPackageId");

-- CreateIndex
CREATE INDEX "Transaction_startTime_idx" ON "Transaction"("startTime");

-- CreateIndex
CREATE INDEX "Transaction_endTime_idx" ON "Transaction"("endTime");

-- CreateIndex
CREATE INDEX "Transaction_status_startTime_idx" ON "Transaction"("status", "startTime");

-- CreateIndex
CREATE INDEX "TransactionItem_transactionId_idx" ON "TransactionItem"("transactionId");

-- CreateIndex
CREATE INDEX "TransactionItem_productId_idx" ON "TransactionItem"("productId");

-- CreateIndex
CREATE INDEX "TransactionItem_productCategorySnapshot_idx" ON "TransactionItem"("productCategorySnapshot");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_playStationUnitId_fkey" FOREIGN KEY ("playStationUnitId") REFERENCES "PlayStationUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_rentalRateId_fkey" FOREIGN KEY ("rentalRateId") REFERENCES "RentalRate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_rentalPackageId_fkey" FOREIGN KEY ("rentalPackageId") REFERENCES "RentalPackage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionItem" ADD CONSTRAINT "TransactionItem_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionItem" ADD CONSTRAINT "TransactionItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
