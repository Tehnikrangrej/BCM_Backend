const express = require("express");
const app = express();

// ✅ BODY PARSER (REQUIRED)
app.use(express.json());

// ✅ ROUTES
app.use("/api/superadmin", require("../routes/SuperAdmin.routes"));
app.use("/api/tenants", require("../routes/Tenant.routes"));
app.use("/api/auditlogs", require("../routes/AuditLog.routes"));
app.use("/api/users", require("../routes/USERS.routes"));
app.use("/api/purchaserequisitions", require("../routes/PurchaseRequisition.routes"));
module.exports = app;
