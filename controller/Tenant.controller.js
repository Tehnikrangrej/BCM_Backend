const prisma = require("../utils/prisma");
const { auditLog } = require("../utils/audit.helper");

/* ================= CREATE TENANT ================= */
exports.createTenant = async (req, res) => {
  try {
    const { name, domain } = req.body;

    const existingTenant = await prisma.tenant.findUnique({
      where: { domain },
    });

    if (existingTenant) {
      return res.status(400).json({
        success: false,
        message: "Tenant with this domain already exists",
      });
    }

    const tenant = await prisma.tenant.create({
      data: { name, domain },
    });

    // 🔍 AUDIT
    await auditLog(req, {
      entityType: "TENANT",
      entityId: tenant.id,
      action: "CREATE",
      newValue: {
        id: tenant.id,
        name: tenant.name,
        domain: tenant.domain,
        isActive: tenant.isActive,
      },
      source: "ERP",
    });

    return res.status(201).json({
      success: true,
      message: "Tenant created successfully",
      data: tenant,
    });
  } catch (error) {
    console.error("Create Tenant Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create tenant",
      error: error.message,
    });
  }
};

/* ================= GET ALL TENANTS ================= */
exports.getTenants = async (req, res) => {
  try {
    const tenants = await prisma.tenant.findMany();
    return res.status(200).json(tenants);
  } catch (error) {
    console.error("Get Tenants Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch tenants",
      error: error.message,
    });
  }
};

/* ================= GET TENANT BY ID ================= */
exports.getTenantById = async (req, res) => {
  try {
    const { id } = req.params;

    const tenant = await prisma.tenant.findUnique({
      where: { id },
    });

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: "Tenant with this ID does not exist",
      });
    }

    return res.status(200).json(tenant);
  } catch (error) {
    console.error("Get Tenant By ID Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch tenant",
      error: error.message,
    });
  }
};

/* ================= UPDATE TENANT ================= */
exports.updateTenant = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, domain } = req.body;

    const oldTenant = await prisma.tenant.findUnique({
      where: { id },
    });

    if (!oldTenant) {
      return res.status(404).json({
        success: false,
        message: "Tenant with this ID does not exist",
      });
    }

    // domain uniqueness check
    if (domain && domain !== oldTenant.domain) {
      const domainExists = await prisma.tenant.findUnique({
        where: { domain },
      });

      if (domainExists) {
        return res.status(400).json({
          success: false,
          message: "Tenant with this domain already exists",
        });
      }
    }

    const updatedTenant = await prisma.tenant.update({
      where: { id },
      data: { name, domain },
    });

    // 🔍 AUDIT
    await auditLog(req, {
      entityType: "TENANT",
      entityId: id,
      action: "UPDATE",
      oldValue: {
        name: oldTenant.name,
        domain: oldTenant.domain,
        isActive: oldTenant.isActive,
      },
      newValue: {
        name: updatedTenant.name,
        domain: updatedTenant.domain,
        isActive: updatedTenant.isActive,
      },
      source: "ERP",
    });

    return res.status(200).json({
      success: true,
      message: "Tenant updated successfully",
      data: updatedTenant,
    });
  } catch (error) {
    console.error("Update Tenant Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update tenant",
      error: error.message,
    });
  }
};

/* ================= BLOCK TENANT ================= */
exports.blockTenant = async (req, res) => {
  try {
    const { id } = req.params;

    const tenant = await prisma.tenant.findUnique({
      where: { id },
    });

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: "Tenant not found",
      });
    }

    const updatedTenant = await prisma.tenant.update({
      where: { id },
      data: { isActive: false },
    });

    // 🔍 AUDIT
    await auditLog(req, {
      entityType: "TENANT",
      entityId: id,
      action: "BLOCK",
      oldValue: { isActive: true },
      newValue: { isActive: false },
      source: "ERP",
    });

    return res.status(200).json({
      success: true,
      message: "Tenant blocked successfully",
      data: updatedTenant,
    });
  } catch (error) {
    console.error("Block Tenant Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to block tenant",
      error: error.message,
    });
  }
};

/* ================= UNBLOCK TENANT ================= */
exports.unblockTenant = async (req, res) => {
  try {
    const { id } = req.params;

    const tenant = await prisma.tenant.findUnique({
      where: { id },
    });

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: "Tenant not found",
      });
    }

    const updatedTenant = await prisma.tenant.update({
      where: { id },
      data: { isActive: true },
    });

    // 🔍 AUDIT
    await auditLog(req, {
      entityType: "TENANT",
      entityId: id,
      action: "UNBLOCK",
      oldValue: { isActive: false },
      newValue: { isActive: true },
      source: "ERP",
    });

    return res.status(200).json({
      success: true,
      message: "Tenant unblocked successfully",
      data: updatedTenant,
    });
  } catch (error) {
    console.error("Unblock Tenant Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to unblock tenant",
      error: error.message,
    });
  }
};
