const bcrypt = require("bcrypt");

const prisma = require("../../config/prisma");

function createError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function sanitizeUser(user) {
  const { password, ...safeUser } = user;
  return safeUser;
}

async function createUser(req, res, next) {
  try {
    const { name, username, password, role, email } = req.body || {};

    if (!name || typeof name !== "string") {
      throw createError("name wajib diisi.", 400);
    }

    if (!username || typeof username !== "string") {
      throw createError("username wajib diisi.", 400);
    }

    if (!password || typeof password !== "string") {
      throw createError("password wajib diisi.", 400);
    }

    if (!["ADMIN", "CASHIER"].includes(role)) {
      throw createError("role hanya boleh ADMIN atau CASHIER.", 400);
    }

    if (role === "ADMIN") {
      throw createError("Endpoint ini hanya boleh membuat user CASHIER.", 403);
    }

    const normalizedUsername = username.trim();
    const normalizedEmail = (email || `${normalizedUsername}@rentalps.local`).trim().toLowerCase();

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username: normalizedUsername }, { email: normalizedEmail }],
      },
    });

    if (existingUser) {
      throw createError("Username atau email sudah digunakan.", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        username: normalizedUsername,
        email: normalizedEmail,
        password: hashedPassword,
        role,
        isActive: true,
      },
    });

    res.status(201).json({
      success: true,
      data: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createUser,
};
