require("dotenv").config();

const app = require("./app");
const prisma = require("./lib/prisma");

const PORT = Number.parseInt(process.env.PORT, 10) || 3000;

const server = app.listen(PORT, () => {
  console.log(`Rental PS API listening on http://localhost:${PORT}`);
});

async function shutdown(signal) {
  console.log(`${signal} received. Shutting down server...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGINT", () => {
  shutdown("SIGINT").catch((error) => {
    console.error(error);
    process.exit(1);
  });
});

process.on("SIGTERM", () => {
  shutdown("SIGTERM").catch((error) => {
    console.error(error);
    process.exit(1);
  });
});
