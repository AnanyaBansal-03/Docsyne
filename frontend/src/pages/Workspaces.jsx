// src/pages/Workspaces.jsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Users, Loader2, FolderKanban } from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

const WORKSPACE_COLORS = [
  { id: "violet", class: "from-violet-600 to-fuchsia-600", bg: "bg-violet-500" },
  { id: "blue", class: "from-blue-500 to-cyan-500", bg: "bg-blue-500" },
  { id: "emerald", class: "from-emerald-500 to-teal-500", bg: "bg-emerald-500" },
  { id: "orange", class: "from-orange-500 to-red-500", bg: "bg-orange-500" },
  { id: "pink", class: "from-pink-500 to-rose-500", bg: "bg-pink-500" },
];

export default function Workspaces() {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", color: "violet" });
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  const fetchWorkspaces = async () => {
    try {
      const res = await API.get("/workspaces");
      setWorkspaces(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setCreating(true);
    try {
      const colorObj = WORKSPACE_COLORS.find((c) => c.id === form.color) || WORKSPACE_COLORS[0];
      const res = await API.post("/workspaces", {
        name: form.name,
        description: form.description,
        color: colorObj.class,
      });
      setWorkspaces([res.data, ...workspaces]);
      setShowModal(false);
      setForm({ name: "", description: "", color: "violet" });
    } catch (error) {
      alert("Failed to create workspace");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-violet-600" size={32} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl p-8">
      
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#202020]">Workspaces</h1>
          <p className="mt-1 text-sm font-medium text-gray-500">
            Team spaces for documents, reports, and decks.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition hover:-translate-y-0.5 hover:bg-violet-700"
        >
          <Plus size={16} /> New Workspace
        </button>
      </div>

      {/* Empty State */}
      {workspaces.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-200 bg-white/50 py-24">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-violet-100 text-violet-600 shadow-inner">
            <FolderKanban size={36} />
          </div>
          <h2 className="text-xl font-bold text-gray-900">No workspaces yet</h2>
          <p className="mb-8 mt-2 max-w-sm text-center text-sm text-gray-500">
            Create your first workspace to start collaborating with your team.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition hover:bg-violet-700"
          >
            <Plus size={16} /> Create Workspace
          </button>
        </div>
      )}

      {/* Workspace Grid */}
      {workspaces.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {workspaces.map((ws, i) => {
              const colorClass = ws.color || "from-violet-600 to-fuchsia-600";
              return (
                <motion.div
                  key={ws._id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => navigate(`/workspace/${ws._id}`)}
                  className="group relative cursor-pointer overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-500/10"
                >
                  {/* Colored Top Bar */}
                  <div className={`h-24 bg-gradient-to-r ${colorClass} p-5`}>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
                      <FolderKanban size={20} className="text-white" />
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 group-hover:text-violet-600 transition">
                      {ws.name}
                    </h3>
                    {ws.description && (
                      <p className="mt-1 text-xs text-gray-500 line-clamp-2">{ws.description}</p>
                    )}
                    
                    <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Users size={14} />
                        {ws.members?.length || 1} member{(ws.members?.length || 1) > 1 ? "s" : ""}
                      </div>
                      <span className="text-xs font-semibold text-violet-600 opacity-0 transition group-hover:opacity-100">
                        Open →
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* CREATE WORKSPACE MODAL */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/80 bg-white/95 p-8 shadow-2xl backdrop-blur-2xl"
            >
              {/* Mesh gradient */}
              <div className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute -top-32 -left-32 h-80 w-80 rounded-full bg-violet-300/20 blur-3xl" />
                <div className="absolute top-32 right-0 h-80 w-80 rounded-full bg-emerald-300/20 blur-3xl" />
                <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-blue-300/20 blur-3xl" />
              </div>

              <div className="mb-8 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 shadow-sm">
                  <FolderKanban size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold tracking-tight text-[#202020]">New Workspace</h3>
                  <p className="text-sm text-gray-600">Team space for shared documents.</p>
                </div>
              </div>

              <form onSubmit={handleCreate} className="space-y-5">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-700">Workspace Name</label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Engineering Team, Marketing, Personal"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition-colors placeholder:text-slate-400 focus:ring-4 focus:border-violet-500 focus:ring-violet-500/15"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-700">Description (optional)</label>
                  <input
                    type="text"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="What's this workspace about?"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition-colors placeholder:text-slate-400 focus:ring-4 focus:border-violet-500 focus:ring-violet-500/15"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-700">Color</label>
                  <div className="flex gap-2">
                    {WORKSPACE_COLORS.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setForm({ ...form, color: c.id })}
                        className={`h-10 w-10 rounded-full bg-gradient-to-r ${c.class} transition ${
                          form.color === c.id ? "ring-2 ring-violet-600 ring-offset-2 scale-110" : "hover:scale-105"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 rounded-xl border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-violet-600 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition-colors hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {creating ? <Loader2 size={16} className="animate-spin" /> : "Create Workspace"}
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