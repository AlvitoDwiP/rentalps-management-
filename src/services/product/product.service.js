const prisma = require("../../lib/prisma");
const { normalizeDecimalFields } = require("../../utils/normalizeDecimal");

function createError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function validatePrice(price) {
  if (price === undefined) {
    return;
  }

  if (!Number.isInteger(price) || price < 0) {
    throw createError("price tidak boleh negatif dan harus berupa integer.", 400);
  }
}

function validateStock(stock) {
  if (stock === undefined) {
    return;
  }

  if (!Number.isInteger(stock) || stock < 0) {
    throw createError("stock tidak boleh negatif dan harus berupa integer.", 400);
  }
}

function validateCategory(category) {
  if (category === undefined) {
    return;
  }

  if (!["SNACK", "DRINK"].includes(category)) {
    throw createError("category harus SNACK atau DRINK.", 400);
  }
}

function slugifyName(name) {
  return name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

async function generateProductCode(name) {
  const baseSlug = slugifyName(name);

  if (!baseSlug) {
    throw createError("name produk tidak valid untuk dibuatkan code.", 400);
  }

  const baseCode = `PRODUCT-${baseSlug}`;
  let candidate = baseCode;
  let counter = 1;

  while (await prisma.product.findUnique({ where: { code: candidate } })) {
    counter += 1;
    candidate = `${baseCode}-${counter}`;
  }

  return candidate;
}

async function listProducts() {
  const products = await prisma.product.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return normalizeDecimalFields(products);
}

async function createProduct(payload = {}) {
  const { name, price, stock, category } = payload;

  if (!name || typeof name !== "string") {
    throw createError("name wajib diisi.", 400);
  }

  validatePrice(price);
  validateStock(stock);
  validateCategory(category);

  const product = await prisma.product.create({
    data: {
      code: await generateProductCode(name),
      name: name.trim(),
      category: category || "DRINK",
      price,
      stock,
      isActive: true,
    },
  });

  return normalizeDecimalFields(product);
}

async function updateProduct(id, payload = {}) {
  const { name, price, stock, isActive, category } = payload;

  const existingProduct = await prisma.product.findUnique({
    where: { id },
  });

  if (!existingProduct) {
    throw createError("Product tidak ditemukan.", 404);
  }

  validatePrice(price);
  validateStock(stock);
  validateCategory(category);

  const data = {};

  if (name !== undefined) {
    if (!name || typeof name !== "string") {
      throw createError("name tidak valid.", 400);
    }
    data.name = name.trim();
  }

  if (price !== undefined) {
    data.price = price;
  }

  if (stock !== undefined) {
    data.stock = stock;
  }

  if (category !== undefined) {
    data.category = category;
  }

  if (isActive !== undefined) {
    if (typeof isActive !== "boolean") {
      throw createError("isActive harus boolean.", 400);
    }
    data.isActive = isActive;
  }

  const product = await prisma.product.update({
    where: { id },
    data,
  });

  return normalizeDecimalFields(product);
}

async function deleteProduct(id) {
  const existingProduct = await prisma.product.findUnique({
    where: { id },
  });

  if (!existingProduct) {
    throw createError("Product tidak ditemukan.", 404);
  }

  const product = await prisma.product.update({
    where: { id },
    data: {
      isActive: false,
    },
  });

  return normalizeDecimalFields(product);
}

module.exports = {
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};
