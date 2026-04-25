const prisma = require("../../lib/prisma");

function createError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

async function setConsoleMaintenance(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body || {};

    if (!["AVAILABLE", "MAINTENANCE"].includes(status)) {
      throw createError("status hanya boleh AVAILABLE atau MAINTENANCE.", 400);
    }

    const consoleUnit = await prisma.playStationUnit.findUnique({
      where: { id },
    });

    if (!consoleUnit) {
      throw createError("Console tidak ditemukan.", 404);
    }

    if (consoleUnit.status === "IN_USE") {
      throw createError("Console sedang IN_USE dan tidak bisa diubah ke maintenance.", 409);
    }

    if (!["AVAILABLE", "MAINTENANCE"].includes(consoleUnit.status)) {
      throw createError("Perubahan status hanya diizinkan antara AVAILABLE dan MAINTENANCE.", 409);
    }

    const updatedConsole = await prisma.playStationUnit.update({
      where: { id },
      data: { status },
    });

    res.status(200).json({
      success: true,
      data: updatedConsole,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  setConsoleMaintenance,
};
