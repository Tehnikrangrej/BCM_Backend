const express = require("express");
const router = express.Router();

const { verifyToken } = require("../utils/auth.middleware");
const { onlySuperAdmin } = require("../utils/superAdmin.guard");
const {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  blockUser,
  unblockUser,
  loginUser
} = require("../controller/User.controller");

/**
 * 🔐 SuperAdmin Protected Routes
 */
router.use(verifyToken, onlySuperAdmin);
router.post("/login", loginUser);
// CRUD
router.post("/", createUser);
router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

// Block / Unblock
router.patch("/:id/block", blockUser);
router.patch("/:id/unblock", unblockUser);

module.exports = router;
