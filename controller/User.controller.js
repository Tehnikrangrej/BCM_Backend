const prisma = require("../utils/prisma");
const bcrypt = require("bcryptjs");
const { auditLog } = require("../utils/audit.helper");
/**
 * ➕ CREATE USER
 */
exports.createUser = async (req, res) => {
  try {
    const { username, email, password, tenantId, profileImage } = req.body;

    if (!username || !email || !tenantId) {
      return res.status(400).json({
        success: false,
        message: "username, email and tenantId are required",
      });
    }

    const passwordHash = password
      ? await bcrypt.hash(password, 10)
      : null;

    const user = await prisma.user.create({
      data: {
        username,
        email,
        tenantId,
        profileImage,
        passwordHash,
      },
    });
    // Audit
     await auditLog(req,{
        entityType: "USER",
        entityId: user.id,
        action: "CREATE",
        newValue: { 
            id: user.id,
            username: user.username,
            email: user.email,
            tenantId: user.tenantId,
            isActive: user.isActive,
            },  
        source: "CANVAS",    
     });
    
    res.status(201).json({
      success: true,
      data: user,
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * 📄 GET ALL USERS
 */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: { tenant: true },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * 📄 GET USER BY ID
 */
exports.getUserById = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: { tenant: true },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { password, ...rest } = req.body;

    // 🔍 Fetch old user for audit
    const oldUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!oldUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let data = { ...rest };

    if (password) {
      data.passwordHash = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data,
    });

    // 🔍 AUDIT
    await auditLog(req, {
      entityType: "USER",
      entityId: id,
      action: "UPDATE",
      oldValue: {
        username: oldUser.username,
        email: oldUser.email,
        tenantId: oldUser.tenantId,
        isActive: oldUser.isActive,
      },
      newValue: {
        username: updatedUser.username,
        email: updatedUser.email,
        tenantId: updatedUser.tenantId,
        isActive: updatedUser.isActive,
      },
      source: "CANVAS",
    });

    res.json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Update User Error:", error);

    // ✅ UNIQUE EMAIL ERROR
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * ❌ DELETE USER
 */
exports.deleteUser = async (req, res) => {
  try {
    await prisma.user.delete({
      where: { id: req.params.id },
    });
     // audit
     await auditLog(req, {
        entityType:"USER",
        entityId: req.params.id,
        action: "DELETE",
        source: "CANVAS",
     })
    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * 🚫 BLOCK USER
 */
exports.blockUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.params.id },
      data: { isActive: false },
    });

    // 🔍 AUDIT
    await auditLog(req, {
      entityType: "USER",
      entityId: user.id,
      action: "BLOCK",
      oldValue: { isActive: true },
      newValue: { isActive: false },
      source: "CANVAS",
    });

    res.json({
      success: true,
      message: "User blocked successfully",
      data: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.unblockUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.params.id },
      data: { isActive: true },
    });

    // 🔍 AUDIT
    await auditLog(req, {
      entityType: "USER",
      entityId: user.id,
      action: "UNBLOCK",
      oldValue: { isActive: false },
      newValue: { isActive: true },
      source: "CANVAS",
    });

    res.json({
      success: true,
      message: "User unblocked successfully",
      data: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const jwt = require("jsonwebtoken");

/**
 * 🔐 LOGIN TENANT USER
 */
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "User is blocked"
      });
    }

    // 2️⃣ Compare password
    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // 3️⃣ Generate JWT (THIS IS THE MAGIC)
    const token = jwt.sign(
      {
        id: user.id,              // ✅ User table ID
        role: "USER",
        tenantId: user.tenantId   // ✅ AUTO tenant
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        tenantId: user.tenantId
      }
    });

  } catch (error) {
    console.error("Login User Error:", error);
    return res.status(500).json({
      success: false,
      message: "Login failed"
    });
  }
};