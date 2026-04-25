const prisma = require("../../lib/prisma");

function getTodayRangeInJakarta(now = new Date()) {
  const jakartaOffsetMs = 7 * 60 * 60 * 1000;
  const jakartaNow = new Date(now.getTime() + jakartaOffsetMs);

  const year = jakartaNow.getUTCFullYear();
  const month = jakartaNow.getUTCMonth();
  const date = jakartaNow.getUTCDate();

  const startUtc = new Date(
    Date.UTC(year, month, date, 0, 0, 0, 0) - jakartaOffsetMs,
  );
  const endUtc = new Date(
    Date.UTC(year, month, date + 1, 0, 0, 0, 0) - jakartaOffsetMs,
  );

  return {
    startUtc,
    endUtc,
  };
}

async function getTodaySummary() {
  const { startUtc, endUtc } = getTodayRangeInJakarta();

  const summary = await prisma.transaction.aggregate({
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
    _count: {
      _all: true,
    },
  });

  return {
    revenueToday: Number(summary._sum.grandTotal || 0),
    transactionCountToday: Number(summary._count._all || 0),
  };
}

module.exports = {
  getTodaySummary,
};
