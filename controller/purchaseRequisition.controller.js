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
      lines = [], // 👈 NEW
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

        // ✅ PRLineItem handled here
        lines: {
          create: lines.map((l) => ({
            lineItemNumber: l.lineItemNumber,
            itemNumber: l.itemNumber,
            itemDescription: l.itemDescription,
            productName: l.productName,
            quantity: l.quantity,
            unit: l.unit,
            deliveryLocation: l.deliveryLocation,
            receivingOperatingUnit: l.receivingOperatingUnit,
            requester: l.requester,
            projectId: l.projectId,
            projectCategory: l.projectCategory,
            customer: l.customer,
            property: l.property,
            activity: l.activity,
            costCentre: l.costCentre,
            employee: l.employee,
            subActivity: l.subActivity,
          })),
        },
      },
      include: { lines: true }, // 👈 IMPORTANT
    });

    // 🔍 AUDIT – CREATE
    await auditLog(req, {
      entityType: "PURCHASE_REQUISITION",
      entityId: pr.id,
      action: "CREATE",
      tenantId: pr.tenantId,
      newValue: {
        referenceNumber: pr.referenceNumber,
        name: pr.name,
        status: pr.status,
        totalLines: pr.lines.length,
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
      include: { lines: true }, // 👈 NEW
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

    const pr = await prisma.purchaseRequisition.findFirst({
      where,
      include: { lines: true }, // 👈 NEW
    });

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
    const { lines = [], ...prData } = req.body;

    const where =
      req.user.role === "SUPERADMIN"
        ? { id: req.params.id }
        : { id: req.params.id, tenantId: req.user.tenantId };

    const existing = await prisma.purchaseRequisition.findFirst({
      where,
      include: { lines: true },
    });

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

    // 1️⃣ Update PR header
    const pr = await prisma.purchaseRequisition.update({
      where: { id: existing.id },
      data: prData,
    });

    // 2️⃣ Replace PRLineItems
    await prisma.pRLineItem.deleteMany({
      where: { purchaseReqId: existing.id },
    });

    if (lines.length) {
      await prisma.pRLineItem.createMany({
        data: lines.map((l) => ({
          purchaseReqId: existing.id,
          ...l,
        })),
      });
    }

    // 🔍 AUDIT – UPDATE
    await auditLog(req, {
      entityType: "PURCHASE_REQUISITION",
      entityId: existing.id,
      action: "UPDATE",
      oldValue: { lineCount: existing.lines.length },
      newValue: { lineCount: lines.length },
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

    // 🔍 AUDIT – DELETE (UNCHANGED)
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
