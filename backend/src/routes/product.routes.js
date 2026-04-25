const express = require("express");

const { listProducts } = require("../controllers/product/product.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

const router = express.Router();

router.use(authenticate, authorizeRoles("ADMIN", "CASHIER"));
router.get("/", listProducts);

module.exports = router;
