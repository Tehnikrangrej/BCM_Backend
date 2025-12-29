exports.onlySuperAdmin = (req, res, next) => {
  if (req.user.role !== "SUPERADMIN") {
    return res.status(403).json({
      success: false,
      message: "Access denied. SuperAdmin only.",
    });
  }

  next();
};
