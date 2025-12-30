const express = require("express");
const router = express.Router();
const superadminController = require("../controller/Superadmin.controller");    

/* ================= AUTH ================= */
router.post("/login", superadminController.loginSuperAdmin);

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
