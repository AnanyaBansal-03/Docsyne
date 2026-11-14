// src/pages/WorkspaceDetail.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Users, FileText, Presentation, FileSpreadsheet, Loader2, UserPlus, Mail, X, Trash2 } from "lucide-react";
import API from "../api/axios";

export default function WorkspaceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("editor");
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState("");

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const fetchWorkspace = async () => {
    try {
      const res = await API.get(`/workspaces/${id}`);
      setWorkspace(res.data);
    } catch (error) {
      alert("Failed to load workspace");
      navigate("/workspaces");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspace();
  }, [id]);

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviteError("");
    setInviting(true);
    try {
      await API.post(`/workspaces/${id}/invite`, {
        email: inviteEmail,
        role: inviteRole,
      });
      await fetchWorkspace();
      setShowInvite(false);
      setInviteEmail("");
    } catch (error) {
      setInviteError(error.response?.data?.message || "Failed to invite");
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (userId, userName) => {
    if (!window.confirm(`Remove ${userName} from this workspace?`)) return;
    try {
      await API.delete(`/workspaces/${id}/members/${userId}`);
      await fetchWorkspace();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to remove member");
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-violet-600" size={32} />
      </div>
    );
  }

  if (!workspace) return null;

  const isOwner = workspace.owner._id === currentUser?.id;

  return (
    <div className="mx-auto max-w-6xl p-8">
      
      {/* Header */}
      <button
        onClick={() => navigate("/workspaces")}
        className="mb-6 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-100"
      >
        <ArrowLeft size={16} /> Back to Workspaces
      </button>

      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-3">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r ${workspace.color}`}>
              <FileText size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-[#202020]">{workspace.name}</h1>
              {workspace.description && (
                <p className="mt-1 text-sm text-gray-500">{workspace.description}</p>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {isOwner && (
            <button
              onClick={() => setShowInvite(true)}
              className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              <UserPlus size={16} /> Invite
            </button>
          )}
          <button
            onClick={() => navigate(`/documents?workspace=${workspace._id}`)}
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition hover:bg-violet-700"
          >
            <Plus size={16} /> New Document
          </button>
        </div>
      </div>

      {/* Members Row */}
      <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-600">
          <Users size={16} />
          Members ({workspace.members.length})
        </div>
        
        <div className="space-y-2">
          {workspace.members.map((m, i) => {
            const isWorkspaceOwner = m.user._id === workspace.owner._id;
            const canRemove = isOwner && !isWorkspaceOwner;

            return (
              <div
                key={i}
                className="group flex items-center justify-between rounded-xl border border-gray-100 bg-[#faf9f6] px-3 py-2 transition hover:bg-white hover:shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-[10px] font-bold text-white shadow-sm">
                    {m.user?.name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {m.user?.name || "Unknown"}
                      {isWorkspaceOwner && (
                        <span className="ml-2 rounded-full bg-violet-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-violet-700">
                          Owner
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] text-gray-500">{m.user?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${
                    m.role === "editor" ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-600"
                  }`}>
                    {m.role}
                  </span>
                  {canRemove && (
                    <button
                      onClick={() => handleRemoveMember(m.user._id, m.user.name)}
                      className="rounded-md p-1.5 text-gray-400 opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                      title="Remove member"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Documents List */}
      <div>
        <h2 className="mb-4 text-sm font-bold text-gray-900">
          Documents ({workspace.documents?.length || 0})
        </h2>

        {workspace.documents?.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white/50 py-16">
            <p className="text-sm text-gray-500">No documents in this workspace yet.</p>
            <button
              onClick={() => navigate(`/documents?workspace=${workspace._id}`)}
              className="mt-3 flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
            >
              <Plus size={14} /> Create Document
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {workspace.documents.map((doc) => (
              <div
                key={doc._id}
                onClick={() => navigate(doc.type === "presentation" ? `/presentation/${doc._id}` : `/doc/${doc._id}`)}
                className="group flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                  doc.type === "presentation" ? "bg-pink-50 text-pink-600" :
                  doc.type === "report" ? "bg-emerald-50 text-emerald-600" :
                  "bg-blue-50 text-blue-600"
                }`}>
                  {doc.type === "presentation" ? <Presentation size={18} /> : doc.type === "report" ? <FileSpreadsheet size={18} /> : <FileText size={18} />}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="truncate text-sm font-semibold text-gray-900 group-hover:text-violet-600 transition">{doc.title}</p>
                  <p className="text-[11px] text-gray-500">
                    {new Date(doc.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invite Modal */}
      <AnimatePresence>
        {showInvite && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4 backdrop-blur-sm"
            onClick={() => setShowInvite(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-3xl border border-white/80 bg-white p-8 shadow-2xl"
            >
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
                  <Mail size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold tracking-tight">Invite Member</h3>
                  <p className="text-sm text-gray-600">Add someone by email</p>
                </div>
              </div>

              <form onSubmit={handleInvite} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-700">Email Address</label>
                  <input
                    type="email"
                    required
                    autoFocus
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="teammate@company.com"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/15"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-700">Role</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none"
                  >
                    <option value="editor">Editor (can edit documents)</option>
                    <option value="viewer">Viewer (can only view)</option>
                  </select>
                </div>

                {inviteError && <p className="text-xs font-medium text-red-600">{inviteError}</p>}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowInvite(false)}
                    className="flex-1 rounded-xl border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={inviting}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-violet-600 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition hover:bg-violet-700 disabled:opacity-70"
                  >
                    {inviting ? <Loader2 size={16} className="animate-spin" /> : "Send Invite"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}