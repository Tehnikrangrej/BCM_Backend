const prisma = require("../utils/prisma");

exports.checkProcurementEnabled = async (req, res, next) => {
  const tenant = await prisma.tenant.findUnique({
    where: { id: req.user.tenantId },
    select: { procurement: true }
  });

  if (!tenant.procurement) {
    return res.status(403).json({
      success: false,
      message: "Procurement module is disabled for your company"
    });
  }

  next();
};
