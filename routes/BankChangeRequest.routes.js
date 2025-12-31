const express = require("express");
const router = express.Router();

const auth = require("../utils/auth"); // your existing auth.js
const { tenantMiddleware } = require("../utils/tenant.middleware"); 

const controller = require("../controller/BankChangeRequest.controller");

/**
 * Bank Change Request Routes
 */

// CREATE – USER only (employee = logged-in user)
router.post(
  "/",
  auth,
  tenantMiddleware,
  controller.createBankChangeRequest
);

// GET ALL – USER (own) | SUPERADMIN (all)
router.get(
  "/",
  auth,
  tenantMiddleware,
  controller.getAllBankChangeRequests
);

// GET BY ID – USER (own) | SUPERADMIN (any)
router.get(
  "/:id",
  auth,
  tenantMiddleware,
  controller.getBankChangeRequestById
);

// UPDATE – USER (own) | SUPERADMIN (any)
router.put(
  "/:id",
  auth,
  tenantMiddleware,
  controller.updateBankChangeRequest
);

// DELETE – USER (own) | SUPERADMIN (any)
router.delete(
  "/:id",
  auth,
  tenantMiddleware,
  controller.deleteBankChangeRequest
);

module.exports = router;
