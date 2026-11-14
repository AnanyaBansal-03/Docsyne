// backend/routes/documentRoutes.js
const express = require("express");
const router = express.Router();
const {
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
} = require("../controllers/documentController");
const { protect } = require("../middleware/authMiddleware");

router.route("/")
  .post(protect, createDocument)
  .get(protect, getMyDocuments);

router.post("/template", protect, createFromTemplate);

router.route("/:id")
  .get(protect, getDocumentById)
  .patch(protect, updateDocument)
  .delete(protect, deleteDocument);

// Comments
router.post("/:id/comments", protect, addComment);
router.patch("/:id/comments/:commentId", protect, updateComment);
router.delete("/:id/comments/:commentId", protect, deleteComment);

// 🆕 Versions
router.post("/:id/versions", protect, createVersion);
router.get("/:id/versions", protect, getVersions);
router.post("/:id/versions/:versionId/restore", protect, restoreVersion);
router.delete("/:id/versions/:versionId", protect, deleteVersion);  // 🆕

module.exports = router;