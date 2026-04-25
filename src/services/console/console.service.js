const prisma = require("../../lib/prisma");
const createError = require("../../utils/createError");

async function listConsoles() {
  return prisma.playStationUnit.findMany({
    orderBy: {
      code: "asc",
    },
  });
}

async function setConsoleMaintenance(id, payload = {}) {
  const { status } = payload;

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

  return prisma.playStationUnit.update({
    where: { id },
    data: { status },
  });
}

module.exports = {
  listConsoles,
  setConsoleMaintenance,
};
