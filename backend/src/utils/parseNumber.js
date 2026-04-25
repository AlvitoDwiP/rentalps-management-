const createError = require("./createError");

function parseNumber(value, options = {}) {
  const {
    fieldName = "field",
    required = false,
    min,
    integer = false,
    requiredMessage,
    invalidMessage,
  } = options;

  if (value === null || value === undefined) {
    if (required) {
      throw createError(requiredMessage || `${fieldName} wajib diisi.`, 400);
    }

    return undefined;
  }

  if (typeof value === "string" && value.trim() === "") {
    if (required) {
      throw createError(requiredMessage || `${fieldName} wajib diisi.`, 400);
    }

    return undefined;
  }

  let parsedValue = value;

  if (typeof value === "string") {
    parsedValue = Number(value.trim());
  }

  if (typeof parsedValue !== "number" || Number.isNaN(parsedValue) || !Number.isFinite(parsedValue)) {
    throw createError(invalidMessage || `${fieldName} harus berupa number yang valid.`, 400);
  }

  if (integer && !Number.isInteger(parsedValue)) {
    throw createError(invalidMessage || `${fieldName} harus berupa integer yang valid.`, 400);
  }

  if (min !== undefined && parsedValue < min) {
    throw createError(invalidMessage || `${fieldName} harus bernilai minimal ${min}.`, 400);
  }

  return parsedValue;
}

module.exports = parseNumber;
