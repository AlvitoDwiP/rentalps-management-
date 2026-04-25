const rateService = require("../../services/rate/rate.service");

async function listRates(req, res, next) {
  try {
    const rates = await rateService.listRates();

    res.status(200).json({
      success: true,
      data: rates,
    });
  } catch (error) {
    next(error);
  }
}

async function updateRate(req, res, next) {
  try {
    const { id } = req.params;
    const rentalRate = await rateService.updateRate(id, req.body || {});

    res.status(200).json({
      success: true,
      data: rentalRate,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listRates,
  updateRate,
};
