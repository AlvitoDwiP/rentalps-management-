const prisma = require("../../lib/prisma");
const { normalizeDecimalFields } = require("../../utils/normalizeDecimal");

function createError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function validateConsoleType(consoleType) {
  if (consoleType === undefined) {
    return;
  }

  if (!["PS3", "PS4", "PS5"].includes(consoleType)) {
    throw createError("consoleType harus PS3, PS4, atau PS5.", 400);
  }
}

function validatePrice(price) {
  if (price === undefined) {
    return;
  }

  if (!Number.isInteger(price) || price < 0) {
    throw createError("price tidak boleh negatif dan harus berupa integer.", 400);
  }
}

function validateDuration(durationMinutes) {
  if (durationMinutes === undefined) {
    return;
  }

  if (!Number.isInteger(durationMinutes) || durationMinutes <= 0) {
    throw createError("durationMinutes harus lebih dari 0.", 400);
  }
}

async function ensureUniquePackage(consoleType, name, excludeId) {
  const existing = await prisma.rentalPackage.findFirst({
    where: {
      consoleType,
      name,
      ...(excludeId
        ? {
            NOT: { id: excludeId },
          }
        : {}),
    },
  });

  if (existing) {
    throw createError("Package dengan nama dan tipe console tersebut sudah ada.", 400);
  }
}

async function listPackages() {
  const packages = await prisma.rentalPackage.findMany({
    orderBy: [
      { consoleType: "asc" },
      { durationMinutes: "asc" },
      { name: "asc" },
    ],
  });

  return normalizeDecimalFields(packages);
}

async function createPackage(payload = {}) {
  const { name, consoleType, durationMinutes, price } = payload;

  if (!name || typeof name !== "string") {
    throw createError("name wajib diisi.", 400);
  }

  validateConsoleType(consoleType);
  validateDuration(durationMinutes);
  validatePrice(price);

  await ensureUniquePackage(consoleType, name.trim());

  const rentalPackage = await prisma.rentalPackage.create({
    data: {
      name: name.trim(),
      consoleType,
      durationMinutes,
      price,
      isActive: true,
    },
  });

  return normalizeDecimalFields(rentalPackage);
}

async function updatePackage(id, payload = {}) {
  const { name, consoleType, durationMinutes, price, isActive } = payload;

  const existingPackage = await prisma.rentalPackage.findUnique({
    where: { id },
  });

  if (!existingPackage) {
    throw createError("Package tidak ditemukan.", 404);
  }

  validateConsoleType(consoleType);
  validateDuration(durationMinutes);
  validatePrice(price);

  const nextName = name !== undefined ? name.trim() : existingPackage.name;
  const nextConsoleType = consoleType || existingPackage.consoleType;

  if (name !== undefined || consoleType !== undefined) {
    await ensureUniquePackage(nextConsoleType, nextName, id);
  }

  const data = {};

  if (name !== undefined) {
    if (!name || typeof name !== "string") {
      throw createError("name tidak valid.", 400);
    }
    data.name = nextName;
  }

  if (consoleType !== undefined) {
    data.consoleType = consoleType;
  }

  if (durationMinutes !== undefined) {
    data.durationMinutes = durationMinutes;
  }

  if (price !== undefined) {
    data.price = price;
  }

  if (isActive !== undefined) {
    if (typeof isActive !== "boolean") {
      throw createError("isActive harus boolean.", 400);
    }
    data.isActive = isActive;
  }

  const rentalPackage = await prisma.rentalPackage.update({
    where: { id },
    data,
  });

  return normalizeDecimalFields(rentalPackage);
}

async function deletePackage(id) {
  const existingPackage = await prisma.rentalPackage.findUnique({
    where: { id },
  });

  if (!existingPackage) {
    throw createError("Package tidak ditemukan.", 404);
  }

  const rentalPackage = await prisma.rentalPackage.update({
    where: { id },
    data: {
      isActive: false,
    },
  });

  return normalizeDecimalFields(rentalPackage);
}

module.exports = {
  listPackages,
  createPackage,
  updatePackage,
  deletePackage,
};
