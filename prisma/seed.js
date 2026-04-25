const path = require("path");

require("dotenv").config({
  path: path.resolve(__dirname, "../backend/.env"),
});

const bcrypt = require("bcrypt");
const prisma = require("../backend/src/lib/prisma");

const ADMIN_PASSWORD = "admin123";
const ADMIN_EMAIL = "admin@rentalps.local";
const ADMIN_USERNAME = "admin";

const consoleUnits = [
  ...Array.from({ length: 5 }, (_, index) => ({
    code: `PS3-${String(index + 1).padStart(2, "0")}`,
    name: `PlayStation 3 ${String(index + 1).padStart(2, "0")}`,
    consoleType: "PS3",
  })),
  ...Array.from({ length: 5 }, (_, index) => ({
    code: `PS4-${String(index + 1).padStart(2, "0")}`,
    name: `PlayStation 4 ${String(index + 1).padStart(2, "0")}`,
    consoleType: "PS4",
  })),
  ...Array.from({ length: 5 }, (_, index) => ({
    code: `PS5-${String(index + 1).padStart(2, "0")}`,
    name: `PlayStation 5 ${String(index + 1).padStart(2, "0")}`,
    consoleType: "PS5",
  })),
];

const rentalRates = [
  { consoleType: "PS3", hourlyRate: 5000 },
  { consoleType: "PS4", hourlyRate: 8000 },
  { consoleType: "PS5", hourlyRate: 12000 },
];

const rentalPackages = [
  { consoleType: "PS3", name: "1 Jam", durationMinutes: 60, price: 5000 },
  { consoleType: "PS3", name: "2 Jam", durationMinutes: 120, price: 10000 },
  { consoleType: "PS3", name: "3 Jam", durationMinutes: 180, price: 15000 },
  { consoleType: "PS4", name: "1 Jam", durationMinutes: 60, price: 8000 },
  { consoleType: "PS4", name: "2 Jam", durationMinutes: 120, price: 16000 },
  { consoleType: "PS4", name: "3 Jam", durationMinutes: 180, price: 24000 },
  { consoleType: "PS5", name: "1 Jam", durationMinutes: 60, price: 12000 },
  { consoleType: "PS5", name: "2 Jam", durationMinutes: 120, price: 24000 },
  { consoleType: "PS5", name: "3 Jam", durationMinutes: 180, price: 36000 },
];

const products = [
  {
    code: "DRINK-AIR-MINERAL",
    name: "Air Mineral",
    category: "DRINK",
    price: 4000,
    stock: 30,
  },
  {
    code: "DRINK-TEH-BOTOL",
    name: "Teh Botol",
    category: "DRINK",
    price: 5000,
    stock: 30,
  },
  {
    code: "SNACK-MIE-CUP",
    name: "Mie Cup",
    category: "SNACK",
    price: 8000,
    stock: 20,
  },
  {
    code: "SNACK-CHITATO",
    name: "Chitato",
    category: "SNACK",
    price: 10000,
    stock: 15,
  },
  {
    code: "DRINK-KOPI-SACHET",
    name: "Kopi Sachet",
    category: "DRINK",
    price: 5000,
    stock: 25,
  },
];

async function seedAdminUser() {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  return prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      name: "Admin",
      username: ADMIN_USERNAME,
      password: passwordHash,
      role: "ADMIN",
      isActive: true,
    },
    create: {
      name: "Admin",
      username: ADMIN_USERNAME,
      email: ADMIN_EMAIL,
      password: passwordHash,
      role: "ADMIN",
      isActive: true,
    },
  });
}

async function seedConsoleUnits() {
  await Promise.all(
    consoleUnits.map((unit) =>
      prisma.playStationUnit.upsert({
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
        },
      }),
    ),
  );
}

async function seedRentalRates() {
  await Promise.all(
    rentalRates.map((rate) =>
      prisma.rentalRate.upsert({
        where: { consoleType: rate.consoleType },
        update: {
          hourlyRate: rate.hourlyRate,
          isActive: true,
        },
        create: {
          ...rate,
          isActive: true,
        },
      }),
    ),
  );
}

async function seedRentalPackages() {
  await Promise.all(
    rentalPackages.map((pkg) =>
      prisma.rentalPackage.upsert({
        where: {
          consoleType_name: {
            consoleType: pkg.consoleType,
            name: pkg.name,
          },
        },
        update: {
          durationMinutes: pkg.durationMinutes,
          price: pkg.price,
          isActive: true,
        },
        create: {
          ...pkg,
          isActive: true,
        },
      }),
    ),
  );
}

async function seedProducts() {
  await Promise.all(
    products.map((product) =>
      prisma.product.upsert({
        where: { code: product.code },
        update: {
          name: product.name,
          category: product.category,
          price: product.price,
          stock: product.stock,
          isActive: true,
        },
        create: {
          ...product,
          isActive: true,
        },
      }),
    ),
  );
}

async function printSummary() {
  const [userCount, consoleCount, rentalRateCount, rentalPackageCount, productCount] =
    await Promise.all([
      prisma.user.count({
        where: { email: ADMIN_EMAIL },
      }),
      prisma.playStationUnit.count(),
      prisma.rentalRate.count(),
      prisma.rentalPackage.count(),
      prisma.product.count(),
    ]);

  console.log("Seed selesai.");
  console.table([
    { entity: "Admin User", count: userCount },
    { entity: "PlayStationUnit", count: consoleCount },
    { entity: "RentalRate", count: rentalRateCount },
    { entity: "RentalPackage", count: rentalPackageCount },
    { entity: "Product", count: productCount },
  ]);
  console.log(`Default admin login: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
}

async function main() {
  await seedAdminUser();
  await seedConsoleUnits();
  await seedRentalRates();
  await seedRentalPackages();
  await seedProducts();
  await printSummary();
}

main()
  .catch((error) => {
    console.error("Seed gagal dijalankan.");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
