const prisma = require("./prisma");

exports.auditLog = async (req, payload) => {
  try {
    let tenantId;

    // 🔐 RULE 1: USER actions ALWAYS have tenant
    if (req.user?.role === "USER") {
      tenantId = req.user.tenantId;
    }
    // 🔐 RULE 2: SUPERADMIN tenant actions
    else if (payload.tenantId) {
      tenantId = payload.tenantId;
    }
    // 🔐 RULE 3: SYSTEM actions
    else {
      tenantId = "SYSTEM";
    }

    let tenantMeta = null;

    if (tenantId !== "SYSTEM") {
      tenantMeta = await prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { name: true, domain: true },
      });
    }

    await prisma.auditLog.create({
      data: {
        tenantId,
        tenantName: tenantMeta?.name || null,
        tenantDomain: tenantMeta?.domain || null,

        entityType: payload.entityType,
        entityId: payload.entityId,
        action: payload.action,

        // ❌ NO tenant inside newValue
        oldValue: payload.oldValue || null,
        newValue: payload.newValue || null,

        performedBy: req.user?.id || "SYSTEM",
        source: payload.source || req.user?.role || "SYSTEM",
      },
    });
  } catch (err) {
    console.error("AUDIT FAILED ❌", err);
    // never break main API
  }
};
