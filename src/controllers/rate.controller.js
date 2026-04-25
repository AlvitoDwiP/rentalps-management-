const prisma = require("../lib/prisma");

async function listRates(req, res, next) {
  try {
    const rates = await prisma.rentalRate.findMany({
      orderBy: {
        consoleType: "asc",
      },
    });

    res.status(200).json({
      success: true,
      data: rates,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listRates,
};
