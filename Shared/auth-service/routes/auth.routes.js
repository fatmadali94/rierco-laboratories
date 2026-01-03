import express from "express";
import multer from "multer";
import {
  signUp,
  signIn,
  verifyToken,
  getCurrentUser,
  updateProfile,
  updateAccess,
  searchUsersController,
} from "../controllers/authController.js";
import { authenticate, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Multer setup for file uploads
const upload = multer({ dest: "uploads/" });

// Public routes
router.post("/signup", upload.single("image"), signUp);
router.post("/signin", signIn);
router.post("/verify", verifyToken);

// Protected routes (require authentication)
router.get("/me", authenticate, getCurrentUser);
router.put("/profile", authenticate, upload.single("image"), updateProfile);
router.get("/users/search", authenticate, searchUsersController);

// Admin only routes
router.put("/users/:userId/access", authenticate, requireAdmin, updateAccess);

export default router;