const express = require("express");
const app = express();

app.use(express.json());

app.use("/api/superadmin", require("../routes/SuperAdmin.routes"));  

app.use("/api/tenants", require("../routes/Tenant.routes"));

app.use("/api/auditlogs", require("../routes/AuditLog.routes"));


module.exports = app;
