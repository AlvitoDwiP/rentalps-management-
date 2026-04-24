const express = require("express");

const {
  listActiveTransactions,
  createOpenTransaction,
  createPackageTransaction,
  createTransactionItem,
  completeTransaction,
  changeTransactionConsole,
} = require("../controllers/transaction.controller");

const router = express.Router();

router.get("/active", listActiveTransactions);
router.post("/open", createOpenTransaction);
router.post("/package", createPackageTransaction);
router.post("/:transactionId/items", createTransactionItem);
router.post("/:transactionId/finish", completeTransaction);
router.patch("/:transactionId/console", changeTransactionConsole);

module.exports = router;
