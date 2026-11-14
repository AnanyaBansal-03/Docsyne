// backend/routes/workspaceRoutes.js
const express = require("express");
const router = express.Router();
const {
  createWorkspace,
  getMyWorkspaces,
  getWorkspaceById,
  inviteMember,
  removeMember,
} = require("../controllers/workspaceController");
const { protect } = require("../middleware/authMiddleware");

router.route("/")
  .post(protect, createWorkspace)
  .get(protect, getMyWorkspaces);

router.route("/:id")
  .get(protect, getWorkspaceById);

router.route("/:id/invite")
  .post(protect, inviteMember);

router.route("/:id/members/:userId")
  .delete(protect, removeMember);

module.exports = router;