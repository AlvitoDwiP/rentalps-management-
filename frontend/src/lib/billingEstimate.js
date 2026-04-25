function toNumber(value) {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function getElapsedSeconds(startTime, now = Date.now()) {
  if (!startTime) {
    return 0;
  }

  const diffMs = now - new Date(startTime).getTime();

  if (Number.isNaN(diffMs) || diffMs <= 0) {
    return 0;
  }

  return Math.floor(diffMs / 1000);
}

export function getEstimatedRentalTotal(transaction, now = Date.now()) {
  if (!transaction) {
    return 0;
  }

  if (transaction.pricingType === "PACKAGE") {
    return toNumber(transaction.packagePriceSnapshot || transaction.rentalTotal);
  }

  const elapsedSeconds = getElapsedSeconds(transaction.startTime, now);
  const hourlyRate = toNumber(transaction.hourlyRateSnapshot);

  if (!elapsedSeconds || !hourlyRate) {
    return 0;
  }

  return Math.ceil((hourlyRate / 3600) * elapsedSeconds);
}

export function getEstimatedGrandTotal(transaction, now = Date.now()) {
  const estimatedRentalTotal = getEstimatedRentalTotal(transaction, now);
  const productTotal = toNumber(transaction?.productTotal);

  return estimatedRentalTotal + productTotal;
}

export function getTransactionEstimate(transaction, now = Date.now()) {
  const elapsedSeconds = getElapsedSeconds(transaction?.startTime, now);
  const estimatedRentalTotal = getEstimatedRentalTotal(transaction, now);
  const productTotal = toNumber(transaction?.productTotal);

  return {
    elapsedSeconds,
    estimatedRentalTotal,
    productTotal,
    estimatedGrandTotal: estimatedRentalTotal + productTotal,
  };
}
