const express = require("express");

const { todaySummaryController } = require("../controllers/report/report.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

const router = express.Router();

router.use(authenticate, authorizeRoles("ADMIN", "CASHIER"));
router.get("/today-summary", todaySummaryController);

module.exports = router;
