const express = require("express");
const router = express.Router();
const tenantController = require("../controller/Tenant.controller");

const { verifyToken } = require("../utils/auth.middleware");
const { onlySuperAdmin } = require("../utils/superAdmin.guard");

// 🔒 Protect ALL tenant routes
router.use(verifyToken, onlySuperAdmin);

// CRUD
router.post("/", tenantController.createTenant);
router.get("/", tenantController.getTenants);
router.get("/:id", tenantController.getTenantById);
router.put("/:id", tenantController.updateTenant);

// Block / Unblock
router.patch("/block/:id", tenantController.blockTenant);
router.patch("/unblock/:id", tenantController.unblockTenant);

module.exports = router;
