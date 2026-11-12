// backend/routes/workspaceRoutes.js
const express = require("express");
const router = express.Router();
const {
  createWorkspace,
  getMyWorkspaces,
  getWorkspaceById,
} = require("../controllers/workspaceController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createWorkspace);
router.get("/", protect, getMyWorkspaces);
router.get("/:id", protect, getWorkspaceById);

module.exports = router;