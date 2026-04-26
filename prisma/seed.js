const path = require("path");
const { createRequire } = require("module");

const backendRequire = createRequire(path.resolve(__dirname, "../backend/package.json"));

backendRequire("dotenv").config({
  path: path.resolve(__dirname, "../backend/.env"),
});

const bcrypt = backendRequire("bcrypt");
const prisma = require("../backend/src/lib/prisma");

const JAKARTA_OFFSET_MS = 7 * 60 * 60 * 1000;
const ADMIN_PASSWORD = "admin123";
const CASHIER_PASSWORD = "kasir123";

const DEMO_USERS = [
  {
    name: "Admin",
    username: "admin",
    email: "admin@rentalps.local",
    password: ADMIN_PASSWORD,
    role: "ADMIN",
    isActive: true,
  },
  {
    name: "Kasir Pagi",
    username: "kasir_pagi",
    email: "kasir_pagi@rentalps.local",
    password: CASHIER_PASSWORD,
    role: "CASHIER",
    isActive: true,
  },
  {
    name: "Kasir Sore",
    username: "kasir_sore",
    email: "kasir_sore@rentalps.local",
    password: CASHIER_PASSWORD,
    role: "CASHIER",
    isActive: true,
  },
  {
    name: "Kasir Nonaktif",
    username: "kasir_nonaktif",
    email: "kasir_nonaktif@rentalps.local",
    password: CASHIER_PASSWORD,
    role: "CASHIER",
    isActive: false,
  },
];

const CONSOLE_CODES = {
  PS3: Array.from({ length: 5 }, (_, index) => `PS3-${String(index + 1).padStart(2, "0")}`),
  PS4: Array.from({ length: 5 }, (_, index) => `PS4-${String(index + 1).padStart(2, "0")}`),
  PS5: Array.from({ length: 5 }, (_, index) => `PS5-${String(index + 1).padStart(2, "0")}`),
};

const CONSOLE_DEFINITIONS = [
  ...CONSOLE_CODES.PS3.map((code, index) => ({
    code,
    name: `PlayStation 3 ${String(index + 1).padStart(2, "0")}`,
    consoleType: "PS3",
  })),
  ...CONSOLE_CODES.PS4.map((code, index) => ({
    code,
    name: `PlayStation 4 ${String(index + 1).padStart(2, "0")}`,
    consoleType: "PS4",
  })),
  ...CONSOLE_CODES.PS5.map((code, index) => ({
    code,
    name: `PlayStation 5 ${String(index + 1).padStart(2, "0")}`,
    consoleType: "PS5",
  })),
];

const RENTAL_RATES = [
  { consoleType: "PS3", hourlyRate: 5000 },
  { consoleType: "PS4", hourlyRate: 8000 },
  { consoleType: "PS5", hourlyRate: 12000 },
];

const PACKAGE_DURATIONS = [
  { name: "1 Jam", durationMinutes: 60 },
  { name: "2 Jam", durationMinutes: 120 },
  { name: "3 Jam", durationMinutes: 180 },
  { name: "5 Jam", durationMinutes: 300 },
];

const PACKAGE_PRICE_MAP = {
  PS3: { "1 Jam": 5000, "2 Jam": 9000, "3 Jam": 13000, "5 Jam": 20000 },
  PS4: { "1 Jam": 8000, "2 Jam": 15000, "3 Jam": 22000, "5 Jam": 35000 },
  PS5: { "1 Jam": 12000, "2 Jam": 22000, "3 Jam": 32000, "5 Jam": 50000 },
};

const PRODUCT_DEFINITIONS = [
  {
    code: "SNACK-INDOMIE-GORENG",
    name: "Indomie Goreng",
    category: "SNACK",
    price: 7000,
    finalStock: 12,
  },
  {
    code: "DRINK-TEH-BOTOL-350",
    name: "Teh Botol 350ml",
    category: "DRINK",
    price: 5000,
    finalStock: 10,
  },
  {
    code: "DRINK-POCARI-350",
    name: "Pocari Sweat 350ml",
    category: "DRINK",
    price: 8000,
    finalStock: 2,
  },
  {
    code: "SNACK-CHITATO",
    name: "Chitato",
    category: "SNACK",
    price: 10000,
    finalStock: 4,
  },
  {
    code: "DRINK-AIR-MINERAL",
    name: "Air Mineral",
    category: "DRINK",
    price: 4000,
    finalStock: 14,
  },
  {
    code: "DRINK-KOPI-SACHET",
    name: "Kopi Sachet",
    category: "DRINK",
    price: 5000,
    finalStock: 8,
  },
  {
    code: "DRINK-FANTA",
    name: "Fanta",
    category: "DRINK",
    price: 6000,
    finalStock: 7,
  },
  {
    code: "DRINK-COCA-COLA",
    name: "Coca Cola",
    category: "DRINK",
    price: 7000,
    finalStock: 5,
  },
  {
    code: "SNACK-MIE-CUP",
    name: "Mie Cup",
    category: "SNACK",
    price: 9000,
    finalStock: 0,
  },
  {
    code: "SNACK-BENG-BENG",
    name: "Beng-Beng",
    category: "SNACK",
    price: 4000,
    finalStock: 9,
  },
  {
    code: "SNACK-SILVERQUEEN-MINI",
    name: "SilverQueen Mini",
    category: "SNACK",
    price: 6000,
    finalStock: 3,
  },
  {
    code: "SNACK-KERIPIK-SINGKONG",
    name: "Keripik Singkong",
    category: "SNACK",
    price: 7000,
    finalStock: 11,
  },
  {
    code: "DRINK-ES-TEH",
    name: "Es Teh",
    category: "DRINK",
    price: 3000,
    finalStock: 6,
  },
  {
    code: "DRINK-GOOD-DAY",
    name: "Good Day",
    category: "DRINK",
    price: 6000,
    finalStock: 0,
  },
  {
    code: "DRINK-AQUA-600",
    name: "Aqua 600ml",
    category: "DRINK",
    price: 5000,
    finalStock: 13,
  },
];

const LEGACY_PRODUCT_CODES = [
  "DRINK-AIR-MINERAL",
  "DRINK-TEH-BOTOL",
  "SNACK-MIE-CUP",
  "SNACK-CHITATO",
  "DRINK-KOPI-SACHET",
];

const DEMO_CASHIER_USERNAMES = DEMO_USERS.filter((user) => user.role === "CASHIER").map(
  (user) => user.username,
);
const DEMO_PRODUCT_CODES = PRODUCT_DEFINITIONS.map((product) => product.code);

const ITEM_PATTERNS = [
  [
    { code: "SNACK-INDOMIE-GORENG", quantity: 2 },
    { code: "DRINK-TEH-BOTOL-350", quantity: 1 },
  ],
  [
    { code: "DRINK-POCARI-350", quantity: 1 },
    { code: "SNACK-CHITATO", quantity: 1 },
  ],
  [{ code: "DRINK-AIR-MINERAL", quantity: 2 }],
  [
    { code: "SNACK-MIE-CUP", quantity: 1 },
    { code: "DRINK-COCA-COLA", quantity: 1 },
  ],
  [
    { code: "SNACK-BENG-BENG", quantity: 2 },
    { code: "DRINK-GOOD-DAY", quantity: 1 },
  ],
  [
    { code: "DRINK-AQUA-600", quantity: 2 },
    { code: "SNACK-KERIPIK-SINGKONG", quantity: 1 },
  ],
  [
    { code: "DRINK-TEH-BOTOL-350", quantity: 2 },
    { code: "DRINK-POCARI-350", quantity: 1 },
    { code: "SNACK-SILVERQUEEN-MINI", quantity: 1 },
  ],
  [
    { code: "SNACK-INDOMIE-GORENG", quantity: 1 },
    { code: "DRINK-ES-TEH", quantity: 2 },
  ],
  [
    { code: "DRINK-FANTA", quantity: 2 },
    { code: "SNACK-CHITATO", quantity: 1 },
  ],
  [
    { code: "DRINK-AQUA-600", quantity: 1 },
    { code: "DRINK-KOPI-SACHET", quantity: 2 },
  ],
];

const CUSTOMER_NAMES = [
  "Adit",
  "Bagus",
  "Candra",
  "Dimas",
  "Eko",
  "Fajar",
  "Galih",
  "Hendra",
  "Iqbal",
  "Joko",
  "Kevin",
  "Lukman",
  "Maman",
  "Nanda",
  "Oki",
  "Pandu",
  "Raka",
  "Rendi",
  "Satrio",
  "Tio",
  "Vino",
  "Wawan",
  "Yoga",
  "Zaki",
];

const ACTIVE_TRANSACTION_CONFIGS = [
  {
    pricingType: "OPEN",
    consoleCode: "PS3-02",
    userUsername: "kasir_pagi",
    customerName: "Raka",
    startMinutesAgo: 28,
    itemsPatternIndex: 0,
  },
  {
    pricingType: "OPEN",
    consoleCode: "PS5-03",
    userUsername: "kasir_sore",
    customerName: "Fajar",
    startMinutesAgo: 96,
    itemsPatternIndex: 5,
  },
  {
    pricingType: "PACKAGE",
    consoleCode: "PS4-03",
    userUsername: "kasir_pagi",
    customerName: "Bima",
    packageName: "2 Jam",
    startMinutesAgo: 50,
    itemsPatternIndex: 1,
  },
  {
    pricingType: "PACKAGE",
    consoleCode: "PS5-05",
    userUsername: "kasir_sore",
    customerName: "Rizky",
    packageName: "1 Jam",
    startMinutesAgo: 92,
    itemsPatternIndex: 8,
  },
];

const MAINTENANCE_CONSOLE_CODE = "PS4-05";
const DAY_SLOT_MINUTES = [9 * 60, 10 * 60 + 30, 12 * 60, 14 * 60, 16 * 60, 18 * 60];
const OPEN_DURATIONS = [45, 60, 75, 90, 120, 150];
const PACKAGE_EXTRA_MINUTES = [0, 5, 10, 15];

function decimal(value) {
  return value.toFixed(2);
}

function getJakartaDayStart(daysAgo = 0) {
  const now = new Date();
  const jakartaNow = new Date(now.getTime() + JAKARTA_OFFSET_MS);
  const startUtcMs =
    Date.UTC(
      jakartaNow.getUTCFullYear(),
      jakartaNow.getUTCMonth(),
      jakartaNow.getUTCDate() - daysAgo,
      0,
      0,
      0,
      0,
    ) - JAKARTA_OFFSET_MS;

  return new Date(startUtcMs);
}

function atJakartaTime(daysAgo, totalMinutes) {
  return new Date(getJakartaDayStart(daysAgo).getTime() + totalMinutes * 60000);
}

function formatDateNumber(date) {
  const jakartaDate = new Date(date.getTime() + JAKARTA_OFFSET_MS);
  const year = jakartaDate.getUTCFullYear();
  const month = String(jakartaDate.getUTCMonth() + 1).padStart(2, "0");
  const day = String(jakartaDate.getUTCDate()).padStart(2, "0");

  return `${year}${month}${day}`;
}

function makeInvoiceNumber(date, sequence) {
  return `TRX-${formatDateNumber(date)}-${String(sequence).padStart(3, "0")}`;
}

function calculateOpenRentalTotal(hourlyRate, durationMinutes) {
  return Math.ceil((hourlyRate * durationMinutes) / 60);
}

function sumItemSubtotal(items, productMap) {
  return items.reduce((total, item) => {
    const product = productMap.get(item.code);
    return total + product.price * item.quantity;
  }, 0);
}

function buildCompletedTransactionPlans() {
  const plans = [];
  let sequence = 1;

  for (let dayAgo = 6; dayAgo >= 0; dayAgo -= 1) {
    for (let slotIndex = 0; slotIndex < 6; slotIndex += 1) {
      const pricingType = slotIndex % 2 === 0 ? "OPEN" : "PACKAGE";
      const consoleType = ["PS3", "PS4", "PS5"][(dayAgo + slotIndex) % 3];
      const consolePool = CONSOLE_CODES[consoleType];
      const consoleCode = consolePool[(dayAgo * 2 + slotIndex) % consolePool.length];
      const customerName = CUSTOMER_NAMES[(sequence - 1) % CUSTOMER_NAMES.length];
      const userUsername = ["kasir_pagi", "kasir_sore", "kasir_nonaktif"][
        (sequence - 1) % 3
      ];
      const startTime = atJakartaTime(dayAgo, DAY_SLOT_MINUTES[slotIndex]);
      const itemsPatternIndex = (sequence + slotIndex) % ITEM_PATTERNS.length;
      const items =
        sequence % 5 === 0 ? [] : ITEM_PATTERNS[itemsPatternIndex].map((item) => ({ ...item }));

      if (pricingType === "OPEN") {
        const durationMinutes = OPEN_DURATIONS[(sequence - 1) % OPEN_DURATIONS.length];
        const endTime = new Date(startTime.getTime() + durationMinutes * 60000);

        plans.push({
          invoiceNumber: makeInvoiceNumber(endTime, sequence),
          pricingType,
          status: "COMPLETED",
          consoleCode,
          consoleType,
          userUsername,
          customerName,
          startTime,
          endTime,
          durationMinutes,
          items,
        });
      } else {
        const packageConfig = PACKAGE_DURATIONS[(sequence - 1) % PACKAGE_DURATIONS.length];
        const actualDurationMinutes =
          packageConfig.durationMinutes +
          PACKAGE_EXTRA_MINUTES[(sequence - 1) % PACKAGE_EXTRA_MINUTES.length];
        const endTime = new Date(startTime.getTime() + actualDurationMinutes * 60000);

        plans.push({
          invoiceNumber: makeInvoiceNumber(endTime, sequence),
          pricingType,
          status: "COMPLETED",
          consoleCode,
          consoleType,
          userUsername,
          customerName,
          startTime,
          endTime,
          durationMinutes: actualDurationMinutes,
          packageName: packageConfig.name,
          packageDurationMinutes: packageConfig.durationMinutes,
          items,
        });
      }

      sequence += 1;
    }
  }

  return plans;
}

function buildActiveTransactionPlans() {
  return ACTIVE_TRANSACTION_CONFIGS.map((config, index) => ({
    invoiceNumber: `TRX-ACTIVE-${String(index + 1).padStart(3, "0")}`,
    pricingType: config.pricingType,
    status: "ACTIVE",
    consoleCode: config.consoleCode,
    consoleType: config.consoleCode.slice(0, 3),
    userUsername: config.userUsername,
    customerName: config.customerName,
    startTime: new Date(Date.now() - config.startMinutesAgo * 60000),
    durationMinutes: null,
    packageName: config.packageName || null,
    items: ITEM_PATTERNS[config.itemsPatternIndex].map((item) => ({ ...item })),
  }));
}

function buildDemoTransactionPlans() {
  return {
    completedPlans: buildCompletedTransactionPlans(),
    activePlans: buildActiveTransactionPlans(),
  };
}

function buildSoldCounts(transactionPlans) {
  const soldCounts = new Map(PRODUCT_DEFINITIONS.map((product) => [product.code, 0]));

  for (const transaction of transactionPlans) {
    for (const item of transaction.items) {
      soldCounts.set(item.code, (soldCounts.get(item.code) || 0) + item.quantity);
    }
  }

  return soldCounts;
}

async function upsertUsers(tx) {
  const userMap = new Map();

  await tx.user.deleteMany({
    where: {
      OR: [
        {
          role: "CASHIER",
          username: {
            notIn: DEMO_CASHIER_USERNAMES,
          },
        },
        {
          role: "CASHIER",
          deletedAt: {
            not: null,
          },
        },
      ],
    },
  });

  for (const user of DEMO_USERS) {
    const passwordHash = await bcrypt.hash(user.password, 10);
    const result = await tx.user.upsert({
      where: { username: user.username },
      update: {
        name: user.name,
        email: user.email,
        password: passwordHash,
        role: user.role,
        isActive: user.isActive,
        deletedAt: null,
      },
      create: {
        name: user.name,
        username: user.username,
        email: user.email,
        password: passwordHash,
        role: user.role,
        isActive: user.isActive,
        deletedAt: null,
      },
    });

    userMap.set(user.username, result);
  }

  return userMap;
}

async function upsertConsoles(tx) {
  const consoleMap = new Map();

  for (const unit of CONSOLE_DEFINITIONS) {
    const result = await tx.playStationUnit.upsert({
      where: { code: unit.code },
      update: {
        name: unit.name,
        consoleType: unit.consoleType,
        status: "AVAILABLE",
        notes: null,
      },
      create: {
        ...unit,
        status: "AVAILABLE",
        notes: null,
      },
    });

    consoleMap.set(unit.code, result);
  }

  return consoleMap;
}

async function upsertRentalRates(tx) {
  const rateMap = new Map();

  for (const rate of RENTAL_RATES) {
    const result = await tx.rentalRate.upsert({
      where: { consoleType: rate.consoleType },
      update: {
        hourlyRate: decimal(rate.hourlyRate),
        isActive: true,
      },
      create: {
        consoleType: rate.consoleType,
        hourlyRate: decimal(rate.hourlyRate),
        isActive: true,
      },
    });

    rateMap.set(rate.consoleType, result);
  }

  return rateMap;
}

async function upsertRentalPackages(tx) {
  const packageMap = new Map();

  const allowedPackageCombos = Object.keys(PACKAGE_PRICE_MAP).flatMap((consoleType) =>
    PACKAGE_DURATIONS.map((duration) => ({
      consoleType,
      name: duration.name,
    })),
  );

  await tx.rentalPackage.deleteMany({
    where: {
      NOT: {
        OR: allowedPackageCombos,
      },
    },
  });

  for (const consoleType of Object.keys(PACKAGE_PRICE_MAP)) {
    for (const duration of PACKAGE_DURATIONS) {
      const price = PACKAGE_PRICE_MAP[consoleType][duration.name];
      const result = await tx.rentalPackage.upsert({
        where: {
          consoleType_name: {
            consoleType,
            name: duration.name,
          },
        },
        update: {
          durationMinutes: duration.durationMinutes,
          price: decimal(price),
          isActive: true,
        },
        create: {
          consoleType,
          name: duration.name,
          durationMinutes: duration.durationMinutes,
          price: decimal(price),
          isActive: true,
        },
      });

      packageMap.set(`${consoleType}:${duration.name}`, result);
    }
  }

  return packageMap;
}

async function upsertProducts(tx, soldCounts) {
  const productMap = new Map();

  await tx.product.deleteMany({
    where: {
      OR: [
        {
          code: {
            in: LEGACY_PRODUCT_CODES,
          },
        },
        {
          code: {
            notIn: DEMO_PRODUCT_CODES,
          },
        },
      ],
    },
  });

  for (const product of PRODUCT_DEFINITIONS) {
    const soldCount = soldCounts.get(product.code) || 0;
    const baseStock = soldCount + product.finalStock;

    const result = await tx.product.upsert({
      where: { code: product.code },
      update: {
        name: product.name,
        category: product.category,
        price: decimal(product.price),
        stock: baseStock,
        isActive: true,
      },
      create: {
        code: product.code,
        name: product.name,
        category: product.category,
        price: decimal(product.price),
        stock: baseStock,
        isActive: true,
      },
    });

    productMap.set(product.code, {
      ...result,
      price: product.price,
      finalStock: product.finalStock,
    });
  }

  return productMap;
}

function mapTransactionItems(items, productMap) {
  return items.map((item) => {
    const product = productMap.get(item.code);
    const subtotal = product.price * item.quantity;

    return {
      productId: product.id,
      quantity: item.quantity,
      unitPriceSnapshot: decimal(product.price),
      subtotalSnapshot: decimal(subtotal),
      productNameSnapshot: product.name,
      productCategorySnapshot: product.category,
    };
  });
}

async function recreateTransactions(
  tx,
  completedPlans,
  activePlans,
  { userMap, consoleMap, rateMap, packageMap, productMap },
) {
  for (const plan of completedPlans) {
    const consoleUnit = consoleMap.get(plan.consoleCode);
    const user = userMap.get(plan.userUsername);
    const rentalRate = rateMap.get(plan.consoleType);
    const itemCreates = mapTransactionItems(plan.items, productMap);
    const productTotal = sumItemSubtotal(plan.items, productMap);

    if (plan.pricingType === "OPEN") {
      const rentalTotal = calculateOpenRentalTotal(
        Number(rentalRate.hourlyRate),
        plan.durationMinutes,
      );

      await tx.transaction.create({
        data: {
          invoiceNumber: plan.invoiceNumber,
          pricingType: "OPEN",
          status: "COMPLETED",
          userId: user.id,
          playStationUnitId: consoleUnit.id,
          rentalRateId: rentalRate.id,
          rentalPackageId: null,
          customerName: plan.customerName,
          startTime: plan.startTime,
          endTime: plan.endTime,
          durationMinutes: plan.durationMinutes,
          extraTimeMinutes: 0,
          hourlyRateSnapshot: decimal(Number(rentalRate.hourlyRate)),
          packageNameSnapshot: null,
          packagePriceSnapshot: null,
          packageDurationSnapshot: null,
          packageDurationMinutesSnapshot: null,
          rentalTotal,
          productTotal,
          grandTotal: rentalTotal + productTotal,
          items: itemCreates.length ? { create: itemCreates } : undefined,
        },
      });
    } else {
      const rentalPackage = packageMap.get(`${plan.consoleType}:${plan.packageName}`);
      const rentalTotal = Number(rentalPackage.price);

      await tx.transaction.create({
        data: {
          invoiceNumber: plan.invoiceNumber,
          pricingType: "PACKAGE",
          status: "COMPLETED",
          userId: user.id,
          playStationUnitId: consoleUnit.id,
          rentalRateId: rentalRate.id,
          rentalPackageId: rentalPackage.id,
          customerName: plan.customerName,
          startTime: plan.startTime,
          endTime: plan.endTime,
          durationMinutes: plan.durationMinutes,
          extraTimeMinutes: 0,
          hourlyRateSnapshot: decimal(Number(rentalRate.hourlyRate)),
          packageNameSnapshot: rentalPackage.name,
          packagePriceSnapshot: decimal(rentalTotal),
          packageDurationSnapshot: rentalPackage.durationMinutes,
          packageDurationMinutesSnapshot: rentalPackage.durationMinutes,
          rentalTotal,
          productTotal,
          grandTotal: rentalTotal + productTotal,
          items: itemCreates.length ? { create: itemCreates } : undefined,
        },
      });
    }
  }

  for (const plan of activePlans) {
    const consoleUnit = consoleMap.get(plan.consoleCode);
    const user = userMap.get(plan.userUsername);
    const rentalRate = rateMap.get(plan.consoleType);
    const itemCreates = mapTransactionItems(plan.items, productMap);
    const productTotal = sumItemSubtotal(plan.items, productMap);

    if (plan.pricingType === "OPEN") {
      await tx.transaction.create({
        data: {
          invoiceNumber: plan.invoiceNumber,
          pricingType: "OPEN",
          status: "ACTIVE",
          userId: user.id,
          playStationUnitId: consoleUnit.id,
          rentalRateId: rentalRate.id,
          rentalPackageId: null,
          customerName: plan.customerName,
          startTime: plan.startTime,
          endTime: null,
          durationMinutes: null,
          extraTimeMinutes: 0,
          hourlyRateSnapshot: decimal(Number(rentalRate.hourlyRate)),
          packageNameSnapshot: null,
          packagePriceSnapshot: null,
          packageDurationSnapshot: null,
          packageDurationMinutesSnapshot: null,
          rentalTotal: 0,
          productTotal,
          grandTotal: productTotal,
          items: itemCreates.length ? { create: itemCreates } : undefined,
        },
      });
    } else {
      const rentalPackage = packageMap.get(`${plan.consoleType}:${plan.packageName}`);
      const rentalTotal = Number(rentalPackage.price);

      await tx.transaction.create({
        data: {
          invoiceNumber: plan.invoiceNumber,
          pricingType: "PACKAGE",
          status: "ACTIVE",
          userId: user.id,
          playStationUnitId: consoleUnit.id,
          rentalRateId: rentalRate.id,
          rentalPackageId: rentalPackage.id,
          customerName: plan.customerName,
          startTime: plan.startTime,
          endTime: null,
          durationMinutes: null,
          extraTimeMinutes: 0,
          hourlyRateSnapshot: decimal(Number(rentalRate.hourlyRate)),
          packageNameSnapshot: rentalPackage.name,
          packagePriceSnapshot: decimal(rentalTotal),
          packageDurationSnapshot: rentalPackage.durationMinutes,
          packageDurationMinutesSnapshot: rentalPackage.durationMinutes,
          rentalTotal,
          productTotal,
          grandTotal: rentalTotal + productTotal,
          items: itemCreates.length ? { create: itemCreates } : undefined,
        },
      });
    }
  }
}

async function finalizeProductStocks(tx, soldCounts) {
  for (const product of PRODUCT_DEFINITIONS) {
    const soldCount = soldCounts.get(product.code) || 0;
    const targetStock = Math.max(0, soldCount + product.finalStock - soldCount);

    await tx.product.update({
      where: { code: product.code },
      data: { stock: targetStock },
    });
  }
}

async function finalizeConsoleStatuses(tx) {
  const activeConsoleCodes = new Set(
    ACTIVE_TRANSACTION_CONFIGS.map((transaction) => transaction.consoleCode),
  );

  for (const unit of CONSOLE_DEFINITIONS) {
    let status = "AVAILABLE";
    let notes = null;

    if (unit.code === MAINTENANCE_CONSOLE_CODE) {
      status = "MAINTENANCE";
      notes = "Demo maintenance untuk admin console.";
    } else if (activeConsoleCodes.has(unit.code)) {
      status = "IN_USE";
    }

    await tx.playStationUnit.update({
      where: { code: unit.code },
      data: {
        status,
        notes,
      },
    });
  }
}

async function seedDemoData() {
  const { completedPlans, activePlans } = buildDemoTransactionPlans();
  const soldCounts = buildSoldCounts([...completedPlans, ...activePlans]);

  await prisma.$transaction(async (tx) => {
    await tx.transactionItem.deleteMany();
    await tx.transaction.deleteMany();

    const userMap = await upsertUsers(tx);
    const consoleMap = await upsertConsoles(tx);
    const rateMap = await upsertRentalRates(tx);
    const packageMap = await upsertRentalPackages(tx);
    const productMap = await upsertProducts(tx, soldCounts);

    await recreateTransactions(tx, completedPlans, activePlans, {
      userMap,
      consoleMap,
      rateMap,
      packageMap,
      productMap,
    });

    await finalizeProductStocks(tx, soldCounts);
    await finalizeConsoleStatuses(tx);
  });
}

async function printSummary() {
  const [
    adminUserCount,
    cashierCount,
    consoleCount,
    rentalRateCount,
    rentalPackageCount,
    productCount,
    completedTransactionCount,
    activeTransactionCount,
    criticalProductCount,
  ] = await Promise.all([
    prisma.user.count({
      where: {
        role: "ADMIN",
        deletedAt: null,
      },
    }),
    prisma.user.count({
      where: {
        role: "CASHIER",
        deletedAt: null,
      },
    }),
    prisma.playStationUnit.count(),
    prisma.rentalRate.count(),
    prisma.rentalPackage.count(),
    prisma.product.count(),
    prisma.transaction.count({
      where: { status: "COMPLETED" },
    }),
    prisma.transaction.count({
      where: { status: "ACTIVE" },
    }),
    prisma.product.count({
      where: {
        isActive: true,
        stock: { lte: 5 },
      },
    }),
  ]);

  console.log("Seed demo berhasil dijalankan.");
  console.table([
    { entity: "Admin User count", count: adminUserCount },
    { entity: "Cashier count", count: cashierCount },
    { entity: "Console count", count: consoleCount },
    { entity: "RentalRate count", count: rentalRateCount },
    { entity: "RentalPackage count", count: rentalPackageCount },
    { entity: "Product count", count: productCount },
    { entity: "CompletedTransaction count", count: completedTransactionCount },
    { entity: "ActiveTransaction count", count: activeTransactionCount },
    { entity: "CriticalProduct count", count: criticalProductCount },
  ]);
  console.log("Demo login:");
  console.log(`- Admin: admin@rentalps.local / ${ADMIN_PASSWORD}`);
  console.log(`- Cashier: kasir_pagi / ${CASHIER_PASSWORD}`);
  console.log(`- Cashier: kasir_sore / ${CASHIER_PASSWORD}`);
}

async function main() {
  await seedDemoData();
  await printSummary();
}

main()
  .catch((error) => {
    console.error("Seed demo gagal dijalankan.");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
