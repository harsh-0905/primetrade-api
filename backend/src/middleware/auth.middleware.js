const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const AppError = require("../utils/AppError");

// Verifies JWT and attaches the user to req.user
const protect = async (req, res, next) => {
  try {
    // 1. Check if token exists in Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(new AppError("Not authenticated. Please log in.", 401));
    }

    // 2. Verify token signature + expiry
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Check if user still exists (could be deleted after token issued)
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new AppError("User no longer exists.", 401));
    }

    // 4. Attach user to request for downstream use
    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(new AppError("Token expired. Please log in again.", 401));
    }
    return next(new AppError("Invalid token.", 401));
  }
};

// Role-Based Access Control middleware factory
// Usage: restrictTo("admin") or restrictTo("admin", "moderator")
const restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new AppError("You do not have permission for this action.", 403));
  }
  next();
};

module.exports = { protect, restrictTo };
