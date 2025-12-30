const prisma = require("./prisma");

exports.auditLog = async (req, payload) => {
  try {
    await prisma.auditLog.create({
      data: {
        tenantId:
          payload.tenantId ||        // explicit
          req.user?.tenantId ||       // from JWT
          "SYSTEM",                  // fallback (VERY IMPORTANT)

        entityType: payload.entityType,
        entityId: payload.entityId,
        action: payload.action,

        oldValue: payload.oldValue || null,
        newValue: payload.newValue || null,

        performedBy: req.user?.id || "SYSTEM",
        source: payload.source || "SYSTEM",
      },
    });
  } catch (error) {
    console.error("AUDIT LOG FAILED ❌", error);
    // ❗ DO NOT THROW — audit must never crash live API
  }
};
