const consoleService = require("../../services/console/console.service");

async function listConsoles(req, res, next) {
  try {
    const consoles = await consoleService.listConsoles();

    res.status(200).json({
      success: true,
      data: consoles,
    });
  } catch (error) {
    next(error);
  }
}

async function setConsoleMaintenance(req, res, next) {
  try {
    const { id } = req.params;
    const updatedConsole = await consoleService.setConsoleMaintenance(id, req.body || {});

    res.status(200).json({
      success: true,
      data: updatedConsole,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listConsoles,
  setConsoleMaintenance,
};
