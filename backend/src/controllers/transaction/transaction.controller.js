const {
  startOpenTransaction,
  startPackageTransaction,
  finishTransaction,
  addTransactionItem,
  moveTransactionConsole,
  getActiveTransactions,
} = require("../../services/transaction/transaction.service");

async function listActiveTransactions(req, res, next) {
  try {
    const transactions = await getActiveTransactions();

    res.status(200).json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
}

async function createOpenTransaction(req, res, next) {
  try {
    const transaction = await startOpenTransaction({
      ...(req.body || {}),
      userId: req.user.id,
    });

    res.status(201).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
}

async function createPackageTransaction(req, res, next) {
  try {
    const transaction = await startPackageTransaction({
      ...(req.body || {}),
      userId: req.user.id,
    });

    res.status(201).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
}

async function createTransactionItem(req, res, next) {
  try {
    const { transactionId } = req.params;
    const transaction = await addTransactionItem({
      transactionId,
      ...(req.body || {}),
    });

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
}

async function completeTransaction(req, res, next) {
  try {
    const { transactionId } = req.params;
    const transaction = await finishTransaction(transactionId);

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
}

async function changeTransactionConsole(req, res, next) {
  try {
    const { transactionId } = req.params;
    const transaction = await moveTransactionConsole({
      transactionId,
      ...(req.body || {}),
    });

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listActiveTransactions,
  createOpenTransaction,
  createPackageTransaction,
  createTransactionItem,
  completeTransaction,
  changeTransactionConsole,
};
