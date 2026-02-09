const prisma = require("./prisma");

exports.auditLog = async (req, payload) => {
  try {
    let tenantId = null;

    // 🔒 RULE 1: USER actions MUST have tenant
    if (req.user?.role === "USER") {
      tenantId = req.user.tenantId;
    }
    // 🔒 RULE 2: SUPERADMIN tenant actions
    else if (payload.tenantId) {
      tenantId = payload.tenantId;
    }
    // 🔒 RULE 3: SYSTEM / LOGIN / background
    else {
      tenantId = "SYSTEM";
    }

    // 🏢 Fetch tenant metadata ONLY if real tenant
    let tenantMeta = null;

    if (tenantId && tenantId !== "SYSTEM") {
      tenantMeta = await prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { name: true, domain: true },
      });
    }

    await prisma.auditLog.create({
      data: {
        tenantId,

        entityType: payload.entityType,
        entityId: payload.entityId,
        action: payload.action,

        oldValue: payload.oldValue || null,

        newValue: {
          ...(payload.newValue || {}),
          tenant: tenantMeta
            ? {
                name: tenantMeta.name,
                domain: tenantMeta.domain,
              }
            : null,
        },

        performedBy: req.user?.id || "SYSTEM",
        source: payload.source || req.user?.role || "SYSTEM",
      },
    });
  } catch (error) {
    console.error("AUDIT LOG FAILED ❌", error);
    // ❗ NEVER crash main API
  }
};
