const express = require("express");

const {
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/product/product.controller");
const {
  createPackage,
  updatePackage,
  deletePackage,
} = require("../controllers/package/package.controller");
const { updateRate } = require("../controllers/rate/rate.controller");
const { setConsoleMaintenance } = require("../controllers/console/console.controller");
const { createUser } = require("../controllers/user/user.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

const router = express.Router();

router.use(authenticate);
router.use(authorizeRoles("ADMIN"));

router.post("/products", createProduct);
router.patch("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);

router.post("/packages", createPackage);
router.patch("/packages/:id", updatePackage);
router.delete("/packages/:id", deletePackage);

router.patch("/rates/:id", updateRate);
router.patch("/consoles/:id/maintenance", setConsoleMaintenance);
router.post("/users", createUser);

module.exports = router;
