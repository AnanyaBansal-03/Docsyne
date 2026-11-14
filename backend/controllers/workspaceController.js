// backend/controllers/workspaceController.js
const Workspace = require("../models/Workspace");
const Document = require("../models/Document");
const User = require("../models/User");

// @route  POST /api/workspaces
// @desc   Create a new workspace
const createWorkspace = async (req, res) => {
  try {
    const { name, description, color } = req.body;

    if (!name) return res.status(400).json({ message: "Workspace name is required" });

    const workspace = await Workspace.create({
      name,
      description: description || "",
      color: color || "#7c3aed",
      owner: req.user._id,
      members: [{ user: req.user._id, role: "editor" }],
    });

    res.status(201).json(workspace);
  } catch (error) {
    console.error("Create Workspace Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @route  GET /api/workspaces
// @desc   Get all workspaces where user is owner OR member
const getMyWorkspaces = async (req, res) => {
  try {
    const workspaces = await Workspace.find({
      $or: [
        { owner: req.user._id },
        { "members.user": req.user._id },
      ],
    })
      .populate("owner", "name email")
      .populate("members.user", "name email")
      .sort({ updatedAt: -1 });

    res.json(workspaces);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @route  GET /api/workspaces/:id
// @desc   Get single workspace with documents
// @route  GET /api/workspaces/:id
// @desc   Get single workspace with documents
const getWorkspaceById = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id)
      .populate("owner", "name email")
      .populate("members.user", "name email");

    if (!workspace) return res.status(404).json({ message: "Workspace not found" });

    const isOwner = workspace.owner._id.toString() === req.user._id.toString();
    const isMember = workspace.members.some(
      (m) => m.user._id.toString() === req.user._id.toString()
    );
    if (!isOwner && !isMember) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Get documents that belong to this workspace
    const documents = await Document.find({
      workspaceId: workspace._id,
      isTrashed: false,
    }).sort({ updatedAt: -1 });

    res.json({ ...workspace.toObject(), documents });
  } catch (error) {
    console.error("Get Workspace Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @route  POST /api/workspaces/:id/invite
// @desc   Invite a user by email
const inviteMember = async (req, res) => {
  try {
    const { email, role } = req.body;
    const workspace = await Workspace.findById(req.params.id);

    if (!workspace) return res.status(404).json({ message: "Workspace not found" });

    // Only owner can invite
    if (workspace.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the owner can invite members" });
    }

    // Find user by email
    const userToInvite = await User.findOne({ email });
    if (!userToInvite) {
      return res.status(404).json({ message: "No user found with that email" });
    }

    // Check if already a member
    const alreadyMember = workspace.members.some(
      (m) => m.user.toString() === userToInvite._id.toString()
    );
    if (alreadyMember) {
      return res.status(400).json({ message: "User is already a member" });
    }

    workspace.members.push({ user: userToInvite._id, role: role || "editor" });
    await workspace.save();

    res.json({ message: "Member added successfully", workspace });
  } catch (error) {
    console.error("Invite Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @route  DELETE /api/workspaces/:id/members/:userId
// @desc   Remove a member
// @route  DELETE /api/workspaces/:id/members/:userId
// @desc   Remove a member
const removeMember = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id);

    if (!workspace) return res.status(404).json({ message: "Workspace not found" });

    // Only the owner can remove members
    if (workspace.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the owner can remove members" });
    }

    // Prevent owner from removing themselves
    if (req.params.userId === workspace.owner.toString()) {
      return res.status(400).json({ message: "Cannot remove the workspace owner" });
    }

    // Remove from the array
    workspace.members = workspace.members.filter(
      (m) => m.user.toString() !== req.params.userId
    );
    
    await workspace.save();

    res.json({ message: "Member removed", workspace });
  } catch (error) {
    console.error("Remove Member Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { createWorkspace, getMyWorkspaces, getWorkspaceById, inviteMember, removeMember };