const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const prisma = require("../config/prisma");

function createError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function sanitizeUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    username: user.username,
    role: user.role,
  };
}

function getJwtConfig() {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || "1d";

  if (!secret) {
    throw createError("JWT_SECRET belum dikonfigurasi.", 500);
  }

  return { secret, expiresIn };
}

async function findUserByIdentifier(identifier) {
  return prisma.user.findFirst({
    where: {
      OR: [{ email: identifier }, { username: identifier }],
    },
  });
}

async function login(payload = {}) {
  const { identifier, password } = payload;

  if (!identifier || !password) {
    throw createError("Identifier dan password wajib diisi.", 400);
  }

  const user = await findUserByIdentifier(identifier);

  if (!user || user.isActive === false) {
    throw createError("Identifier atau password salah", 401);
  }

  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    throw createError("Identifier atau password salah", 401);
  }

  const { secret, expiresIn } = getJwtConfig();
  const token = jwt.sign(
    {
      sub: user.id,
      role: user.role,
    },
    secret,
    { expiresIn },
  );

  return {
    token,
    user: sanitizeUser(user),
  };
}

async function getActiveUserById(userId) {
  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || user.isActive === false) {
    return null;
  }

  return sanitizeUser(user);
}

function verifyAccessToken(token) {
  const { secret } = getJwtConfig();
  return jwt.verify(token, secret);
}

module.exports = {
  login,
  getActiveUserById,
  verifyAccessToken,
  sanitizeUser,
};
