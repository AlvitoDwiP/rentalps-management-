const bcrypt = require("bcrypt");

const prisma = require("../../lib/prisma");
const createError = require("../../utils/createError");

function sanitizeUser(user) {
  const { password, ...safeUser } = user;
  return safeUser;
}

async function listUsers(filters = {}) {
  const where = {};
  const includeDeleted = filters.includeDeleted === true;

  if (!includeDeleted) {
    where.deletedAt = null;
  }

  if (filters.role && ["ADMIN", "CASHIER"].includes(filters.role)) {
    where.role = filters.role;
  }

  if (typeof filters.isActive === "boolean") {
    where.isActive = filters.isActive;
  }

  const users = await prisma.user.findMany({
    where,
    orderBy: [
      { role: "asc" },
      { createdAt: "desc" },
    ],
  });

  return users.map(sanitizeUser);
}

async function findManageableUserById(targetUserId) {
  if (!targetUserId) {
    throw createError("User target tidak ditemukan.", 404);
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    include: {
      _count: {
        select: {
          transactions: true,
        },
      },
    },
  });

  if (!targetUser) {
    throw createError("User tidak ditemukan.", 404);
  }

  if (targetUser.deletedAt) {
    throw createError("User sudah dihapus.", 400);
  }

  return targetUser;
}

async function createUser(payload = {}) {
  const { name, username, password, role, email } = payload;

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

  return sanitizeUser(user);
}

async function updateUserStatus(targetUserId, payload = {}, actorUser = {}) {
  const { isActive } = payload;

  if (typeof isActive !== "boolean") {
    throw createError("isActive wajib berupa boolean.", 400);
  }

  const targetUser = await findManageableUserById(targetUserId);

  if (targetUser.role === "ADMIN") {
    throw createError("User ADMIN tidak dapat diubah melalui endpoint ini.", 403);
  }

  if (actorUser?.id && actorUser.id === targetUser.id) {
    throw createError("Anda tidak dapat mengubah status akun sendiri.", 403);
  }

  const user = await prisma.user.update({
    where: { id: targetUserId },
    data: { isActive },
  });

  return sanitizeUser(user);
}

async function deleteUser(targetUserId, actorUser = {}) {
  const targetUser = await findManageableUserById(targetUserId);

  if (targetUser.role === "ADMIN") {
    throw createError("User ADMIN tidak dapat dihapus melalui endpoint ini.", 403);
  }

  if (actorUser?.id && actorUser.id === targetUser.id) {
    throw createError("Anda tidak dapat menghapus akun sendiri.", 403);
  }

  const deletedAt = new Date();
  const user = await prisma.user.update({
    where: { id: targetUserId },
    data: {
      isActive: false,
      deletedAt,
    },
  });

  return {
    ...sanitizeUser(user),
    deletedAt,
    deletionMode:
      targetUser._count?.transactions > 0 ? "SOFT_DELETE_WITH_TRANSACTIONS" : "SOFT_DELETE",
  };
}

module.exports = {
  listUsers,
  createUser,
  updateUserStatus,
  deleteUser,
};
