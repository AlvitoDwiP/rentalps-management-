const { getTodaySummary } = require("../../services/report/report.service");

async function todaySummaryController(req, res, next) {
  try {
    const summary = await getTodaySummary();

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  todaySummaryController,
};
