// backend/models/Document.js
const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, default: "Untitled Document" },
    type: { type: String, enum: ["document", "report", "presentation"], default: "document" },
    content: { type: String, default: "" },
    slides: { type: Array, default: [] },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      default: null,
    },

    // Comments (existing)
    comments: [
      {
        text: { type: String, required: true },
        author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        authorName: { type: String, required: true },
        resolved: { type: Boolean, default: false },
        selection: {
          from: { type: Number },
          to: { type: Number },
          text: { type: String },
        },
        replies: [
          {
            text: { type: String, required: true },
            author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            authorName: { type: String },
            createdAt: { type: Date, default: Date.now },
          },
        ],
        createdAt: { type: Date, default: Date.now },
      },
    ],

    // 🆕 Version History
    versions: [
      {
        content: { type: String },
        slides: { type: Array },
        title: { type: String },
        savedBy: { type: String }, // user name
        savedById: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        savedAt: { type: Date, default: Date.now },
      },
    ],

    isFavorite: { type: Boolean, default: false },
    isTrashed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Document", documentSchema);