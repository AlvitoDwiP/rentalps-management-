const prisma = require("../config/prisma");

async function listPackages(req, res, next) {
  try {
    const packages = await prisma.rentalPackage.findMany({
      orderBy: [
        { consoleType: "asc" },
        { durationMinutes: "asc" },
        { name: "asc" },
      ],
    });

    res.status(200).json({
      success: true,
      data: packages,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listPackages,
};
