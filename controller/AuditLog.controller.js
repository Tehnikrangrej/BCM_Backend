const prisma = require("../utils/prisma");

/* ================= GET ALL AUDIT LOGS ================= */
exports.getAuditLogs = async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    console.error("Get Audit Logs Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch audit logs",
    });
  }
};

/* ================= GET AUDIT LOGS BY ENTITY ID ================= */
exports.getAuditByEntityId = async (req, res) => {
  try {
    const { entityId } = req.params;

    const logs = await prisma.auditLog.findMany({
      where: { entityId },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    console.error("Get Audit By Entity Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch audit logs by entity",
    });
  }
};
