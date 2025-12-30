const prisma = require("../utils/prisma");
const { auditLog } = require("../utils/audit.helper");


/**
 * ==============================
 * CREATE PR (USER ONLY)
 * ==============================
 */
exports.createPurchaseRequisition = async (req, res) => {
  try {
    if (req.user.role !== "USER") {
      return res.status(403).json({
        success: false,
        message: "SuperAdmin cannot create Purchase Requisition",
      });
    }

    const {
      referenceNumber,
      name,
      preparedBy,
      requestedDate,
      accountingDate,
      reason,
      serviceStartDate,
      serviceEndDate,
    } = req.body;

    const pr = await prisma.purchaseRequisition.create({
      data: {
        referenceNumber,
        name,
        preparedBy,
        status: "DRAFT",
        requestedDate: new Date(requestedDate),
        accountingDate: new Date(accountingDate),
        reason,
        serviceStartDate,
        serviceEndDate,
        tenantId: req.user.tenantId,
        createdById: req.user.id,
      },
    });

    await auditLog(req, {
  entityType: "PURCHASE_REQUISITION",
  entityId: pr.id,
  action: "CREATE",
  tenantId: pr.tenantId,
  newValue: {
    referenceNumber: pr.referenceNumber,
    name: pr.name,
    status: pr.status,
    reason: pr.reason,
    requestedDate: pr.requestedDate,
    accountingDate: pr.accountingDate,
    createdById: pr.createdById,
  },
  source: req.user.role,
});

    return res.status(201).json({
      success: true,
      data: pr,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * ==============================
 * GET ALL PRs
 * ==============================
 */
exports.getAllPurchaseRequisitions = async (req, res) => {
  try {
    const where =
      req.user.role === "SUPERADMIN"
        ? {}
        : { tenantId: req.user.tenantId };

    const prs = await prisma.purchaseRequisition.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return res.json({
      success: true,
      data: prs,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * ==============================
 * GET PR BY ID
 * ==============================
 */
exports.getPurchaseRequisitionById = async (req, res) => {
  try {
    const where =
      req.user.role === "SUPERADMIN"
        ? { id: req.params.id }
        : { id: req.params.id, tenantId: req.user.tenantId };

    const pr = await prisma.purchaseRequisition.findFirst({ where });

    if (!pr) {
      return res.status(404).json({
        success: false,
        message: "Purchase Requisition not found",
      });
    }

    return res.json({
      success: true,
      data: pr,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * ==============================
 * UPDATE PR
 * ==============================
 */
exports.updatePurchaseRequisition = async (req, res) => {
  try {
    const where =
      req.user.role === "SUPERADMIN"
        ? { id: req.params.id }
        : { id: req.params.id, tenantId: req.user.tenantId };

    const existing = await prisma.purchaseRequisition.findFirst({ where });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Purchase Requisition not found",
      });
    }

    if (existing.status === "BLOCKED") {
      return res.status(403).json({
        success: false,
        message: "Blocked Purchase Requisition cannot be updated",
      });
    }

    const pr = await prisma.purchaseRequisition.update({
      where: { id: existing.id },
      data: req.body,
    });

    // 🔍 AUDIT – UPDATE
    await auditLog(req, {
      entityType: "PURCHASE_REQUISITION",
      entityId: existing.id,
      action: "UPDATE",
      oldValue: {
        name: existing.name,
        reason: existing.reason,
        status: existing.status,
      },
      newValue: {
        name: pr.name,
        reason: pr.reason,
        status: pr.status,
      },
      source: req.user.role,
    });

    return res.json({
      success: true,
      data: pr,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * ==============================
 * DELETE PR
 * ==============================
 */
exports.deletePurchaseRequisition = async (req, res) => {
  try {
    const where =
      req.user.role === "SUPERADMIN"
        ? { id: req.params.id }
        : { id: req.params.id, tenantId: req.user.tenantId };

    const existing = await prisma.purchaseRequisition.findFirst({ where });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Purchase Requisition not found",
      });
    }

    if (existing.status === "BLOCKED") {
      return res.status(403).json({
        success: false,
        message: "Blocked Purchase Requisition cannot be deleted",
      });
    }

    await prisma.purchaseRequisition.delete({
      where: { id: existing.id },
    });

    // 🔍 AUDIT – DELETE
  await auditLog(req, {
      entityType: "PURCHASE_REQUISITION",
      entityId: existing.id,
      action: "DELETE",
      oldValue: {
        referenceNumber: existing.referenceNumber,
        status: existing.status,
        tenantId: existing.tenantId,
      },
      source: req.user.role,
    });

    return res.json({
      success: true,
      message: "Purchase Requisition deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
