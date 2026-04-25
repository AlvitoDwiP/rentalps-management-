const prisma = require("../../lib/prisma");
const { normalizeDecimalFields } = require("../../utils/normalizeDecimal");

const JAKARTA_OFFSET_MS = 7 * 60 * 60 * 1000;
const DAY_LABELS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

function getJakartaDateParts(date = new Date()) {
  const jakartaDate = new Date(date.getTime() + JAKARTA_OFFSET_MS);

  return {
    year: jakartaDate.getUTCFullYear(),
    month: jakartaDate.getUTCMonth(),
    date: jakartaDate.getUTCDate(),
    day: jakartaDate.getUTCDay(),
  };
}

function getJakartaDayRange(date = new Date()) {
  const { year, month, date: dayOfMonth } = getJakartaDateParts(date);

  return {
    startUtc: new Date(
      Date.UTC(year, month, dayOfMonth, 0, 0, 0, 0) - JAKARTA_OFFSET_MS,
    ),
    endUtc: new Date(
      Date.UTC(year, month, dayOfMonth + 1, 0, 0, 0, 0) - JAKARTA_OFFSET_MS,
    ),
  };
}

function getJakartaMonthRange(date = new Date()) {
  const { year, month } = getJakartaDateParts(date);

  return {
    startUtc: new Date(Date.UTC(year, month, 1, 0, 0, 0, 0) - JAKARTA_OFFSET_MS),
    endUtc: new Date(
      Date.UTC(year, month + 1, 1, 0, 0, 0, 0) - JAKARTA_OFFSET_MS,
    ),
  };
}

function formatJakartaDate(date = new Date()) {
  const { year, month, date: dayOfMonth } = getJakartaDateParts(date);

  return `${year}-${String(month + 1).padStart(2, "0")}-${String(dayOfMonth).padStart(2, "0")}`;
}

function getShortTransactionCode(transaction) {
  const numericPart = String(transaction?.invoiceNumber || "").replace(/\D/g, "");

  if (numericPart.length >= 3) {
    return numericPart.slice(-3);
  }

  return String(transaction?.id || "").replace(/-/g, "").slice(0, 3).toUpperCase();
}

function toNumber(value) {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function calculateOpenEstimate(transaction, now = Date.now()) {
  const startTime = new Date(transaction.startTime).getTime();
  const elapsedSeconds = Math.max(0, Math.floor((now - startTime) / 1000));
  const hourlyRate = toNumber(transaction.hourlyRateSnapshot);

  if (!elapsedSeconds || !hourlyRate) {
    return 0;
  }

  return Math.ceil((hourlyRate / 3600) * elapsedSeconds);
}

function calculateActiveRevenueEstimate(transactions = [], now = Date.now()) {
  return transactions.reduce((sum, transaction) => {
    const rentalEstimate =
      transaction.pricingType === "OPEN"
        ? calculateOpenEstimate(transaction, now)
        : toNumber(transaction.packagePriceSnapshot ?? transaction.rentalTotal);

    return sum + rentalEstimate + toNumber(transaction.productTotal);
  }, 0);
}

async function getRevenueLast7Days(now = new Date()) {
  const items = [];

  for (let offset = 6; offset >= 0; offset -= 1) {
    const currentDate = new Date(now.getTime() - offset * 24 * 60 * 60 * 1000);
    const { startUtc, endUtc } = getJakartaDayRange(currentDate);
    const revenueResult = await prisma.transaction.aggregate({
      where: {
        status: "COMPLETED",
        endTime: {
          gte: startUtc,
          lt: endUtc,
        },
      },
      _sum: {
        grandTotal: true,
      },
    });

    const parts = getJakartaDateParts(currentDate);
    items.push({
      label: DAY_LABELS[parts.day],
      date: formatJakartaDate(currentDate),
      revenue: toNumber(revenueResult._sum.grandTotal),
    });
  }

  return items;
}

async function getTopProducts() {
  const groupedItems = await prisma.transactionItem.groupBy({
    by: ["productId", "productNameSnapshot"],
    where: {
      transaction: {
        status: "COMPLETED",
      },
    },
    _sum: {
      quantity: true,
      subtotalSnapshot: true,
    },
    orderBy: {
      _sum: {
        quantity: "desc",
      },
    },
    take: 5,
  });

  return normalizeDecimalFields(groupedItems).map((item) => ({
    id: item.productId,
    name: item.productNameSnapshot,
    quantitySold: toNumber(item._sum.quantity),
    revenue: toNumber(item._sum.subtotalSnapshot),
  }));
}

async function getRecentTransactions() {
  const transactions = await prisma.transaction.findMany({
    where: {
      status: {
        in: ["ACTIVE", "COMPLETED"],
      },
    },
    select: {
      id: true,
      invoiceNumber: true,
      pricingType: true,
      status: true,
      grandTotal: true,
      endTime: true,
      updatedAt: true,
      playStationUnit: {
        select: {
          code: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: 5,
  });

  return transactions.map((transaction) => ({
    id: transaction.id,
    shortCode: getShortTransactionCode(transaction),
    consoleCode: transaction.playStationUnit?.code || "-",
    pricingType: transaction.pricingType,
    status: transaction.status,
    grandTotal: toNumber(transaction.grandTotal),
    endTime: transaction.endTime,
  }));
}

async function getCriticalProducts() {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      stock: {
        lte: 5,
      },
    },
    orderBy: [{ stock: "asc" }, { name: "asc" }],
    take: 5,
    select: {
      id: true,
      name: true,
      stock: true,
    },
  });

  return products.map((product) => ({
    id: product.id,
    name: product.name,
    stock: toNumber(product.stock),
  }));
}

async function getAdminDashboardData() {
  const now = new Date();
  const todayRange = getJakartaDayRange(now);
  const monthRange = getJakartaMonthRange(now);

  const [
    todayAggregate,
    monthAggregate,
    criticalStockCount,
    consoleStatusCounts,
    activeTransactions,
    revenueLast7Days,
    topProducts,
    recentTransactions,
    criticalProducts,
  ] = await Promise.all([
    prisma.transaction.aggregate({
      where: {
        status: "COMPLETED",
        endTime: {
          gte: todayRange.startUtc,
          lt: todayRange.endUtc,
        },
      },
      _sum: {
        grandTotal: true,
      },
    }),
    prisma.transaction.aggregate({
      where: {
        status: "COMPLETED",
        endTime: {
          gte: monthRange.startUtc,
          lt: monthRange.endUtc,
        },
      },
      _sum: {
        grandTotal: true,
      },
      _count: {
        _all: true,
      },
    }),
    prisma.product.count({
      where: {
        isActive: true,
        stock: {
          lte: 5,
        },
      },
    }),
    prisma.playStationUnit.groupBy({
      by: ["status"],
      _count: {
        _all: true,
      },
    }),
    prisma.transaction.findMany({
      where: {
        status: "ACTIVE",
      },
      select: {
        pricingType: true,
        startTime: true,
        hourlyRateSnapshot: true,
        packagePriceSnapshot: true,
        rentalTotal: true,
        productTotal: true,
      },
    }),
    getRevenueLast7Days(now),
    getTopProducts(),
    getRecentTransactions(),
    getCriticalProducts(),
  ]);

  const consoleStatusMap = new Map(
    consoleStatusCounts.map((item) => [item.status, toNumber(item._count._all)]),
  );

  return {
    summary: {
      todayRevenue: toNumber(todayAggregate._sum.grandTotal),
      monthlyTransactionCount: toNumber(monthAggregate._count._all),
      monthlyRevenue: toNumber(monthAggregate._sum.grandTotal),
      criticalStockCount: toNumber(criticalStockCount),
      availableConsoleCount: consoleStatusMap.get("AVAILABLE") || 0,
      inUseConsoleCount: consoleStatusMap.get("IN_USE") || 0,
      maintenanceConsoleCount: consoleStatusMap.get("MAINTENANCE") || 0,
      activeRevenueEstimate: calculateActiveRevenueEstimate(activeTransactions),
    },
    revenueLast7Days,
    topProducts,
    recentTransactions,
    criticalProducts,
  };
}

module.exports = {
  getAdminDashboardData,
};
