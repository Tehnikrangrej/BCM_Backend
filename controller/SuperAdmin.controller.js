const prisma = require("../utils/prisma");
const jwt = require("jsonwebtoken");
const { auditLog } = require("../utils/audit.helper");

/* ================= CREATE SUPERADMIN ================= */
exports.createsuperadmin = async (req, res) => {
  try {
    const { name, email, passwordHash } = req.body;

    const existingAdmin = await prisma.superAdmin.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: "Email is already there",
      });
    }

    const admin = await prisma.superAdmin.create({
      data: { name, email, passwordHash },
    });

    // 🔍 AUDIT
    await auditLog(req, {
      entityType: "SUPERADMIN",
      entityId: admin.id,
      action: "CREATE",
      newValue: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        isActive: admin.isActive,
      },
      source: "SYSTEM",
    });

    return res.status(201).json({
      success: true,
      message: "SuperAdmin created successfully",
      data: admin,
    });
  } catch (error) {
    console.error("Create Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create superadmin",
      error: error.message,
    });
  }
};

/* ================= LOGIN SUPERADMIN (JWT) ================= */
exports.loginSuperAdmin = async (req, res) => {
  try {
    const { email, passwordHash } = req.body;

    const admin = await prisma.superAdmin.findUnique({
      where: { email },
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is blocked",
      });
    }

    if (admin.passwordHash !== passwordHash) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      { id: admin.id, role: "SUPERADMIN" },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );

    // 🔍 AUDIT
    await auditLog(req, {
      entityType: "SUPERADMIN",
      entityId: admin.id,
      action: "LOGIN",
      source: "SYSTEM",
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        isActive: admin.isActive,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};

/* ================= GET ALL SUPERADMINS ================= */
exports.getsuperadmin = async (req, res) => {
  try {
    const admins = await prisma.superAdmin.findMany();
    return res.status(200).json(admins);
  } catch (error) {
    console.error("Get All Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch superadmins",
      error: error.message,
    });
  }
};

/* ================= GET SUPERADMIN BY ID ================= */
exports.getSuperAdminById = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await prisma.superAdmin.findUnique({
      where: { id },
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "SuperAdmin with this ID does not exist",
      });
    }

    return res.status(200).json(admin);
  } catch (error) {
    console.error("Get By ID Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch superadmin",
      error: error.message,
    });
  }
};

/* ================= UPDATE SUPERADMIN ================= */
exports.updateSuperAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const oldAdmin = await prisma.superAdmin.findUnique({
      where: { id },
    });

    if (!oldAdmin) {
      return res.status(404).json({
        success: false,
        message: "SuperAdmin with this ID does not exist",
      });
    }

    const updatedAdmin = await prisma.superAdmin.update({
      where: { id },
      data: req.body,
    });

    // 🔍 AUDIT
    await auditLog(req, {
      entityType: "SUPERADMIN",
      entityId: id,
      action: "UPDATE",
      oldValue: {
        name: oldAdmin.name,
        email: oldAdmin.email,
        isActive: oldAdmin.isActive,
      },
      newValue: {
        name: updatedAdmin.name,
        email: updatedAdmin.email,
        isActive: updatedAdmin.isActive,
      },
      source: "SYSTEM",
    });

    return res.status(200).json({
      success: true,
      message: "SuperAdmin updated successfully",
      data: updatedAdmin,
    });
  } catch (error) {
    console.error("Update Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update superadmin",
      error: error.message,
    });
  }
};

/* ================= DELETE SUPERADMIN ================= */
exports.deleteSuperAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await prisma.superAdmin.findUnique({
      where: { id },
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "SuperAdmin with this ID does not exist",
      });
    }

    await prisma.superAdmin.delete({
      where: { id },
    });

    // 🔍 AUDIT
    await auditLog(req, {
      entityType: "SUPERADMIN",
      entityId: id,
      action: "DELETE",
      oldValue: {
        name: admin.name,
        email: admin.email,
        isActive: admin.isActive,
      },
      source: "SYSTEM",
    });

    return res.status(200).json({
      success: true,
      message: "SuperAdmin deleted successfully",
    });
  } catch (error) {
    console.error("Delete Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete superadmin",
      error: error.message,
    });
  }
};

/* ================= BLOCK SUPERADMIN ================= */
exports.blockSuperAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await prisma.superAdmin.findUnique({
      where: { id },
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "SuperAdmin with this ID does not exist",
      });
    }

    const updatedAdmin = await prisma.superAdmin.update({
      where: { id },
      data: { isActive: false },
    });

    // 🔍 AUDIT
    await auditLog(req, {
      entityType: "SUPERADMIN",
      entityId: id,
      action: "BLOCK",
      oldValue: { isActive: true },
      newValue: { isActive: false },
      source: "SYSTEM",
    });

    return res.status(200).json({
      success: true,
      message: "SuperAdmin blocked successfully",
      data: updatedAdmin,
    });
  } catch (error) {
    console.error("Block Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to block superadmin",
      error: error.message,
    });
  }
};

/* ================= UNBLOCK SUPERADMIN ================= */
exports.unblockSuperAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await prisma.superAdmin.findUnique({
      where: { id },
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "SuperAdmin with this ID does not exist",
      });
    }

    const updatedAdmin = await prisma.superAdmin.update({
      where: { id },
      data: { isActive: true },
    });

    // 🔍 AUDIT
    await auditLog(req, {
      entityType: "SUPERADMIN",
      entityId: id,
      action: "UNBLOCK",
      oldValue: { isActive: false },
      newValue: { isActive: true },
      source: "SYSTEM",
    });

    return res.status(200).json({
      success: true,
      message: "SuperAdmin unblocked successfully",
      data: updatedAdmin,
    });
  } catch (error) {
    console.error("Unblock Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to unblock superadmin",
      error: error.message,
    });
  }
};
