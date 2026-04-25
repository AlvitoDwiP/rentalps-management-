const {
  getActiveUserById,
  verifyAccessToken,
} = require("../services/auth/auth.service");

async function authenticate(req, res, next) {
  try {
    const authorizationHeader = req.headers.authorization || "";

    if (!authorizationHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Token tidak ditemukan",
      });
    }

    const token = authorizationHeader.slice(7).trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token tidak ditemukan",
      });
    }

    const payload = verifyAccessToken(token);
    const user = await getActiveUserById(payload.sub);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Token tidak valid atau user sudah tidak aktif",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token tidak valid atau sudah kedaluwarsa",
    });
  }
}

module.exports = {
  authenticate,
};
