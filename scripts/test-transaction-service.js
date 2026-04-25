const prisma = require("../src/lib/prisma");
const {
  startOpenTransaction,
  addTransactionItem,
  finishTransaction,
} = require("../src/services/transaction.service");

function serialize(value) {
  return JSON.stringify(
    value,
    (key, item) => {
      if (item && typeof item === "object" && typeof item.toNumber === "function") {
        return item.toNumber();
      }

      return item;
    },
    2,
  );
}

async function main() {
  const consoleUnit = await prisma.playStationUnit.findUnique({
    where: { code: "PS5-01" },
  });

  if (!consoleUnit) {
    throw new Error("Console PS5-01 tidak ditemukan.");
  }

  const product = await prisma.product.findFirst({
    where: { name: "Air Mineral" },
  });

  if (!product) {
    throw new Error("Produk Air Mineral tidak ditemukan.");
  }

  const initialStock = product.stock;

  const activeTransaction = await prisma.transaction.findFirst({
    where: {
      playStationUnitId: consoleUnit.id,
      status: "ACTIVE",
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (activeTransaction) {
    await finishTransaction(activeTransaction.id);
  }

  const startedTransaction = await startOpenTransaction({
    consoleCode: "PS5-01",
  });

  const updatedTransaction = await addTransactionItem({
    transactionId: startedTransaction.id,
    productId: product.id,
    quantity: 2,
  });

  const finishedTransaction = await finishTransaction(updatedTransaction.id);
  const persistedTransaction = await prisma.transaction.findUnique({
    where: { id: finishedTransaction.id },
  });

  const refreshedConsole = await prisma.playStationUnit.findUnique({
    where: { code: "PS5-01" },
  });
  const refreshedProduct = await prisma.product.findFirst({
    where: { name: "Air Mineral" },
  });

  if (!persistedTransaction) {
    throw new Error("Transaksi final gagal dibaca ulang dari database.");
  }

  if (!refreshedConsole || refreshedConsole.status !== "AVAILABLE") {
    throw new Error("Console PS5-01 belum kembali ke status AVAILABLE.");
  }

  if (!refreshedProduct) {
    throw new Error("Produk Air Mineral gagal dibaca ulang dari database.");
  }

  if (persistedTransaction.status !== "COMPLETED") {
    throw new Error("Status transaksi final belum COMPLETED.");
  }

  if (persistedTransaction.durationMinutes === null) {
    throw new Error("durationMinutes belum tersimpan di database.");
  }

  if (persistedTransaction.rentalTotal <= 0) {
    throw new Error("rentalTotal belum tersimpan dengan benar.");
  }

  if (persistedTransaction.productTotal !== 8000) {
    throw new Error("productTotal tersimpan tidak sesuai hasil item transaksi.");
  }

  if (persistedTransaction.grandTotal !== persistedTransaction.rentalTotal + persistedTransaction.productTotal) {
    throw new Error("grandTotal tersimpan tidak sesuai penjumlahan rentalTotal dan productTotal.");
  }

  if (refreshedProduct.stock !== initialStock - 2) {
    throw new Error("Stok Air Mineral tidak berkurang sesuai quantity test.");
  }

  console.log("Final transaction result:");
  console.log(serialize(finishedTransaction));
  console.log("Persisted transaction fields:");
  console.log(
    serialize({
      durationMinutes: persistedTransaction.durationMinutes,
      rentalTotal: persistedTransaction.rentalTotal,
      productTotal: persistedTransaction.productTotal,
      grandTotal: persistedTransaction.grandTotal,
      status: persistedTransaction.status,
    }),
  );
  console.log(`Console PS5-01 status: ${refreshedConsole.status}`);
  console.log(`Air Mineral stock: ${refreshedProduct.stock}`);
}

main()
  .catch((error) => {
    console.error("Test transaction service gagal.");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
