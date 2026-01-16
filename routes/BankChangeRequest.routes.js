const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const auth = require("../utils/auth"); // JWT middleware
// ❌ const { tenantMiddleware } = require("../utils/tenant.middleware");  // REMOVE THIS

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

// ✅ CREATE – USER only (JWT ONLY)
router.post(
  "/",
  auth,
  upload.array("attachments", 5),
  controller.createBankChangeRequest
);

// ✅ GET ALL – USER (own) | SUPERADMIN (all)
router.get(
  "/",
  auth,
  controller.getAllBankChangeRequests
);

// ✅ GET BY ID – USER (own) | SUPERADMIN (any)
router.get(
  "/:id",
  auth,
  controller.getBankChangeRequestById
);

// ✅ UPDATE – USER (own) | SUPERADMIN (any)
router.put(
  "/:id",
  auth,
  controller.updateBankChangeRequest
);

// ✅ DELETE – USER (own) | SUPERADMIN (any)
router.delete(
  "/:id",
  auth,
  controller.deleteBankChangeRequest
);

module.exports = router;
