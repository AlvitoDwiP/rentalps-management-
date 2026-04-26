const userService = require("../../services/user/user.service");

async function listUsers(req, res, next) {
  try {
    const role = typeof req.query.role === "string" ? req.query.role.trim().toUpperCase() : undefined;
    const includeDeleted =
      typeof req.query.includeDeleted === "string" &&
      req.query.includeDeleted.trim().toLowerCase() === "true";
    const isActive =
      req.query.status === "active"
        ? true
        : req.query.status === "inactive"
          ? false
          : undefined;

    const users = await userService.listUsers({
      role,
      isActive,
      includeDeleted,
    });

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
}

async function createUser(req, res, next) {
  try {
    const user = await userService.createUser(req.body || {});

    res.status(201).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

async function updateUserStatus(req, res, next) {
  try {
    const { id } = req.params;
    const user = await userService.updateUserStatus(id, req.body || {}, req.user || {});

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

async function deleteUser(req, res, next) {
  try {
    const { id } = req.params;
    const user = await userService.deleteUser(id, req.user || {});

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listUsers,
  createUser,
  updateUserStatus,
  deleteUser,
};
