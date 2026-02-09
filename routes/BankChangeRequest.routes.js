const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const auth = require("../utils/auth");
const { tenantMiddleware } = require("../utils/tenant.middleware");

const controller = require("../controller/BankChangeRequest.controller");
const upload = require("../utils/cloudinaryUpload");
/**
 * Bank Change Request Routes
 */

// CREATE – USER only (employee = logged-in user)
router.post("/", auth, upload.array("attachments", 5),  controller.createBankChangeRequest);

// GET ALL – USER (own) | SUPERADMIN (all)
router.get(
  "/",
  auth,
  //tenantMiddleware,
  controller.getAllBankChangeRequests
);

// GET BY ID – USER (own) | SUPERADMIN (any)
router.get(
  "/:id",
  auth,
  //tenantMiddleware,
  controller.getBankChangeRequestById
);

// UPDATE – USER (own) | SUPERADMIN (any)
router.put(
  "/:id",
  auth,
  //tenantMiddleware,
  controller.updateBankChangeRequest
);

// DELETE – USER (own) | SUPERADMIN (any)
router.delete(
  "/:id",
  auth,
 // tenantMiddleware,
  controller.deleteBankChangeRequest
);

module.exports = router;
