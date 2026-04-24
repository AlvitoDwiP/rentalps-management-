const { login } = require("../services/auth.service");

async function loginController(req, res, next) {
  try {
    const result = await login(req.body || {});

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  loginController,
};
