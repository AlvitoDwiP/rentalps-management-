const { Prisma } = require("@prisma/client");

const DECIMAL_FIELD_NAMES = new Set([
  "hourlyRate",
  "hourlyRateSnapshot",
  "packagePriceSnapshot",
  "price",
  "subtotalSnapshot",
  "unitPriceSnapshot",
]);

function isNumericString(value) {
  return typeof value === "string" && /^-?\d+(\.\d+)?$/.test(value.trim());
}

function normalizeDecimalFields(value, keyName) {
  if (value instanceof Prisma.Decimal) {
    return value.toNumber();
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeDecimalFields(item));
  }

  if (value && typeof value === "object" && !(value instanceof Date)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, itemValue]) => [
        key,
        normalizeDecimalFields(itemValue, key),
      ]),
    );
  }

  if (keyName && DECIMAL_FIELD_NAMES.has(keyName) && isNumericString(value)) {
    return Number(value);
  }

  return value;
}

module.exports = {
  normalizeDecimalFields,
};
