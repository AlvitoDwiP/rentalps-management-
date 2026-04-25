const packageService = require("../../services/package/package.service");

async function listPackages(req, res, next) {
  try {
    const packages = await packageService.listPackages();

    res.status(200).json({
      success: true,
      data: packages,
    });
  } catch (error) {
    next(error);
  }
}

async function createPackage(req, res, next) {
  try {
    const rentalPackage = await packageService.createPackage(req.body || {});

    res.status(201).json({
      success: true,
      data: rentalPackage,
    });
  } catch (error) {
    next(error);
  }
}

async function updatePackage(req, res, next) {
  try {
    const { id } = req.params;
    const rentalPackage = await packageService.updatePackage(id, req.body || {});

    res.status(200).json({
      success: true,
      data: rentalPackage,
    });
  } catch (error) {
    next(error);
  }
}

async function deletePackage(req, res, next) {
  try {
    const { id } = req.params;
    const rentalPackage = await packageService.deletePackage(id);

    res.status(200).json({
      success: true,
      data: rentalPackage,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listPackages,
  createPackage,
  updatePackage,
  deletePackage,
};
