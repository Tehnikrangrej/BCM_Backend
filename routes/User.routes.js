const express = require("express");
const router = express.Router();

const { verifyToken } = require("../utils/auth.middleware");
const { tenantMiddleware } = require("../utils/tenant.middleware");

// 🔒 user must be logged in AND belong to a tenant
router.use(verifyToken, tenantMiddleware);

router.get("/", (req, res) => {
  res.json({
    message: "Tenant users",
    tenant: req.tenant.domain,
  });
});

module.exports = router;
