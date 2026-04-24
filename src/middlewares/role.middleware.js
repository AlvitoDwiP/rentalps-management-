function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User belum terautentikasi",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Anda tidak memiliki akses ke resource ini",
      });
    }

    next();
  };
}

module.exports = {
  authorizeRoles,
};
