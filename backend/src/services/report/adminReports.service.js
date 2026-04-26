const prisma = require("../../lib/prisma");
const { normalizeDecimalFields } = require("../../utils/normalizeDecimal");
const createError = require("../../utils/createError");

const JAKARTA_OFFSET_MS = 7 * 60 * 60 * 1000;

function toNumber(value) {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getJakartaDateParts(date = new Date()) {
  const jakartaDate = new Date(date.getTime() + JAKARTA_OFFSET_MS);

  return {
    year: jakartaDate.getUTCFullYear(),
    month: jakartaDate.getUTCMonth(),
    date: jakartaDate.getUTCDate(),
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

function parseJakartaDateString(value, fieldName) {
  if (!value) {
    return null;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw createError(`${fieldName} harus berformat YYYY-MM-DD.`, 400);
  }

  const [year, month, date] = value.split("-").map(Number);
  const utcDate = new Date(Date.UTC(year, month - 1, date, 0, 0, 0, 0));

  if (
    utcDate.getUTCFullYear() !== year ||
    utcDate.getUTCMonth() !== month - 1 ||
    utcDate.getUTCDate() !== date
  ) {
    throw createError(`${fieldName} tidak valid.`, 400);
  }

  return utcDate;
}

function getRangeFromQuery(startDate, endDate) {
  if (!startDate && !endDate) {
    return getJakartaDayRange(new Date());
  }

  const parsedStartDate = parseJakartaDateString(startDate, "startDate");
  const parsedEndDate = parseJakartaDateString(endDate, "endDate");
  const startDateValue = parsedStartDate || parsedEndDate;
  const endDateValue = parsedEndDate || parsedStartDate;

  if (startDateValue.getTime() > endDateValue.getTime()) {
    throw createError("startDate tidak boleh lebih besar dari endDate.", 400);
  }

  const startParts = getJakartaDateParts(startDateValue);
  const endParts = getJakartaDateParts(endDateValue);

  return {
    startUtc: new Date(
      Date.UTC(startParts.year, startParts.month, startParts.date, 0, 0, 0, 0) -
        JAKARTA_OFFSET_MS,
    ),
    endUtc: new Date(
      Date.UTC(endParts.year, endParts.month, endParts.date + 1, 0, 0, 0, 0) -
        JAKARTA_OFFSET_MS,
    ),
  };
}

async function getAdminReportsSummary(filters = {}) {
  const range = getRangeFromQuery(filters.startDate, filters.endDate);
  const completedWhere = {
    status: "COMPLETED",
    endTime: {
      gte: range.startUtc,
      lt: range.endUtc,
    },
  };

  const [summaryAggregate, completedTransactions, groupedItems] = await Promise.all([
    prisma.transaction.aggregate({
      where: completedWhere,
      _sum: {
        grandTotal: true,
        rentalTotal: true,
        productTotal: true,
      },
      _count: {
        _all: true,
      },
    }),
    prisma.transaction.findMany({
      where: completedWhere,
      select: {
        id: true,
        pricingType: true,
        rentalTotal: true,
        productTotal: true,
        grandTotal: true,
        endTime: true,
        playStationUnit: {
          select: {
            code: true,
          },
        },
      },
      orderBy: {
        endTime: "desc",
      },
      take: 50,
    }),
    prisma.transactionItem.groupBy({
      by: ["productId", "productNameSnapshot"],
      where: {
        transaction: completedWhere,
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
      take: 10,
    }),
  ]);

  const normalizedGroupedItems = normalizeDecimalFields(groupedItems);
  const transactionCounts = completedTransactions.reduce(
    (counts, transaction) => {
      if (transaction.pricingType === "OPEN") {
        counts.open += 1;
      }

      if (transaction.pricingType === "PACKAGE") {
        counts.package += 1;
      }

      return counts;
    },
    { open: 0, package: 0 },
  );

  return {
    summary: {
      totalRevenue: toNumber(summaryAggregate._sum.grandTotal),
      transactionCount: toNumber(summaryAggregate._count._all),
      rentalRevenue: toNumber(summaryAggregate._sum.rentalTotal),
      productRevenue: toNumber(summaryAggregate._sum.productTotal),
      openTransactionCount: transactionCounts.open,
      packageTransactionCount: transactionCounts.package,
    },
    topProducts: normalizedGroupedItems.map((item) => ({
      id: item.productId,
      name: item.productNameSnapshot,
      quantitySold: toNumber(item._sum.quantity),
      revenue: toNumber(item._sum.subtotalSnapshot),
    })),
    transactions: completedTransactions.map((transaction) => ({
      id: transaction.id,
      consoleCode: transaction.playStationUnit?.code || "-",
      pricingType: transaction.pricingType,
      rentalTotal: toNumber(transaction.rentalTotal),
      productTotal: toNumber(transaction.productTotal),
      grandTotal: toNumber(transaction.grandTotal),
      endTime: transaction.endTime,
    })),
  };
}

module.exports = {
  getAdminReportsSummary,
};
