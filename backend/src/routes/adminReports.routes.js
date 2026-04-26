const express = require("express");

const {
  adminReportsSummaryController,
} = require("../controllers/report/adminReports.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

const router = express.Router();

router.use(authenticate, authorizeRoles("ADMIN"));
router.get("/summary", adminReportsSummaryController);

module.exports = router;
