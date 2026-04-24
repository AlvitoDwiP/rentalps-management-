const prisma = require("../../config/prisma");

function createError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

async function updateRate(req, res, next) {
  try {
    const { id } = req.params;
    const { pricePerHour } = req.body || {};

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

    res.status(200).json({
      success: true,
      data: rentalRate,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  updateRate,
};
