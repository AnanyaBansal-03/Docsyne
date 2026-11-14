// src/pages/DocumentEditor.jsx
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  ArrowLeft, Loader2, Bold, Italic, List, ListOrdered,
  Heading1, Heading2, Undo, Redo, Users, FolderKanban,
  MessageSquare, X, Check, Send, Trash2, History, RotateCcw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../api/axios";
import { connectSocket, disconnectSocket } from "../api/socket";

const ToolbarButton = ({ onClick, isActive, disabled, children }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`rounded-lg p-2 transition ${
      isActive ? "bg-violet-100 text-violet-700" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
    } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
  >
    {children}
  </button>
);

export default function DocumentEditor() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [document, setDocument] = useState(null);
  const [initialContent, setInitialContent] = useState(null);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingStatus, setSavingStatus] = useState("Saved");
  const [liveUsers, setLiveUsers] = useState([]);
  const [remoteCursors, setRemoteCursors] = useState({});
  const [socketConnected, setSocketConnected] = useState(false);

  // Comments state
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [newCommentText, setNewCommentText] = useState("");
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [savedSelection, setSavedSelection] = useState(null);

  // Versions state
  const [versions, setVersions] = useState([]);
  const [showVersions, setShowVersions] = useState(false);
  const [creatingVersion, setCreatingVersion] = useState(false);

  const socketRef = useRef(null);
  const editorRef = useRef(null);
  const isRemoteUpdate = useRef(false);
  const saveTimerRef = useRef(null);
  const editorContainerRef = useRef(null);

  // 1. Fetch document
  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const res = await API.get(`/documents/${id}`);
        setDocument(res.data);
        setTitle(res.data.title);
        setInitialContent(res.data.content || "");
        setComments(res.data.comments || []);
        setVersions((res.data.versions || []).slice().reverse());
      } catch (error) {
        alert("Failed to load document");
        navigate("/documents");
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();
  }, [id, navigate]);

  // 2. Connect socket
  useEffect(() => {
    if (initialContent === null) return;
    const socket = connectSocket();
    socketRef.current = socket;

    socket.on("connect", () => {
      setSocketConnected(true);
      socket.emit("join-document", { documentId: id });
    });

    socket.on("room-users", (users) => {
      setLiveUsers(users.filter((u) => u.id !== socket.id));
    });

    socket.on("document-updated", ({ content }) => {
      if (editorRef.current && content !== editorRef.current.getHTML()) {
        isRemoteUpdate.current = true;
        editorRef.current.commands.setContent(content, false);
        isRemoteUpdate.current = false;
      }
    });

    socket.on("cursor-moved", ({ userId, name, initial, color, position }) => {
      setRemoteCursors((prev) => ({
        ...prev,
        [userId]: { name, initial, color, position },
      }));
    });

    socket.on("cursor-remove", ({ userId }) => {
      setRemoteCursors((prev) => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
    });

    socket.on("comment-added", ({ comment }) => {
      setComments((prev) => [...prev, comment]);
    });
    socket.on("comment-updated", ({ comment }) => {
      setComments((prev) => prev.map((c) => (c._id === comment._id ? comment : c)));
    });
    socket.on("comment-deleted", ({ commentId }) => {
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    });

    return () => {
      socket.off("connect");
      socket.off("room-users");
      socket.off("document-updated");
      socket.off("cursor-moved");
      socket.off("cursor-remove");
      socket.off("comment-added");
      socket.off("comment-updated");
      socket.off("comment-deleted");
      disconnectSocket();
    };
  }, [id, initialContent]);

  // 3. Initialize editor
  const editor = useEditor(
    {
      extensions: [StarterKit],
      content: initialContent || "",
      editorProps: {
        attributes: {
          class: "prose prose-lg max-w-none focus:outline-none min-h-[500px] text-gray-800",
        },
      },
      onUpdate: ({ editor }) => {
        if (isRemoteUpdate.current) return;
        const html = editor.getHTML();
        if (socketRef.current) {
          socketRef.current.emit("document-update", { documentId: id, content: html });
        }
        setSavingStatus("Saving...");
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(async () => {
          try {
            await API.patch(`/documents/${id}`, { content: html });
            setSavingStatus("Saved");
          } catch (error) {
            setSavingStatus("Error saving");
          }
        }, 1000);
      },
      onSelectionUpdate: ({ editor }) => {
        if (!socketRef.current) return;
        const { from, to } = editor.state.selection;
        socketRef.current.emit("cursor-move", {
          documentId: id,
          position: { from, to },
        });
        if (from !== to) {
          setSavedSelection({
            from,
            to,
            text: editor.state.doc.textBetween(from, to, " "),
          });
        }
      },
    },
    [initialContent]
  );

  useEffect(() => {
    if (editor) editorRef.current = editor;
  }, [editor]);

  const handleTitleChange = async (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    setSavingStatus("Saving...");
    try {
      await API.patch(`/documents/${id}`, { title: newTitle });
      setSavingStatus("Saved");
    } catch (error) {
      setSavingStatus("Error saving");
    }
  };

  // Comments handlers
  const handleAddComment = async () => {
    if (!savedSelection || !savedSelection.text.trim()) {
      alert("Please select some text in the editor first");
      return;
    }
    if (!newCommentText.trim()) {
      alert("Comment cannot be empty");
      return;
    }
    try {
      const res = await API.post(`/documents/${id}/comments`, {
        text: newCommentText,
        selection: {
          from: savedSelection.from,
          to: savedSelection.to,
          text: savedSelection.text.slice(0, 100),
        },
      });
      setComments([...comments, res.data]);
      setNewCommentText("");
      setShowComments(true);
      setSavedSelection(null);
      if (socketRef.current) {
        socketRef.current.emit("comment-added", { documentId: id, comment: res.data });
      }
    } catch (error) {
      alert("Failed to add comment");
    }
  };

  const handleResolveComment = async (commentId, resolved) => {
    try {
      const res = await API.patch(`/documents/${id}/comments/${commentId}`, { resolved });
      setComments(comments.map((c) => (c._id === commentId ? res.data : c)));
      if (socketRef.current) {
        socketRef.current.emit("comment-updated", { documentId: id, comment: res.data });
      }
    } catch (error) {
      alert("Failed to update comment");
    }
  };

  const handleReply = async (commentId) => {
    if (!replyText.trim()) return;
    try {
      const res = await API.patch(`/documents/${id}/comments/${commentId}`, { reply: replyText });
      setComments(comments.map((c) => (c._id === commentId ? res.data : c)));
      setReplyText("");
      setActiveReplyId(null);
      if (socketRef.current) {
        socketRef.current.emit("comment-updated", { documentId: id, comment: res.data });
      }
    } catch (error) {
      alert("Failed to reply");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await API.delete(`/documents/${id}/comments/${commentId}`);
      setComments(comments.filter((c) => c._id !== commentId));
      if (socketRef.current) {
        socketRef.current.emit("comment-deleted", { documentId: id, commentId });
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to delete comment";
      alert(msg);
    }
  };

  // Version handlers
  const handleSaveVersion = async () => {
    setCreatingVersion(true);
    try {
      const res = await API.post(`/documents/${id}/versions`);
      setVersions([res.data, ...versions]);
    } catch (error) {
      alert("Failed to save version");
    } finally {
      setCreatingVersion(false);
    }
  };

  const handleRestoreVersion = async (versionId) => {
    if (!window.confirm("Restore this version? Your current changes will be saved as a new version before restoring.")) return;
    try {
      const res = await API.post(`/documents/${id}/versions/${versionId}/restore`);

      setDocument(res.data);
      setTitle(res.data.title);
      setInitialContent(res.data.content);
      setVersions((res.data.versions || []).slice().reverse());

      if (editor) {
        editor.commands.setContent(res.data.content || "");
      }

      if (socketRef.current) {
        socketRef.current.emit("document-update", {
          documentId: id,
          content: res.data.content || ""
        });
      }

      alert("Version restored successfully");
    } catch (error) {
      alert("Failed to restore version");
    }
  };

  // 🆕 Delete version handler
  const handleDeleteVersion = async (versionId) => {
    if (!window.confirm("Delete this version? This cannot be undone.")) return;
    try {
      await API.delete(`/documents/${id}/versions/${versionId}`);
      setVersions(versions.filter((v) => v._id !== versionId));
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete version");
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (loading || !editor) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#faf9f6]">
        <Loader2 className="animate-spin text-violet-600" size={40} />
      </div>
    );
  }

  const totalOnline = Math.max(1, liveUsers.length);

  return (
    <div className="flex h-screen flex-col bg-[#faf9f6]">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/documents")}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-100"
          >
            <ArrowLeft size={16} /> Back
          </button>

          {document?.workspaceId && document.workspaceId.name && (
            <span
              onClick={() => navigate(`/workspace/${document.workspaceId._id}`)}
              className={`flex cursor-pointer items-center gap-1.5 rounded-full bg-gradient-to-r ${document.workspaceId.color || "from-violet-600 to-fuchsia-600"} px-3 py-1 text-xs font-semibold text-white shadow-sm transition hover:opacity-90`}
            >
              <FolderKanban size={12} />
              {document.workspaceId.name}
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          {socketConnected && (
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              <Users size={13} />
              {totalOnline === 1 ? "Only you here" : `${totalOnline} editing now`}
            </div>
          )}

          {liveUsers.length > 0 && (
            <div className="flex items-center gap-2">
              {liveUsers.map((u) => (
                <div key={u.id} className="flex items-center gap-1.5">
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-sm"
                    style={{ background: u.color }}
                    title={u.name}
                  >
                    {u.initial}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* History Button */}
          <button
            onClick={() => { setShowVersions(!showVersions); setShowComments(false); }}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              showVersions
                ? "bg-violet-600 text-white shadow-md"
                : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            <History size={14} />
            History ({versions.length})
          </button>

          {/* Comments Button */}
          <button
            onClick={() => { setShowComments(!showComments); setShowVersions(false); }}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              showComments
                ? "bg-violet-600 text-white shadow-md"
                : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            <MessageSquare size={14} />
            Comments ({comments.length})
          </button>

          <span
            className={`text-xs font-semibold ${
              savingStatus === "Saved" ? "text-emerald-600" : "text-amber-500"
            }`}
          >
            {savingStatus === "Saved" ? "✓ Saved" : "Saving..."}
          </span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Editor */}
        <div className="flex flex-1 flex-col items-center overflow-y-auto p-4 md:p-12">
          <div className="w-full max-w-4xl rounded-2xl bg-white shadow-xl">
            <div className="px-8 pt-8 pb-4">
              <input
                type="text"
                value={title}
                onChange={handleTitleChange}
                placeholder="Untitled Document"
                className="w-full border-none bg-transparent text-4xl font-extrabold tracking-tight text-gray-900 outline-none placeholder:text-gray-300"
              />
            </div>

            <div className="sticky top-0 z-10 mx-8 flex flex-wrap items-center gap-1 border-b border-gray-100 bg-white/95 pb-2 backdrop-blur">
              <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive("bold")}><Bold size={16} /></ToolbarButton>
              <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive("italic")}><Italic size={16} /></ToolbarButton>
              <div className="mx-1 h-6 w-px bg-gray-200" />
              <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive("heading", { level: 1 })}><Heading1 size={16} /></ToolbarButton>
              <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive("heading", { level: 2 })}><Heading2 size={16} /></ToolbarButton>
              <div className="mx-1 h-6 w-px bg-gray-200" />
              <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive("bulletList")}><List size={16} /></ToolbarButton>
              <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive("orderedList")}><ListOrdered size={16} /></ToolbarButton>
              <div className="mx-1 h-6 w-px bg-gray-200" />
              <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}><Undo size={16} /></ToolbarButton>
              <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}><Redo size={16} /></ToolbarButton>
            </div>

            <div className="relative px-8 py-6" ref={editorContainerRef}>
              <EditorContent editor={editor} />
              <AnimatePresence>
                {Object.entries(remoteCursors).map(([userId, cursor]) => (
                  <RemoteCursor
                    key={userId}
                    cursor={cursor}
                    editor={editor}
                    containerRef={editorContainerRef}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Versions Sidebar */}
        <AnimatePresence>
          {showVersions && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 340, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="flex flex-col overflow-hidden border-l border-gray-200 bg-white shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                <h3 className="text-sm font-bold text-gray-900">
                  Version History ({versions.length})
                </h3>
                <button
                  onClick={() => setShowVersions(false)}
                  className="rounded-md p-1 text-gray-400 hover:bg-gray-100"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="border-b border-gray-100 p-3">
                <button
                  onClick={handleSaveVersion}
                  disabled={creatingVersion}
                  className="w-full rounded-lg bg-violet-600 py-2 text-xs font-semibold text-white hover:bg-violet-700 disabled:opacity-70"
                >
                  {creatingVersion ? "Saving..." : "📸 Save Version"}
                </button>
                <p className="mt-2 text-center text-[10px] text-gray-500">
                  Snapshot the current state
                </p>
              </div>

              <div className="flex-1 overflow-y-auto">
                {versions.length === 0 ? (
                  <div className="p-6 text-center">
                    <History size={32} className="mx-auto mb-3 text-gray-300" />
                    <p className="text-xs text-gray-500">No versions yet</p>
                    <p className="mt-1 text-[10px] text-gray-400">
                      Click "Save Version" to create a snapshot
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 p-3">
                    {versions.map((version, index) => (
                      <div
                        key={version._id}
                        className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <div>
                            <p className="text-xs font-semibold text-gray-900">
                              {index === 0 ? "Latest" : `v${versions.length - index}`}
                            </p>
                            <p className="text-[10px] text-gray-500">
                              {formatDate(version.savedAt)}
                            </p>
                          </div>
                          <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[9px] font-bold text-violet-700">
                            {version.savedBy}
                          </span>
                        </div>
                        <p className="mb-2 line-clamp-2 text-[10px] italic text-gray-600">
                          {version.title}
                        </p>
                        
                        {/* 🆕 Restore + Delete buttons side by side */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleRestoreVersion(version._id)}
                            className="flex flex-1 items-center justify-center gap-1 rounded-md bg-emerald-600 py-1.5 text-[10px] font-semibold text-white hover:bg-emerald-700"
                          >
                            <RotateCcw size={10} />
                            Restore
                          </button>
                          <button
                            onClick={() => handleDeleteVersion(version._id)}
                            className="flex items-center justify-center gap-1 rounded-md bg-red-500 px-3 py-1.5 text-[10px] font-semibold text-white hover:bg-red-600"
                            title="Delete version"
                          >
                            <Trash2 size={10} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Comments Sidebar */}
        <AnimatePresence>
          {showComments && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 340, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="flex flex-col overflow-hidden border-l border-gray-200 bg-white shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                <h3 className="text-sm font-bold text-gray-900">
                  Comments ({comments.length})
                </h3>
                <button
                  onClick={() => setShowComments(false)}
                  className="rounded-md p-1 text-gray-400 hover:bg-gray-100"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="border-b border-gray-100 p-3">
                {savedSelection && (
                  <div className="mb-2 rounded-md border-l-2 border-violet-400 bg-violet-50 px-2 py-1.5 text-[10px] italic text-gray-600 line-clamp-2">
                    "{savedSelection.text.slice(0, 80)}"
                    {savedSelection.text.length > 80 ? "..." : ""}
                  </div>
                )}

                <textarea
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Write your comment..."
                  className="w-full rounded-lg border border-gray-200 p-2 text-xs resize-none outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-500/20"
                  rows={3}
                />
                <button
                  onClick={handleAddComment}
                  className="mt-2 w-full rounded-lg bg-violet-600 py-2 text-xs font-semibold text-white hover:bg-violet-700"
                >
                  Add Comment
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {comments.length === 0 ? (
                  <div className="p-6 text-center">
                    <MessageSquare size={32} className="mx-auto mb-3 text-gray-300" />
                    <p className="text-xs text-gray-500">No comments yet</p>
                    <p className="mt-1 text-[10px] text-gray-400">
                      Select text in the editor to start a discussion
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 p-3">
                    {comments.map((comment) => (
                      <div
                        key={comment._id}
                        className={`rounded-xl border p-3 ${
                          comment.resolved
                            ? "border-gray-100 bg-gray-50 opacity-70"
                            : "border-violet-100 bg-violet-50/30"
                        }`}
                      >
                        {comment.selection?.text && (
                          <div className="mb-2 border-l-2 border-violet-400 bg-white px-2 py-1 text-[10px] italic text-gray-600">
                            "{comment.selection.text}"
                          </div>
                        )}

                        <div className="mb-1.5 flex items-center gap-1.5">
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-[8px] font-bold text-white">
                            {comment.authorName?.[0]?.toUpperCase()}
                          </div>
                          <span className="text-xs font-semibold text-gray-900">
                            {comment.authorName}
                          </span>
                        </div>

                        <p className="text-xs text-gray-700">{comment.text}</p>

                        {comment.replies?.length > 0 && (
                          <div className="mt-2 space-y-1.5 border-t border-gray-200 pt-2">
                            {comment.replies.map((reply) => (
                              <div key={reply._id} className="pl-2 border-l-2 border-gray-200">
                                <p className="text-[10px] font-semibold text-gray-600">{reply.authorName}</p>
                                <p className="text-[10px] text-gray-500">{reply.text}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="mt-2 flex items-center gap-2">
                          {!comment.resolved && (
                            <button
                              onClick={() => handleResolveComment(comment._id, true)}
                              className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 hover:underline"
                            >
                              <Check size={10} /> Resolve
                            </button>
                          )}
                          <button
                            onClick={() => setActiveReplyId(comment._id)}
                            className="text-[10px] font-semibold text-violet-600 hover:underline"
                          >
                            Reply
                          </button>
                          <button
                            onClick={() => handleDeleteComment(comment._id)}
                            className="ml-auto flex items-center gap-1 text-[10px] font-semibold text-red-500 hover:underline"
                          >
                            <Trash2 size={10} /> Delete
                          </button>
                        </div>

                        {activeReplyId === comment._id && (
                          <div className="mt-2 flex gap-1">
                            <input
                              type="text"
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Reply..."
                              className="flex-1 rounded-md border border-gray-200 px-2 py-1 text-[10px] outline-none focus:border-violet-400"
                              onKeyDown={(e) => e.key === "Enter" && handleReply(comment._id)}
                            />
                            <button
                              onClick={() => handleReply(comment._id)}
                              className="rounded-md bg-violet-600 p-1 text-white hover:bg-violet-700"
                            >
                              <Send size={10} />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function RemoteCursor({ cursor, editor, containerRef }) {
  const [coords, setCoords] = useState(null);

  useEffect(() => {
    if (!editor || !cursor.position || !containerRef.current) return;
    try {
      const pos = editor.view.coordsAtPos(cursor.position.from);
      const containerRect = containerRef.current.getBoundingClientRect();
      setCoords({
        top: pos.top - containerRect.top,
        left: pos.left - containerRect.left,
      });
    } catch (e) {}
  }, [cursor.position, editor, containerRef]);

  if (!coords) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "absolute",
        top: coords.top,
        left: coords.left,
        pointerEvents: "none",
        zIndex: 30,
      }}
    >
      <div style={{ background: cursor.color, width: 2, height: 20 }} className="rounded-full" />
      <div
        style={{ background: cursor.color }}
        className="absolute -top-6 left-0 flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold text-white shadow-md"
      >
        {cursor.initial}
      </div>
    </motion.div>
  );
}