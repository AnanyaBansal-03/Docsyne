// backend/controllers/authController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// @route  POST /api/signup
// @desc   Register a new user
// @access Public
const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      token: generateToken(newUser._id),
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("Signup Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// @route  POST /api/login
// @desc   Authenticate user & return token
// @access Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// @route  GET /api/me
// @desc   Get logged-in user
// @access Private
const getMe = async (req, res) => {
  res.json(req.user);
};

// 🆕 @route  GET /api/me/notifications
// @desc   Get logged-in user's notifications (newest first)
// @access Private
const getMyNotifications = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("notifications");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Sort newest first
    const sorted = [...user.notifications].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    res.json(sorted);
  } catch (error) {
    console.error("Get Notifications Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// 🆕 @route  PATCH /api/me/notifications/read
// @desc   Mark all notifications as read
// @access Private
const markNotificationsRead = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      $set: { "notifications.$[].read": true },
    });
    res.json({ message: "Notifications marked as read" });
  } catch (error) {
    console.error("Mark Notifications Read Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  signup,
  login,
  getMe,
  getMyNotifications,
  markNotificationsRead,
};