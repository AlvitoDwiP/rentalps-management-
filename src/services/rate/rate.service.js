const prisma = require("../../lib/prisma");
const { normalizeDecimalFields } = require("../../utils/normalizeDecimal");

function createError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

async function listRates() {
  const rates = await prisma.rentalRate.findMany({
    orderBy: {
      consoleType: "asc",
    },
  });

  return normalizeDecimalFields(rates);
}

async function updateRate(id, payload = {}) {
  const { pricePerHour } = payload;

  if (!Number.isInteger(pricePerHour) || pricePerHour < 0) {
    throw createError("pricePerHour tidak boleh negatif dan harus berupa integer.", 400);
  }

  const existingRate = await prisma.rentalRate.findUnique({
    where: { id },
  });

  if (!existingRate) {
    throw createError("Rental rate tidak ditemukan.", 404);
  }

  const rentalRate = await prisma.rentalRate.update({
    where: { id },
    data: {
      hourlyRate: pricePerHour,
    },
  });

  return normalizeDecimalFields(rentalRate);
}

module.exports = {
  listRates,
  updateRate,
};
