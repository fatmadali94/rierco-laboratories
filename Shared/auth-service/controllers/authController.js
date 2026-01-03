import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  createUser,
  findUserByEmail,
  findUserById,
  updateUser,
  updateUserAccess,
  searchUsers,
  searchUsersBySystem,
} from "../models/userModel.js";
import cloudinary from "../utils/cloudinary.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// Default permissions based on position
const getDefaultPermissions = (position) => {
  const permissionMap = {
    admin: {
      tire: ["ورودی_جدید", "انبار", "پذیرش", "مرکز_آزمون"],
      materials: ["گزارشات", "پذیرش", "آزمایشگاه", "مالی"],
    },
    depository: {
      tire: ["ورودی_جدید", "انبار"],
    },
    receptor: {
      tire: ["پذیرش"],
      materials: ["پذیرش"],
    },
    tireLabrator: {
      tire: ["مرکز_آزمون"],
    },
    materialLabrator: {
      materials: ["آزمایشگاه"],
    },
    finance: {
      materials: ["مالی", "گزارشات"],
    },
    observer: {
      tire: ["انبار"],
      materials: ["گزارشات", "پذیرش", "آزمایشگاه", "مالی"],
    },
    customer: {},
  };

  return permissionMap[position] || {};
};

const getDefaultSystems = (position) => {
  const systemMap = {
    admin: ["tire", "materials"],
    depository: ["tire"],
    receptor: ["tire", "materials"],
    tireLabrator: ["tire"],
    materialLabrator: ["materials"],
    finance: ["materials"],
    observer: ["tire", "materials"],
    customer: [],
  };

  return systemMap[position] || ["tire"];
};

// Sign Up
export async function signUp(req, res) {
  try {
    const { name, email, password, mobile, position } = req.body;

    let imageUrl = "";
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "laboratory/users",
      });
      imageUrl = result.secure_url;
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ message: "کاربر با این مشخصات وجود دارد" });
    }

    const hashed = await bcrypt.hash(password, 10);

    // Set default systems and permissions based on position
    const allowedSystems = getDefaultSystems(position);
    const permissions = getDefaultPermissions(position);

    const user = await createUser({
      name,
      email,
      password: hashed,
      mobile,
      position,
      image: imageUrl,
      // allowedSystems,
      // permissions,
    });

    res.status(201).json({ message: "User registered successfully", user });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Signup error", error: err.message });
  }
}

// Sign In
export async function signIn(req, res) {
  try {
    const { email, password, system } = req.body; // system is optional

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check if user has access to requested system (if specified)
    if (system && !user.allowed_systems?.includes(system)) {
      return res
        .status(403)
        .json({ message: "شما به این سیستم دسترسی ندارید" });
    }

    // Create token with all user info
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        position: user.position,
        mobile: user.mobile,
        allowedSystems: user.allowed_systems || ["tire"],
        permissions: user.permissions || ["customer"],
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        position: user.position,
        mobile: user.mobile,
        allowedSystems: user.allowed_systems || ["tire"],
        permissions: user.permissions || ["customer"],
      },
    });
  } catch (err) {
    console.error("Signin error:", err);
    res.status(500).json({ message: "Signin error", error: err.message });
  }
}

// Verify Token
export async function verifyToken(req, res) {
  try {
    const { token } = req.body;

    if (!token) {
      return res
        .status(401)
        .json({ valid: false, message: "No token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    // Get fresh user data from database
    const user = await findUserById(decoded.id);

    if (!user) {
      return res.status(401).json({ valid: false, message: "User not found" });
    }

    res.json({
      valid: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        position: user.position,
        mobile: user.mobile,
        allowedSystems: user.allowed_systems || ["tire"],
        permissions: user.permissions || ["customer"],
      },
    });
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({ valid: false, message: "Invalid token" });
    }
    console.error("Verify token error:", error);
    res.status(500).json({ valid: false, message: "Server error" });
  }
}

// Get Current User (from token)
export async function getCurrentUser(req, res) {
  try {
    // req.user is set by authMiddleware
    const user = await findUserById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        position: user.position,
        mobile: user.mobile,
        allowedSystems: user.allowed_systems || ["tire"],
        permissions: user.permissions || ["customer"],
      },
    });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ message: "Server error" });
  }
}

// Update Profile
export async function updateProfile(req, res) {
  try {
    const { name, email, mobile, position } = req.body;
    const userId = req.user.id;

    let imageUrl = req.user.image;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "laboratory/users",
      });
      imageUrl = result.secure_url;
    }

    const user = await updateUser(userId, {
      name,
      email,
      mobile,
      position,
      image: imageUrl,
    });

    res.json({ message: "Profile updated", user });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
}

// Update User Access (Admin only)
export async function updateAccess(req, res) {
  try {
    const { userId } = req.params;
    const { allowedSystems, permissions } = req.body;

    // Check if requester is admin
    if (req.user.position !== "admin") {
      return res.status(403).json({ message: "Only admin can update access" });
    }

    const user = await updateUserAccess(userId, {
      allowedSystems,
      permissions,
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Access updated", user });
  } catch (error) {
    console.error("Update access error:", error);
    res.status(500).json({ message: "Server error" });
  }
}

// Search Users (for chat)
export async function searchUsersController(req, res) {
  try {
    const { q, system } = req.query;
    const currentUserId = req.user.id;

    if (!q) {
      return res.status(400).json({ message: "Search query required" });
    }

    let users;
    if (system) {
      // Search only users who have access to specific system
      users = await searchUsersBySystem(q, currentUserId, system);
    } else {
      // Search all users
      users = await searchUsers(q, currentUserId);
    }

    res.status(200).json(users);
  } catch (error) {
    console.error("Search users error:", error);
    res.status(500).json({ message: "Server error" });
  }
}
