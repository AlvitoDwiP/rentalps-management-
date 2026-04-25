const { Prisma } = require("@prisma/client");

const prisma = require("../lib/prisma");

function generateInvoiceNumber() {
  const timestamp = new Date().toISOString().replace(/\D/g, "").slice(0, 14);
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();

  return `TRX-${timestamp}-${suffix}`;
}

function validateExtraMinutes(extraMinutes = 0) {
  if (!Number.isInteger(extraMinutes) || extraMinutes < 0 || extraMinutes > 6) {
    throw new Error("extraMinutes harus berupa bilangan bulat antara 0 sampai 6.");
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

function convertDecimals(value) {
  if (value instanceof Prisma.Decimal) {
    return value.toNumber();
  }

  if (Array.isArray(value)) {
    return value.map(convertDecimals);
  }

  if (value && typeof value === "object" && !(value instanceof Date)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, itemValue]) => [key, convertDecimals(itemValue)]),
    );
  }

  return value;
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
    ...convertDecimals(transaction),
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
    throw new Error("consoleId atau consoleCode wajib diisi.");
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
      throw new Error("User transaksi tidak ditemukan atau sedang tidak aktif.");
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
    throw new Error("Tidak ada user aktif yang bisa dipakai untuk membuat transaksi.");
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
    throw new Error(`Rental rate aktif untuk ${consoleType} tidak ditemukan.`);
  }

  return rentalRate;
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
    throw new Error("Console tidak ditemukan.");
  }

  if (consoleUnit.status !== "AVAILABLE") {
    throw new Error(`Console ${consoleUnit.code} sedang tidak tersedia.`);
  }
}

function ensureTransactionIsActive(transaction) {
  if (!transaction) {
    throw new Error("Transaksi tidak ditemukan.");
  }

  if (transaction.status !== "ACTIVE") {
    throw new Error("Transaksi ini tidak aktif atau sudah selesai.");
  }
}

async function startOpenTransaction(payload = {}) {
  const extraMinutes = validateExtraMinutes(payload.extraMinutes ?? 0);

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

    return enrichTransaction(await getTransactionById(tx, transaction.id));
  });
}

async function startPackageTransaction(payload = {}) {
  const extraMinutes = validateExtraMinutes(payload.extraMinutes ?? 0);

  if (!payload.packageId) {
    throw new Error("packageId wajib diisi untuk transaksi package.");
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
      throw new Error("Rental package tidak ditemukan.");
    }

    if (!rentalPackage.isActive) {
      throw new Error("Rental package sedang tidak aktif.");
    }

    if (rentalPackage.consoleType !== consoleUnit.consoleType) {
      throw new Error("Rental package tidak cocok dengan tipe console yang dipilih.");
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

    return enrichTransaction(await getTransactionById(tx, transaction.id));
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

    return enrichTransaction(await getTransactionById(tx, transaction.id));
  });
}

async function addTransactionItem(payload = {}) {
  if (!payload.transactionId) {
    throw new Error("transactionId wajib diisi.");
  }

  if (!payload.productId) {
    throw new Error("productId wajib diisi.");
  }

  if (!Number.isInteger(payload.quantity) || payload.quantity < 1) {
    throw new Error("quantity harus berupa bilangan bulat minimal 1.");
  }

  return prisma.$transaction(async (tx) => {
    const transaction = await getTransactionById(tx, payload.transactionId);
    const product = await tx.product.findUnique({
      where: { id: payload.productId },
    });

    ensureTransactionIsActive(transaction);

    if (!product) {
      throw new Error("Produk tidak ditemukan.");
    }

    if (!product.isActive) {
      throw new Error("Produk sedang tidak aktif.");
    }

    if (product.stock < payload.quantity) {
      throw new Error(`Stok produk ${product.name} tidak cukup.`);
    }

    const subtotalSnapshot = new Prisma.Decimal(product.price).mul(payload.quantity);

    await tx.transactionItem.create({
      data: {
        transactionId: transaction.id,
        productId: product.id,
        quantity: payload.quantity,
        unitPriceSnapshot: product.price,
        subtotalSnapshot,
        productNameSnapshot: product.name,
        productCategorySnapshot: product.category,
      },
    });

    await tx.product.update({
      where: { id: product.id },
      data: {
        stock: {
          decrement: payload.quantity,
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

    return enrichTransaction(await getTransactionById(tx, transaction.id));
  });
}

async function moveTransactionConsole(payload = {}) {
  if (!payload.transactionId) {
    throw new Error("transactionId wajib diisi.");
  }

  return prisma.$transaction(async (tx) => {
    const transaction = await getTransactionById(tx, payload.transactionId);

    ensureTransactionIsActive(transaction);

    const targetConsole = await findConsoleByIdOrCode(tx, {
      consoleId: payload.targetConsoleId,
      consoleCode: payload.targetConsoleCode,
    });

    if (!targetConsole) {
      throw new Error("Console tujuan tidak ditemukan.");
    }

    if (targetConsole.id === transaction.playStationUnitId) {
      throw new Error("Console tujuan sama dengan console yang sedang dipakai.");
    }

    if (targetConsole.status !== "AVAILABLE") {
      throw new Error(`Console tujuan ${targetConsole.code} sedang tidak tersedia.`);
    }

    if (targetConsole.consoleType !== transaction.playStationUnit.consoleType) {
      throw new Error("Pindah console beda tipe belum diizinkan agar snapshot harga tetap adil.");
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

    return enrichTransaction(await getTransactionById(tx, transaction.id));
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

  return hydratedTransactions.map((transaction) => enrichTransaction(transaction));
}

module.exports = {
  startOpenTransaction,
  startPackageTransaction,
  finishTransaction,
  addTransactionItem,
  moveTransactionConsole,
  getActiveTransactions,
};
