const prisma = require("../config/prisma");
const {
  startOpenTransaction,
  startPackageTransaction,
  finishTransaction,
  addTransactionItem,
  moveTransactionConsole,
  getActiveTransactions,
} = require("../services/transaction.service");

function sanitizeTransactionResponse(transaction) {
  if (!transaction) {
    return transaction;
  }

  if (!transaction.user) {
    return transaction;
  }

  const { password, ...safeUser } = transaction.user;

  return {
    ...transaction,
    user: safeUser,
  };
}

async function listActiveTransactions(req, res, next) {
  try {
    const transactions = (await getActiveTransactions()).map(sanitizeTransactionResponse);

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
      data: sanitizeTransactionResponse(transaction),
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
      data: sanitizeTransactionResponse(transaction),
    });
  } catch (error) {
    next(error);
  }
}

async function createTransactionItem(req, res, next) {
  try {
    const { transactionId } = req.params;
    const { productId, productName, quantity } = req.body || {};

    let resolvedProductId = productId;

    if (!resolvedProductId && productName) {
      const product = await prisma.product.findFirst({
        where: {
          name: productName,
        },
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Produk dengan nama "${productName}" tidak ditemukan.`,
        });
      }

      resolvedProductId = product.id;
    }

    if (!resolvedProductId) {
      return res.status(400).json({
        success: false,
        message: "productId atau productName wajib diisi.",
      });
    }

    const transaction = await addTransactionItem({
      transactionId,
      productId: resolvedProductId,
      quantity,
    });

    res.status(200).json({
      success: true,
      data: sanitizeTransactionResponse(transaction),
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
      data: sanitizeTransactionResponse(transaction),
    });
  } catch (error) {
    next(error);
  }
}

async function changeTransactionConsole(req, res, next) {
  try {
    const { transactionId } = req.params;
    const { targetConsoleId, targetConsoleCode } = req.body || {};
    const transaction = await moveTransactionConsole({
      transactionId,
      targetConsoleId,
      targetConsoleCode,
    });

    res.status(200).json({
      success: true,
      data: sanitizeTransactionResponse(transaction),
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
