const express = require("express");
const router = express.Router();
const superadminController = require("../controller/Superadmin.controller");    
const { verifyToken } = require("../utils/auth.middleware");

/* ================= AUTH ================= */
router.post("/login", superadminController.loginSuperAdmin);
router.get("/me", verifyToken, superadminController.getMe);

/* ================= CREATE ================= */
router.post("/", superadminController.createsuperadmin);

/* ================= READ ================= */
router.get("/", superadminController.getsuperadmin);
router.get("/:id", superadminController.getSuperAdminById);

/* ================= UPDATE ================= */
router.put("/:id", superadminController.updateSuperAdmin);

/* ================= DELETE ================= */
router.delete("/:id", superadminController.deleteSuperAdmin);

/* ================= BLOCK ================= */
router.patch("/block/:id", superadminController.blockSuperAdmin);
router.patch("/unblock/:id", superadminController.unblockSuperAdmin);       
module.exports = router;
