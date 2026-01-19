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
router.get("/myservices/", tenantController.getMyTenantServices);
router.put("/:id", tenantController.updateTenant);
router.delete("/:id", tenantController.deleteTenant);
// Block / Unblock
router.patch("/block/:id", tenantController.blockTenant);
router.patch("/unblock/:id", tenantController.unblockTenant);
router.post("/sync-users/:id", tenantController.TenantSyncUsers);
module.exports = router;
