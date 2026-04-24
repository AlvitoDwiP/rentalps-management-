const prisma = require("../config/prisma");

async function listProducts(req, res, next) {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        name: "asc",
      },
    });

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listProducts,
};
