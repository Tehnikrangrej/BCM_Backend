const prisma = require("../utils/prisma");
const { auditLog } = require("../utils/audit.helper");

/**
 * =====================================
 * CREATE BANK CHANGE REQUEST (USER)
 * employeeId = logged-in user
 * =====================================
 */
exports.createBankChangeRequest = async (req, res) => {
  try {
    if (req.user.role !== "USER") {
      return res.status(403).json({
        success: false,
        message: "Only USER can create Bank Change Request",
      });
    }

    const {
      accountHolderName,
      newBankName,
      newBankBranch,
      newBankAccountNumber,
      swiftCode,
      iban,
      purpose,
      effectiveFromDate,
      salaryTransferLetter,
      clearanceCertificate,
      submissionComments,
    } = req.body;

    const request = await prisma.bankChangeRequest.create({
      data: {
        accountHolderName,
        newBankName,
        newBankBranch,
        newBankAccountNumber,
        swiftCode,
        iban,
        purpose,
        effectiveFromDate: new Date(effectiveFromDate),
        salaryTransferLetter,
        clearanceCertificate,
        submissionComments,

        status: "SUBMITTED",
        tenantId: req.user.tenantId,
        employeeId: req.user.id,
      },
    });

    // 🔍 AUDIT – CREATE
    await auditLog(req, {
      entityType: "BANK_CHANGE_REQUEST",
      entityId: request.id,
      action: "CREATE",
      newValue: {
        accountHolderName: request.accountHolderName,
        newBankName: request.newBankName,
        newBankBranch: request.newBankBranch,
        status: request.status,
        effectiveFromDate: request.effectiveFromDate,
      },
      source: req.user.role,
    });

    return res.status(201).json({
      success: true,
      data: request,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * =====================================
 * GET ALL BANK CHANGE REQUESTS
 * USER → own
 * SUPERADMIN → all
 * =====================================
 */
exports.getAllBankChangeRequests = async (req, res) => {
  try {
    const where =
      req.user.role === "SUPERADMIN"
        ? {}
        : {
            tenantId: req.user.tenantId,
            employeeId: req.user.id,
          };

    const requests = await prisma.bankChangeRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return res.json({
      success: true,
      data: requests,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * =====================================
 * GET BANK CHANGE REQUEST BY ID
 * =====================================
 */
exports.getBankChangeRequestById = async (req, res) => {
  try {
    const where =
      req.user.role === "SUPERADMIN"
        ? { id: req.params.id }
        : {
            id: req.params.id,
            tenantId: req.user.tenantId,
            employeeId: req.user.id,
          };

    const request = await prisma.bankChangeRequest.findFirst({ where });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Bank Change Request not found",
      });
    }

    return res.json({
      success: true,
      data: request,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * =====================================
 * UPDATE BANK CHANGE REQUEST
 * USER → own
 * SUPERADMIN → any
 * =====================================
 */
exports.updateBankChangeRequest = async (req, res) => {
  try {
    const where =
      req.user.role === "SUPERADMIN"
        ? { id: req.params.id }
        : {
            id: req.params.id,
            tenantId: req.user.tenantId,
            employeeId: req.user.id,
          };

    const existing = await prisma.bankChangeRequest.findFirst({ where });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Bank Change Request not found",
      });
    }

    if (existing.status === "CLOSED") {
      return res.status(403).json({
        success: false,
        message: "Closed request cannot be updated",
      });
    }

    const updated = await prisma.bankChangeRequest.update({
      where: { id: existing.id },
      data: {
        ...req.body,
        effectiveFromDate: req.body.effectiveFromDate
          ? new Date(req.body.effectiveFromDate)
          : existing.effectiveFromDate,
      },
    });

    // 🔍 AUDIT – UPDATE
    await auditLog(req, {
      entityType: "BANK_CHANGE_REQUEST",
      entityId: existing.id,
      action: "UPDATE",
      oldValue: {
        newBankName: existing.newBankName,
        newBankBranch: existing.newBankBranch,
        status: existing.status,
      },
      newValue: {
        newBankName: updated.newBankName,
        newBankBranch: updated.newBankBranch,
        status: updated.status,
      },
      source: req.user.role,
    });

    return res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * =====================================
 * DELETE BANK CHANGE REQUEST
 * USER → own
 * SUPERADMIN → any
 * =====================================
 */
exports.deleteBankChangeRequest = async (req, res) => {
  try {
    const where =
      req.user.role === "SUPERADMIN"
        ? { id: req.params.id }
        : {
            id: req.params.id,
            tenantId: req.user.tenantId,
            employeeId: req.user.id,
          };

    const existing = await prisma.bankChangeRequest.findFirst({ where });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Bank Change Request not found",
      });
    }

    await prisma.bankChangeRequest.delete({
      where: { id: existing.id },
    });

    // 🔍 AUDIT – DELETE
    await auditLog(req, {
      entityType: "BANK_CHANGE_REQUEST",
      entityId: existing.id,
      action: "DELETE",
      oldValue: {
        accountHolderName: existing.accountHolderName,
        newBankName: existing.newBankName,
        status: existing.status,
      },
      source: req.user.role,
    });

    return res.json({
      success: true,
      message: "Bank Change Request deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
