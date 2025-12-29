const prisma = require("./prisma");

exports.auditLog = async (
  req,
  {
    entityType,
    entityId,
    action,
    oldValue = null,
    newValue = null,
    source = "SYSTEM",
  }
) => {
  try {
    await prisma.auditLog.create({
      data: {
        tenantId: req.tenant?.id || "GLOBAL",
        entityType,
        entityId,
        action,
        oldValue,
        newValue,
        performedBy: req.user?.id || "SYSTEM",
        source,
      },
    });
  } catch (error) {
    // ❗ Audit must NEVER stop business logic
    console.error("AuditLog Error:", error.message);
  }
};
