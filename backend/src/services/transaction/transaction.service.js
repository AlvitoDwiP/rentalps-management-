const { Prisma } = require("@prisma/client");

const prisma = require("../../lib/prisma");
const createError = require("../../utils/createError");
const parseNumber = require("../../utils/parseNumber");
const { normalizeDecimalFields } = require("../../utils/normalizeDecimal");

function generateInvoiceNumber() {
  const timestamp = new Date().toISOString().replace(/\D/g, "").slice(0, 14);
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();

  return `TRX-${timestamp}-${suffix}`;
}

function validateExtraMinutes(extraMinutes = 0) {
  if (extraMinutes === undefined || extraMinutes === null) {
    return 0;
  }

  return parseNumber(extraMinutes, {
    fieldName: "extraMinutes",
    min: 0,
    integer: true,
    invalidMessage: "extraMinutes harus berupa bilangan bulat antara 0 sampai 6.",
  });
}

function ensureExtraMinutesRange(extraMinutes) {
  if (extraMinutes > 6) {
    throw createError("extraMinutes harus berupa bilangan bulat antara 0 sampai 6.", 400);
  }

  return extraMinutes;
}

function calculateDurationMinutes(startTime, endTime) {
  const diffMs = new Date(endTime).getTime() - new Date(startTime).getTime();

  if (diffMs <= 0) {
    return 0;
  }

  return Math.ceil(diffMs / 60000);
}

function calculateOpenRentalTotal(hourlyRateSnapshot, durationMinutes) {
  if (durationMinutes <= 0) {
    return 0;
  }

  const total = new Prisma.Decimal(hourlyRateSnapshot)
    .mul(durationMinutes)
    .div(60);

  return Math.ceil(total.toNumber());
}

function calculateProductTotal(items = []) {
  const total = items.reduce(
    (sum, item) => sum.add(new Prisma.Decimal(item.subtotalSnapshot)),
    new Prisma.Decimal(0),
  );

  return total.toNumber();
}

function enrichTransaction(transaction) {
  const expectedEndTime =
    transaction.pricingType === "PACKAGE" && transaction.packageDurationSnapshot
      ? new Date(
          new Date(transaction.startTime).getTime() +
            transaction.packageDurationSnapshot * 60000,
        )
      : null;

  return {
    ...normalizeDecimalFields(transaction),
    expectedEndTime,
  };
}

async function recalculateProductTotals(db, transactionId) {
  const items = await db.transactionItem.findMany({
    where: { transactionId },
  });
  const productTotal = calculateProductTotal(items);

  return {
    productTotal,
    items,
  };
}

async function findConsoleByIdOrCode(db, { consoleId, consoleCode }) {
  if (!consoleId && !consoleCode) {
    throw createError("consoleId atau consoleCode wajib diisi.", 400);
  }

  if (consoleId && consoleCode) {
    return db.playStationUnit.findFirst({
      where: {
        OR: [{ id: consoleId }, { code: consoleCode }],
      },
    });
  }

  if (consoleId) {
    return db.playStationUnit.findUnique({
      where: { id: consoleId },
    });
  }

  return db.playStationUnit.findUnique({
    where: { code: consoleCode },
  });
}

async function resolveUserId(db, userId) {
  if (userId) {
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.isActive) {
      throw createError("User transaksi tidak ditemukan atau sedang tidak aktif.", 404);
    }

    return user.id;
  }

  const activeAdmin =
    (await db.user.findFirst({
      where: {
        role: "ADMIN",
        isActive: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    })) ||
    (await db.user.findFirst({
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    }));

  if (!activeAdmin) {
    throw createError("Tidak ada user aktif yang bisa dipakai untuk membuat transaksi.", 500);
  }

  return activeAdmin.id;
}

async function findActiveRentalRateByConsoleType(db, consoleType) {
  const rentalRate = await db.rentalRate.findFirst({
    where: {
      consoleType,
      isActive: true,
    },
  });

  if (!rentalRate) {
    throw createError(`Rental rate aktif untuk ${consoleType} tidak ditemukan.`, 404);
  }

  return rentalRate;
}

async function findProductByIdOrName(db, { productId, productName }) {
  if (productId) {
    return db.product.findUnique({
      where: { id: productId },
    });
  }

  if (productName) {
    return db.product.findFirst({
      where: { name: productName },
    });
  }

  return null;
}

async function getTransactionById(db, transactionId) {
  const transaction = await db.transaction.findUnique({
    where: { id: transactionId },
  });

  if (!transaction) {
    return null;
  }

  const user = await db.user.findUnique({
    where: { id: transaction.userId },
  });
  const playStationUnit = await db.playStationUnit.findUnique({
    where: { id: transaction.playStationUnitId },
  });
  const rentalRate = await db.rentalRate.findUnique({
    where: { id: transaction.rentalRateId },
  });
  const rentalPackage = transaction.rentalPackageId
    ? await db.rentalPackage.findUnique({
        where: { id: transaction.rentalPackageId },
      })
    : null;
  const items = await db.transactionItem.findMany({
    where: { transactionId: transaction.id },
    orderBy: {
      createdAt: "asc",
    },
  });

  let itemsWithProducts = items;

  if (items.length > 0) {
    const products = await db.product.findMany({
      where: {
        id: {
          in: items.map((item) => item.productId),
        },
      },
    });
    const productMap = new Map(products.map((product) => [product.id, product]));

    itemsWithProducts = items.map((item) => ({
      ...item,
      product: productMap.get(item.productId) || null,
    }));
  }

  return {
    ...transaction,
    user,
    playStationUnit,
    rentalRate,
    rentalPackage,
    items: itemsWithProducts,
  };
}

function ensureConsoleAvailable(consoleUnit) {
  if (!consoleUnit) {
    throw createError("Console tidak ditemukan.", 404);
  }

  if (consoleUnit.status !== "AVAILABLE") {
    throw createError(`Console ${consoleUnit.code} sedang tidak tersedia.`, 409);
  }
}

function ensureTransactionIsActive(transaction) {
  if (!transaction) {
    throw createError("Transaksi tidak ditemukan.", 404);
  }

  if (transaction.status !== "ACTIVE") {
    throw createError("Transaksi ini tidak aktif atau sudah selesai.", 409);
  }
}

function sanitizeTransactionResponse(transaction) {
  if (!transaction) {
    return transaction;
  }

  if (!transaction.user) {
    return transaction;
  }

  const { password, ...safeUser } = transaction.user;

  return {
    ...transaction,
    user: safeUser,
  };
}

async function startOpenTransaction(payload = {}) {
  const extraMinutes = ensureExtraMinutesRange(
    validateExtraMinutes(payload.extraMinutes ?? 0),
  );

  return prisma.$transaction(async (tx) => {
    const consoleUnit = await findConsoleByIdOrCode(tx, {
      consoleId: payload.consoleId,
      consoleCode: payload.consoleCode,
    });

    ensureConsoleAvailable(consoleUnit);

    const userId = await resolveUserId(tx, payload.userId);
    const rentalRate = await findActiveRentalRateByConsoleType(
      tx,
      consoleUnit.consoleType,
    );

    const startTime = new Date(Date.now() + extraMinutes * 60000);

    await tx.playStationUnit.update({
      where: { id: consoleUnit.id },
      data: { status: "IN_USE" },
    });

    const transaction = await tx.transaction.create({
      data: {
        invoiceNumber: generateInvoiceNumber(),
        pricingType: "OPEN",
        status: "ACTIVE",
        userId,
        playStationUnitId: consoleUnit.id,
        rentalRateId: rentalRate.id,
        rentalPackageId: null,
        customerName: payload.customerName?.trim() || null,
        startTime,
        durationMinutes: null,
        extraTimeMinutes: extraMinutes,
        hourlyRateSnapshot: rentalRate.hourlyRate,
        packagePriceSnapshot: null,
        packageDurationSnapshot: null,
        rentalTotal: 0,
        productTotal: 0,
        grandTotal: 0,
      },
    });

    return sanitizeTransactionResponse(
      enrichTransaction(await getTransactionById(tx, transaction.id)),
    );
  });
}

async function startPackageTransaction(payload = {}) {
  const extraMinutes = ensureExtraMinutesRange(
    validateExtraMinutes(payload.extraMinutes ?? 0),
  );

  if (!payload.packageId) {
    throw createError("packageId wajib diisi untuk transaksi package.");
  }

  return prisma.$transaction(async (tx) => {
    const consoleUnit = await findConsoleByIdOrCode(tx, {
      consoleId: payload.consoleId,
      consoleCode: payload.consoleCode,
    });

    ensureConsoleAvailable(consoleUnit);

    const userId = await resolveUserId(tx, payload.userId);
    const rentalRate = await findActiveRentalRateByConsoleType(
      tx,
      consoleUnit.consoleType,
    );
    const rentalPackage = await tx.rentalPackage.findUnique({
      where: { id: payload.packageId },
    });

    if (!rentalPackage) {
      throw createError("Rental package tidak ditemukan.", 404);
    }

    if (!rentalPackage.isActive) {
      throw createError("Rental package sedang tidak aktif.", 409);
    }

    if (rentalPackage.consoleType !== consoleUnit.consoleType) {
      throw createError("Rental package tidak cocok dengan tipe console yang dipilih.", 409);
    }

    const startTime = new Date(Date.now() + extraMinutes * 60000);
    const packageRentalTotal = new Prisma.Decimal(rentalPackage.price).toNumber();

    await tx.playStationUnit.update({
      where: { id: consoleUnit.id },
      data: { status: "IN_USE" },
    });

    const transaction = await tx.transaction.create({
      data: {
        invoiceNumber: generateInvoiceNumber(),
        pricingType: "PACKAGE",
        status: "ACTIVE",
        userId,
        playStationUnitId: consoleUnit.id,
        rentalRateId: rentalRate.id,
        rentalPackageId: rentalPackage.id,
        customerName: payload.customerName?.trim() || null,
        startTime,
        durationMinutes: null,
        extraTimeMinutes: extraMinutes,
        hourlyRateSnapshot: rentalRate.hourlyRate,
        packagePriceSnapshot: rentalPackage.price,
        packageDurationSnapshot: rentalPackage.durationMinutes,
        rentalTotal: packageRentalTotal,
        productTotal: 0,
        grandTotal: packageRentalTotal,
      },
    });

    return sanitizeTransactionResponse(
      enrichTransaction(await getTransactionById(tx, transaction.id)),
    );
  });
}

async function finishTransaction(transactionId) {
  return prisma.$transaction(async (tx) => {
    const transaction = await getTransactionById(tx, transactionId);

    ensureTransactionIsActive(transaction);

    const endTime = new Date();
    const durationMinutes = calculateDurationMinutes(transaction.startTime, endTime);
    const rentalTotal =
      transaction.pricingType === "OPEN"
        ? calculateOpenRentalTotal(transaction.hourlyRateSnapshot, durationMinutes)
        : transaction.rentalTotal;
    const { productTotal } = await recalculateProductTotals(tx, transaction.id);
    const grandTotal = rentalTotal + productTotal;

    await tx.playStationUnit.update({
      where: { id: transaction.playStationUnitId },
      data: { status: "AVAILABLE" },
    });

    await tx.transaction.update({
      where: { id: transaction.id },
      data: {
        endTime,
        durationMinutes,
        rentalTotal,
        productTotal,
        grandTotal,
        status: "COMPLETED",
      },
    });

    return sanitizeTransactionResponse(
      enrichTransaction(await getTransactionById(tx, transaction.id)),
    );
  });
}

async function addTransactionItem(payload = {}) {
  if (!payload.transactionId) {
    throw createError("transactionId wajib diisi.");
  }

  const quantity = parseNumber(payload.quantity, {
    fieldName: "quantity",
    required: true,
    integer: true,
    min: 1,
    invalidMessage: "quantity harus berupa bilangan bulat minimal 1.",
  });

  const product = await findProductByIdOrName(prisma, {
    productId: payload.productId,
    productName: payload.productName,
  });

  if (payload.productName && !product) {
    throw createError(`Produk dengan nama "${payload.productName}" tidak ditemukan.`, 404);
  }

  if (!payload.productId && !payload.productName) {
    throw createError("productId atau productName wajib diisi.", 400);
  }

  const resolvedProductId = payload.productId || product?.id;

  if (!resolvedProductId) {
    throw createError("productId atau productName wajib diisi.", 400);
  }

  return prisma.$transaction(async (tx) => {
    const transaction = await getTransactionById(tx, payload.transactionId);
    const resolvedProduct = await tx.product.findUnique({
      where: { id: resolvedProductId },
    });

    ensureTransactionIsActive(transaction);

    if (!resolvedProduct) {
      throw createError("Produk tidak ditemukan.", 404);
    }

    if (!resolvedProduct.isActive) {
      throw createError("Produk sedang tidak aktif.", 409);
    }

    if (resolvedProduct.stock < quantity) {
      throw createError(`Stok produk ${resolvedProduct.name} tidak cukup.`, 409);
    }

    const subtotalSnapshot = new Prisma.Decimal(resolvedProduct.price).mul(quantity);

    await tx.transactionItem.create({
      data: {
        transactionId: transaction.id,
        productId: resolvedProduct.id,
        quantity,
        unitPriceSnapshot: resolvedProduct.price,
        subtotalSnapshot,
        productNameSnapshot: resolvedProduct.name,
        productCategorySnapshot: resolvedProduct.category,
      },
    });

    await tx.product.update({
      where: { id: resolvedProduct.id },
      data: {
        stock: {
          decrement: quantity,
        },
      },
    });

    const { productTotal } = await recalculateProductTotals(tx, transaction.id);
    const rentalTotal =
      transaction.pricingType === "PACKAGE" ? transaction.rentalTotal : 0;
    const grandTotal = rentalTotal + productTotal;

    await tx.transaction.update({
      where: { id: transaction.id },
      data: {
        productTotal,
        grandTotal,
      },
    });

    return sanitizeTransactionResponse(
      enrichTransaction(await getTransactionById(tx, transaction.id)),
    );
  });
}

async function moveTransactionConsole(payload = {}) {
  if (!payload.transactionId) {
    throw createError("transactionId wajib diisi.");
  }

  return prisma.$transaction(async (tx) => {
    const transaction = await getTransactionById(tx, payload.transactionId);

    ensureTransactionIsActive(transaction);

    const targetConsole = await findConsoleByIdOrCode(tx, {
      consoleId: payload.targetConsoleId,
      consoleCode: payload.targetConsoleCode,
    });

    if (!targetConsole) {
      throw createError("Console tujuan tidak ditemukan.", 404);
    }

    if (targetConsole.id === transaction.playStationUnitId) {
      throw createError("Console tujuan sama dengan console yang sedang dipakai.");
    }

    if (targetConsole.status !== "AVAILABLE") {
      throw createError(`Console tujuan ${targetConsole.code} sedang tidak tersedia.`, 409);
    }

    if (targetConsole.consoleType !== transaction.playStationUnit.consoleType) {
      throw createError(
        "Pindah console beda tipe belum diizinkan agar snapshot harga tetap adil.",
        409,
      );
    }

    await tx.playStationUnit.update({
      where: { id: transaction.playStationUnitId },
      data: { status: "AVAILABLE" },
    });

    await tx.playStationUnit.update({
      where: { id: targetConsole.id },
      data: { status: "IN_USE" },
    });

    await tx.transaction.update({
      where: { id: transaction.id },
      data: {
        playStationUnitId: targetConsole.id,
      },
    });

    return sanitizeTransactionResponse(
      enrichTransaction(await getTransactionById(tx, transaction.id)),
    );
  });
}

async function getActiveTransactions() {
  const transactions = await prisma.transaction.findMany({
    where: {
      status: "ACTIVE",
    },
    orderBy: {
      startTime: "asc",
    },
  });

  const hydratedTransactions = [];

  for (const transaction of transactions) {
    hydratedTransactions.push(await getTransactionById(prisma, transaction.id));
  }

  return hydratedTransactions.map((transaction) =>
    sanitizeTransactionResponse(enrichTransaction(transaction)),
  );
}

module.exports = {
  startOpenTransaction,
  startPackageTransaction,
  finishTransaction,
  addTransactionItem,
  moveTransactionConsole,
  getActiveTransactions,
};
