// backend/controllers/workspaceController.js
const Workspace = require("../models/Workspace");

// @route  POST /api/workspaces
// @desc   Create a new workspace
// @access Private
const createWorkspace = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Workspace name is required" });
    }

    const workspace = await Workspace.create({
      name,
      owner: req.user._id,
      members: [req.user._id],
    });

    res.status(201).json(workspace);
  } catch (error) {
    console.error("Create Workspace Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// @route  GET /api/workspaces
// @desc   Get all workspaces for the logged-in user
// @access Private
const getMyWorkspaces = async (req, res) => {
  try {
    const workspaces = await Workspace.find({
      $or: [{ owner: req.user._id }, { members: req.user._id }],
    }).sort({ createdAt: -1 });

    res.json(workspaces);
  } catch (error) {
    console.error("Get Workspaces Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// @route  GET /api/workspaces/:id
// @desc   Get single workspace by ID
// @access Private
const getWorkspaceById = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id)
      .populate("owner", "name email")
      .populate("members", "name email");

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    // Check if user is a member
    const isMember = workspace.members.some(
      (m) => m._id.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(workspace);
  } catch (error) {
    console.error("Get Workspace Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { createWorkspace, getMyWorkspaces, getWorkspaceById };