const userService = require("../../services/user/user.service");

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

module.exports = {
  createUser,
};
