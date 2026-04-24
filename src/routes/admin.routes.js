const express = require("express");

const {
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/admin/product.admin.controller");
const {
  createPackage,
  updatePackage,
  deletePackage,
} = require("../controllers/admin/package.admin.controller");
const { updateRate } = require("../controllers/admin/rate.admin.controller");
const { setConsoleMaintenance } = require("../controllers/admin/console.admin.controller");
const { createUser } = require("../controllers/admin/user.admin.controller");
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
