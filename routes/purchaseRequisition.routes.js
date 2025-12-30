const express = require("express");
const router = express.Router();

const auth = require("../utils/auth");
const { onlySuperAdmin } = require("../utils/superAdmin.guard");
const controller = require("../controller/PurchaseRequisition.controller");

/**
 * ❌ CREATE PR
 * ONLY TENANT USER
 */
router.post(
  "/",
  auth,
  (req, res, next) => {
    if (req.user.role !== "USER") {
      return res.status(403).json({
        success: false,
        message: "Only tenant users can create Purchase Requisition"
      });
    }
    next();
  },
  controller.createPurchaseRequisition
);

/**
 * ✅ GET ALL PRs
 * USER → own tenant
 * SUPERADMIN → all tenants
 */
router.get(
  "/",
  auth,
  controller.getAllPurchaseRequisitions
);

/**
 * ✅ GET PR BY ID
 * USER → own tenant
 * SUPERADMIN → any tenant
 */
router.get(
  "/:id",
  auth,
  controller.getPurchaseRequisitionById
);

/**
 * ✅ UPDATE PR
 * USER → own tenant
 * SUPERADMIN → any tenant
 */
router.put(
  "/:id",
  auth,
  controller.updatePurchaseRequisition
);

/**
 * ✅ DELETE PR
 * USER → own tenant
 * SUPERADMIN → any tenant
 */
router.delete(
  "/:id",
  auth,
  controller.deletePurchaseRequisition
);





module.exports = router;
