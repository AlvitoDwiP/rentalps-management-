const express = require("express");

const { listPackages } = require("../controllers/package/package.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

const router = express.Router();

router.use(authenticate, authorizeRoles("ADMIN", "CASHIER"));
router.get("/", listPackages);

module.exports = router;
