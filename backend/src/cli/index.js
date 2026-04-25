const prisma = require("../lib/prisma");
const {
  startOpenTransaction,
  startPackageTransaction,
  finishTransaction,
  addTransactionItem,
  moveTransactionConsole,
  getActiveTransactions,
} = require("../services/transaction/transaction.service");

function formatDateTime(value) {
  if (!value) {
    return "-";
  }

  return new Date(value).toISOString();
}

function printLines(title, lines) {
  console.log(title);

  if (!lines.length) {
    console.log("(empty)");
    return;
  }

  for (const line of lines) {
    console.log(line);
  }
}

function printHelp() {
  printLines("Available commands:", [
    "- consoles",
    "- products",
    "- packages",
    "- active",
    "- start-open <consoleCode>",
    "- start-package <consoleCode> <packageId>",
    "- add-item <transactionId> <productName> <quantity>",
    "- finish <transactionId>",
    "- move-console <transactionId> <targetConsoleCode>",
  ]);
}

async function handleConsoles() {
  const consoles = await prisma.playStationUnit.findMany({
    orderBy: {
      code: "asc",
    },
  });

  printLines(
    "CONSOLES",
    consoles.map((consoleUnit) => {
      return `${consoleUnit.code} | ${consoleUnit.consoleType} | ${consoleUnit.status}`;
    }),
  );
}

async function handleProducts() {
  const products = await prisma.product.findMany({
    orderBy: {
      name: "asc",
    },
  });

  printLines(
    "PRODUCTS",
    products.map((product) => {
      return `${product.name} | Rp${product.price.toNumber()} | stock=${product.stock} | active=${product.isActive}`;
    }),
  );
}

async function handlePackages() {
  const packages = await prisma.rentalPackage.findMany({
    orderBy: [{ consoleType: "asc" }, { durationMinutes: "asc" }, { name: "asc" }],
  });

  printLines(
    "PACKAGES",
    packages.map((pkg) => {
      return `${pkg.id} | ${pkg.name} | ${pkg.consoleType} | ${pkg.durationMinutes} menit | Rp${pkg.price.toNumber()} | active=${pkg.isActive}`;
    }),
  );
}

async function handleActive() {
  const transactions = await getActiveTransactions();

  printLines(
    "ACTIVE TRANSACTIONS",
    transactions.map((transaction) => {
      return [
        transaction.id,
        transaction.playStationUnit?.code || "-",
        transaction.pricingType,
        formatDateTime(transaction.startTime),
        `rental=${transaction.rentalTotal}`,
        `product=${transaction.productTotal}`,
        `grand=${transaction.grandTotal}`,
      ].join(" | ");
    }),
  );
}

async function handleStartOpen(args) {
  const consoleCode = args[0];

  if (!consoleCode) {
    throw new Error("Gunakan: start-open <consoleCode>");
  }

  const transaction = await startOpenTransaction({ consoleCode });

  printLines("OPEN TRANSACTION STARTED", [
    `id=${transaction.id}`,
    `console=${transaction.playStationUnit?.code || consoleCode}`,
    `type=${transaction.pricingType}`,
    `status=${transaction.status}`,
  ]);
}

async function handleStartPackage(args) {
  const [consoleCode, packageId] = args;

  if (!consoleCode || !packageId) {
    throw new Error("Gunakan: start-package <consoleCode> <packageId>");
  }

  const transaction = await startPackageTransaction({
    consoleCode,
    packageId,
  });

  printLines("PACKAGE TRANSACTION STARTED", [
    `id=${transaction.id}`,
    `console=${transaction.playStationUnit?.code || consoleCode}`,
    `package=${transaction.rentalPackage?.name || packageId}`,
    `rentalTotal=${transaction.rentalTotal}`,
    `grandTotal=${transaction.grandTotal}`,
  ]);
}

async function handleAddItem(args) {
  const [transactionId, productName, quantityRaw] = args;

  if (!transactionId || !productName || !quantityRaw) {
    throw new Error("Gunakan: add-item <transactionId> <productName> <quantity>");
  }

  const quantity = Number.parseInt(quantityRaw, 10);

  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error("Quantity harus berupa bilangan bulat minimal 1.");
  }

  const product = await prisma.product.findFirst({
    where: {
      name: productName,
    },
  });

  if (!product) {
    throw new Error(`Produk dengan nama "${productName}" tidak ditemukan.`);
  }

  const transaction = await addTransactionItem({
    transactionId,
    productId: product.id,
    quantity,
  });

  const addedItem = transaction.items[transaction.items.length - 1];

  printLines("ITEM ADDED", [
    `transactionId=${transaction.id}`,
    `product=${addedItem?.productNameSnapshot || product.name}`,
    `quantity=${addedItem?.quantity || quantity}`,
    `subtotal=${addedItem?.subtotalSnapshot || product.price.toNumber() * quantity}`,
    `productTotal=${transaction.productTotal}`,
    `grandTotal=${transaction.grandTotal}`,
  ]);
}

async function handleFinish(args) {
  const transactionId = args[0];

  if (!transactionId) {
    throw new Error("Gunakan: finish <transactionId>");
  }

  const transaction = await finishTransaction(transactionId);

  printLines("TRANSACTION FINISHED", [
    `id=${transaction.id}`,
    `status=${transaction.status}`,
    `durationMinutes=${transaction.durationMinutes}`,
    `rentalTotal=${transaction.rentalTotal}`,
    `productTotal=${transaction.productTotal}`,
    `grandTotal=${transaction.grandTotal}`,
  ]);
}

async function handleMoveConsole(args) {
  const [transactionId, targetConsoleCode] = args;

  if (!transactionId || !targetConsoleCode) {
    throw new Error("Gunakan: move-console <transactionId> <targetConsoleCode>");
  }

  const currentTransaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: {
      playStationUnit: true,
    },
  });

  if (!currentTransaction) {
    throw new Error("Transaksi tidak ditemukan.");
  }

  const previousConsoleCode = currentTransaction.playStationUnit?.code || "-";
  const updatedTransaction = await moveTransactionConsole({
    transactionId,
    targetConsoleCode,
  });

  printLines("CONSOLE MOVED", [
    `transactionId=${updatedTransaction.id}`,
    `from=${previousConsoleCode}`,
    `to=${updatedTransaction.playStationUnit?.code || targetConsoleCode}`,
  ]);
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const commandArgs = args.slice(1);

  switch (command) {
    case "consoles":
      await handleConsoles();
      break;
    case "products":
      await handleProducts();
      break;
    case "packages":
      await handlePackages();
      break;
    case "active":
      await handleActive();
      break;
    case "start-open":
      await handleStartOpen(commandArgs);
      break;
    case "start-package":
      await handleStartPackage(commandArgs);
      break;
    case "add-item":
      await handleAddItem(commandArgs);
      break;
    case "finish":
      await handleFinish(commandArgs);
      break;
    case "move-console":
      await handleMoveConsole(commandArgs);
      break;
    case "help":
    case undefined:
      printHelp();
      break;
    default:
      console.error(`Command tidak dikenali: ${command}`);
      printHelp();
      process.exitCode = 1;
  }
}

main()
  .catch((error) => {
    console.error("CLI error:");
    console.error(error.message || error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
