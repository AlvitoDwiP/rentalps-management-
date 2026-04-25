const express = require("express");

const { adminDashboardController } = require("../controllers/report/adminDashboard.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

const router = express.Router();

router.use(authenticate, authorizeRoles("ADMIN"));
router.get("/", adminDashboardController);

module.exports = router;
