const prisma = require("../src/config/prisma");

async function main() {
  const result = await prisma.$queryRaw`
    SELECT current_user::text AS current_user,
           current_database()::text AS current_database
  `;

  console.log("Prisma connected successfully.");
  console.table(result);
}

main()
  .catch((error) => {
    console.error("Prisma connection test failed.");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
