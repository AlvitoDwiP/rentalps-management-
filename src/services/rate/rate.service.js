const prisma = require("../../lib/prisma");
const { normalizeDecimalFields } = require("../../utils/normalizeDecimal");
const createError = require("../../utils/createError");
const parseNumber = require("../../utils/parseNumber");

async function listRates() {
  const rates = await prisma.rentalRate.findMany({
    orderBy: {
      consoleType: "asc",
    },
  });

  return normalizeDecimalFields(rates);
}

async function updateRate(id, payload = {}) {
  const pricePerHour = parseNumber(payload.pricePerHour, {
    fieldName: "pricePerHour",
    required: true,
    integer: true,
    min: 0,
    invalidMessage: "pricePerHour tidak boleh negatif dan harus berupa integer.",
  });

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
