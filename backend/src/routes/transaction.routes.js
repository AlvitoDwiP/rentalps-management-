const express = require("express");

const {
  listActiveTransactions,
  createOpenTransaction,
  createPackageTransaction,
  createTransactionItem,
  completeTransaction,
  changeTransactionConsole,
} = require("../controllers/transaction/transaction.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

const router = express.Router();

router.use(authenticate, authorizeRoles("ADMIN", "CASHIER"));
router.get("/active", listActiveTransactions);
router.post("/open", createOpenTransaction);
router.post("/package", createPackageTransaction);
router.post("/:transactionId/items", createTransactionItem);
router.post("/:transactionId/finish", completeTransaction);
router.patch("/:transactionId/console", changeTransactionConsole);

module.exports = router;
