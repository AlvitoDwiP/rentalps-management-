const { getAdminReportsSummary } = require("../../services/report/adminReports.service");

async function adminReportsSummaryController(req, res, next) {
  try {
    const report = await getAdminReportsSummary({
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    });

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  adminReportsSummaryController,
};
