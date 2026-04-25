const { getAdminDashboardData } = require("../../services/report/adminDashboard.service");

async function adminDashboardController(req, res, next) {
  try {
    const dashboard = await getAdminDashboardData();

    res.status(200).json({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  adminDashboardController,
};
