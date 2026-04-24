const prisma = require("../config/prisma");

async function listConsoles(req, res, next) {
  try {
    const consoles = await prisma.playStationUnit.findMany({
      orderBy: {
        code: "asc",
      },
    });

    res.status(200).json({
      success: true,
      data: consoles,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listConsoles,
};
