const express = require("express");

const { listConsoles } = require("../controllers/console.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

const router = express.Router();

router.use(authenticate, authorizeRoles("ADMIN", "CASHIER"));
router.get("/", listConsoles);

module.exports = router;
