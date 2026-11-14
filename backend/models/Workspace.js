// backend/models/Workspace.js
const mongoose = require("mongoose");

const workspaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Workspace name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        role: { type: String, enum: ["editor", "viewer"], default: "editor" },
      },
    ],
    color: {
      type: String,
      default: "#7c3aed", // Violet
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Workspace", workspaceSchema);