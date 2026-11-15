// backend/routes/authRoutes.js
const express = require("express");
const router = express.Router();
const {
  signup,
  login,
  getMe,
  getMyNotifications,
  markNotificationsRead,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", protect, getMe);

// 🆕 Notification routes
router.get("/me/notifications", protect, getMyNotifications);
router.patch("/me/notifications/read", protect, markNotificationsRead);

module.exports = router;