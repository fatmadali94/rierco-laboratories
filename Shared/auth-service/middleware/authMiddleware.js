import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

export function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    res.status(500).json({ message: "Server error" });
  }
}

// Check if user has access to a specific system
export function requireSystem(system) {
  return (req, res, next) => {
    if (!req.user.allowedSystems?.includes(system)) {
      return res.status(403).json({ message: "Access denied to this system" });
    }
    next();
  };
}

// Check if user has a specific permission in a system
export function requirePermission(system, permission) {
  return (req, res, next) => {
    const systemPermissions = req.user.permissions?.[system] || [];
    if (!systemPermissions.includes(permission)) {
      return res.status(403).json({ message: "Permission denied" });
    }
    next();
  };
}

// Check if user is admin
export function requireAdmin(req, res, next) {
  if (req.user.position !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}