const prisma = require("../utils/prisma");

exports.tenantMiddleware = async (req, res, next) => {
  try {
    const tenantDomain = req.headers["x-tenant-domain"];

    if (!tenantDomain) {
      return res.status(400).json({
        success: false,
        message: "Tenant domain is required",
      });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { domain: tenantDomain },
    });

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: "Tenant not found",
      });
    }

    if (!tenant.isActive) {
      return res.status(403).json({
        success: false,
        message: "Tenant is blocked",
      });
    }

    // attach tenant to request
    req.tenant = tenant;

    next();
  } catch (error) {
    console.error("Tenant Middleware Error:", error);
    return res.status(500).json({
      success: false,
      message: "Tenant validation failed",
      error: error.message,
    });
  }
};
