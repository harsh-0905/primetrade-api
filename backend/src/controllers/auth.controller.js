const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const AppError = require("../utils/AppError");

// Helper: sign a JWT for a user id
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

/**
 * POST /api/v1/auth/register
 * Creates a new user account
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check duplicate email
    const existing = await User.findOne({ email });
    if (existing) {
      return next(new AppError("Email already registered.", 409));
    }

    // Create user (password is hashed by pre-save hook in model)
    const user = await User.create({ name, email, password });

    const token = signToken(user._id);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/auth/login
 * Authenticates user and returns JWT
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Explicitly select password (it's excluded by default)
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      // Same generic message for both cases — don't leak which one failed
      return next(new AppError("Invalid email or password.", 401));
    }

    const token = signToken(user._id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/auth/me
 * Returns the currently logged-in user's profile
 */
const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
    },
  });
};

module.exports = { register, login, getMe };
