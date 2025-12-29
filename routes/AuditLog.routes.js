const express = require("express");
const router = express.Router();

const {
  getAuditLogs,
  getAuditByEntityId,
} = require("../controller/AuditLog.controller");

router.get("/", getAuditLogs);
router.get("/entity/:entityId", getAuditByEntityId);

module.exports = router;
