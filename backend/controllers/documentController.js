// backend/controllers/documentController.js
const Document = require("../models/Document");
const Workspace = require("../models/Workspace");

// Helper: check if user has access to a document
const hasAccessToDocument = async (doc, userId) => {
  // Owner check
  if (doc.owner.toString() === userId.toString()) return true;

  // Workspace member check
  if (doc.workspaceId) {
    const workspace = await Workspace.findById(doc.workspaceId);
    if (workspace) {
      return workspace.members.some(
        (m) => m.user.toString() === userId.toString()
      );
    }
  }
  return false;
};

// @route  POST /api/documents
// @desc   Create a new document
const createDocument = async (req, res) => {
  try {
    const { title, type, workspaceId } = req.body;

    const initialSlides = type === "presentation" 
      ? [{ id: "1", content: "Welcome to your new presentation!", bg: "#ffffff" }] 
      : [];

    const doc = await Document.create({
      title: title || "Untitled Document",
      type: type || "document",
      owner: req.user._id,
      workspaceId: workspaceId || null,
      slides: initialSlides,
    });

    res.status(201).json(doc);
  } catch (error) {
    console.error("Create Doc Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @route  GET /api/documents
// @desc   Get all documents the user can access (owned + workspace member)
const getMyDocuments = async (req, res) => {
  try {
    const { workspaceId } = req.query;

    const userWorkspaces = await Workspace.find({
      "members.user": req.user._id,
    }).select("_id");

    const workspaceIds = userWorkspaces.map((w) => w._id);

    const filter = {
      isTrashed: false,
      $or: [
        { owner: req.user._id },
        { workspaceId: { $in: workspaceIds } },
      ],
    };

    if (workspaceId) {
      filter.workspaceId = workspaceId;
      delete filter.$or;
    }

    // 🚨 THIS LINE IS CRITICAL
    const docs = await Document.find(filter)
      .populate("workspaceId", "name color")   // <-- MUST EXIST
      .populate("owner", "name email")  
      .sort({ updatedAt: -1 });

    res.json(docs);
  } catch (error) {
    console.error("Get My Docs Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @route  PATCH /api/documents/:id
// @desc   Update document (owner OR workspace member)
const updateDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Document not found" });

    const hasAccess = await hasAccessToDocument(doc, req.user._id);
    if (!hasAccess) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (req.body.title !== undefined) doc.title = req.body.title;
    if (req.body.isFavorite !== undefined) doc.isFavorite = req.body.isFavorite;
    if (req.body.isTrashed !== undefined) doc.isTrashed = req.body.isTrashed;
    if (req.body.content !== undefined) doc.content = req.body.content;
    if (req.body.slides !== undefined) doc.slides = req.body.slides;

    const updatedDoc = await doc.save();
    res.json(updatedDoc);
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @route  DELETE /api/documents/:id
// @desc   Permanently delete a document (owner only)
const deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Document not found" });

    // Only owner can delete permanently
    if (doc.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the owner can delete this document" });
    }

    await doc.deleteOne();
    res.json({ message: "Document deleted permanently" });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @route  GET /api/documents/:id
// @desc   Get a single document (owner OR workspace member)
const getDocumentById = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Document not found" });

    const hasAccess = await hasAccessToDocument(doc, req.user._id);
    if (!hasAccess) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(doc);
  } catch (error) {
    console.error("Get Doc By Id Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @route  POST /api/documents/template
// @desc   Create a document from a pre-defined template
const createFromTemplate = async (req, res) => {
  try {
    const { templateId, title, workspaceId } = req.body;

    let content = "";
    let slides = [];

    if (templateId === "college-report") {
      content = `<h1 style="text-align: center;">A PROJECT REPORT ON</h1><h2 style="text-align: center;">[Project Title]</h2><p style="text-align: center; margin-top: 40px;">Submitted in partial fulfillment of the requirements for the degree of</p><p style="text-align: center;"><strong>Bachelor of Technology</strong></p><br /><p style="text-align: center;"><strong>Submitted By:</strong></p><p style="text-align: center;">[Your Name] (Roll No: [Your Roll No])</p><br /><p style="text-align: center;"><strong>Under the guidance of</strong></p><p style="text-align: center;">[Guide Name]</p><br /><p style="text-align: center;"><strong>Chitkara University, Punjab</strong></p><p style="text-align: center;">[Month, Year]</p><hr /><h2>1. Introduction</h2><p>Write your introduction here...</p><h2>2. Problem Statement</h2><p>Describe the problem you are solving...</p><h2>3. Objectives</h2><ul><li>Objective 1</li><li>Objective 2</li></ul><h2>4. Methodology</h2><p>Explain your approach...</p><h2>5. Results & Discussion</h2><p>Add your results here...</p><h2>6. Conclusion</h2><p>Summarize your findings...</p><h2>References</h2><ul><li>[1] Reference 1</li><li>[2] Reference 2</li></ul>`;
    } else if (templateId === "meeting-notes") {
      content = `<h1>Meeting Notes</h1><p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p><p><strong>Attendees:</strong> [Names]</p><hr /><h2>Agenda</h2><ul><li>Item 1</li><li>Item 2</li></ul><h2>Discussion</h2><p>Add notes here...</p><h2>Action Items</h2><ul><li>[ ] Task 1 - Owner</li><li>[ ] Task 2 - Owner</li></ul>`;
    } else if (templateId === "pitch-deck") {
      slides = [
        { id: "1", content: "Startup Pitch Deck", bg: "#1e1e1e" },
        { id: "2", content: "The Problem\n\nWhat problem are you solving?", bg: "#ffffff" },
        { id: "3", content: "The Solution\n\nHow does your product solve it?", bg: "#f3f4f6" },
        { id: "4", content: "Market Size\n\nHow big is the opportunity?", bg: "#fef3c7" },
        { id: "5", content: "Business Model\n\nHow will you make money?", bg: "#dcfce7" },
        { id: "6", content: "The Team\n\nWho is building this?", bg: "#dbeafe" }
      ];
    }

    const doc = await Document.create({
      title: title || "Untitled Document",
      type: templateId === "pitch-deck" ? "presentation" : templateId === "college-report" ? "report" : "document",
      content: templateId === "pitch-deck" ? "" : content,
      slides: slides,
      owner: req.user._id,
      workspaceId: workspaceId || null,
    });

    res.status(201).json(doc);
  } catch (error) {
    console.error("Create From Template Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @route  POST /api/documents/:id/comments
// @desc   Add a comment to a document
const addComment = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Document not found" });

    const hasAccess = await hasAccessToDocument(doc, req.user._id);
    if (!hasAccess) return res.status(403).json({ message: "Access denied" });

    const { text, selection } = req.body;
    const newComment = {
      text,
      author: req.user._id,
      authorName: req.user.name,
      resolved: false,
      selection: selection || {},
      replies: [],
    };

    doc.comments.push(newComment);
    await doc.save();

    // Return the newly created comment (last item in array)
    const createdComment = doc.comments[doc.comments.length - 1];
    res.status(201).json(createdComment);
  } catch (error) {
    console.error("Add Comment Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @route  PATCH /api/documents/:id/comments/:commentId
// @desc   Resolve or reply to a comment
const updateComment = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Document not found" });

    const hasAccess = await hasAccessToDocument(doc, req.user._id);
    if (!hasAccess) return res.status(403).json({ message: "Access denied" });

    const comment = doc.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // Handle resolve
    if (req.body.resolved !== undefined) {
      comment.resolved = req.body.resolved;
    }

    // Handle reply
    if (req.body.reply) {
      comment.replies.push({
        text: req.body.reply,
        author: req.user._id,
        authorName: req.user.name,
      });
    }

    await doc.save();
    res.json(comment);
  } catch (error) {
    console.error("Update Comment Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @route  DELETE /api/documents/:id/comments/:commentId
// @desc   Delete a comment
// @route  DELETE /api/documents/:id/comments/:commentId
// @desc   Delete a comment (author OR document owner only)
const deleteComment = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Document not found" });

    const hasAccess = await hasAccessToDocument(doc, req.user._id);
    if (!hasAccess) {
      return res.status(403).json({ message: "Access denied" });
    }

    const comment = doc.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // Handle both populated and non-populated owner
    const ownerId = typeof doc.owner === "object" 
      ? doc.owner._id.toString() 
      : doc.owner.toString();
    const isAuthor = comment.author.toString() === req.user._id.toString();
    const isOwner = ownerId === req.user._id.toString();

    // Rule A: Only author OR document owner can delete
    if (!isAuthor && !isOwner) {
      return res.status(403).json({ message: "Not authorized to delete this comment" });
    }

    comment.deleteOne();
    await doc.save();
    res.json({ message: "Comment deleted" });
  } catch (error) {
    console.error("Delete Comment Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @route  POST /api/documents/:id/versions
// @desc   Create a snapshot of the current document
const createVersion = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Document not found" });

    const hasAccess = await hasAccessToDocument(doc, req.user._id);
    if (!hasAccess) return res.status(403).json({ message: "Access denied" });

    const newVersion = {
      content: doc.content,
      slides: doc.slides,
      title: doc.title,
      savedBy: req.user.name,
      savedById: req.user._id,
      savedAt: new Date(),
    };

    // Keep only the last 20 versions (oldest removed first)
    doc.versions.push(newVersion);
    if (doc.versions.length > 20) {
      doc.versions = doc.versions.slice(-20);
    }

    await doc.save();
    res.status(201).json(doc.versions[doc.versions.length - 1]);
  } catch (error) {
    console.error("Create Version Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @route  GET /api/documents/:id/versions
// @desc   Get all versions of a document
const getVersions = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Document not found" });

    const hasAccess = await hasAccessToDocument(doc, req.user._id);
    if (!hasAccess) return res.status(403).json({ message: "Access denied" });

    // Return versions sorted newest first
    const versions = [...doc.versions].reverse();
    res.json(versions);
  } catch (error) {
    console.error("Get Versions Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @route  POST /api/documents/:id/versions/:versionId/restore
// @desc   Restore a specific version
const restoreVersion = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Document not found" });

    const hasAccess = await hasAccessToDocument(doc, req.user._id);
    if (!hasAccess) return res.status(403).json({ message: "Access denied" });

    const version = doc.versions.id(req.params.versionId);
    if (!version) return res.status(404).json({ message: "Version not found" });

    // Create a snapshot of the CURRENT state before restoring
    doc.versions.push({
      content: doc.content,
      slides: doc.slides,
      title: doc.title,
      savedBy: req.user.name,
      savedById: req.user._id,
      savedAt: new Date(),
    });

    // Restore the version
    doc.content = version.content || "";
    doc.slides = version.slides || [];
    doc.title = version.title || doc.title;

    // Keep only the last 20
    if (doc.versions.length > 20) {
      doc.versions = doc.versions.slice(-20);
    }

    await doc.save();
    res.json(doc);
  } catch (error) {
    console.error("Restore Version Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @route  DELETE /api/documents/:id/versions/:versionId
// @desc   Delete a specific version
const deleteVersion = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Document not found" });

    const hasAccess = await hasAccessToDocument(doc, req.user._id);
    if (!hasAccess) return res.status(403).json({ message: "Access denied" });

    const version = doc.versions.id(req.params.versionId);
    if (!version) return res.status(404).json({ message: "Version not found" });

    version.deleteOne();
    await doc.save();
    res.json({ message: "Version deleted" });
  } catch (error) {
    console.error("Delete Version Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { 
  createDocument, 
  getMyDocuments, 
  updateDocument, 
  deleteDocument, 
  getDocumentById,
  createFromTemplate,
  addComment,
  updateComment,
  deleteComment,
  createVersion,      // 🆕
  getVersions,        // 🆕
  restoreVersion,     // 🆕
  deleteVersion,
};