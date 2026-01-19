const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const auth = require("../utils/auth");
const { tenantMiddleware } = require("../utils/tenant.middleware");

const controller = require("../controller/BankChangeRequest.controller");

const uploadDir = path.join(__dirname, "..", "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  },
});

const upload = multer({ storage });

/**
 * Bank Change Request Routes
 */

// CREATE – USER only (employee = logged-in user)
router.post("/", auth, upload.array("attachments"), controller.createBankChangeRequest);

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
