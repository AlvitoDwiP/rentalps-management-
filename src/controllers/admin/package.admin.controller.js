const prisma = require("../../config/prisma");

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

async function createPackage(req, res, next) {
  try {
    const { name, consoleType, durationMinutes, price } = req.body || {};

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

    res.status(201).json({
      success: true,
      data: rentalPackage,
    });
  } catch (error) {
    next(error);
  }
}

async function updatePackage(req, res, next) {
  try {
    const { id } = req.params;
    const { name, consoleType, durationMinutes, price, isActive } = req.body || {};

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

    res.status(200).json({
      success: true,
      data: rentalPackage,
    });
  } catch (error) {
    next(error);
  }
}

async function deletePackage(req, res, next) {
  try {
    const { id } = req.params;

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

    res.status(200).json({
      success: true,
      data: rentalPackage,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createPackage,
  updatePackage,
  deletePackage,
};
