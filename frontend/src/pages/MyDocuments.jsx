// src/pages/MyDocuments.jsx
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, FileText, Presentation, FileSpreadsheet, Star, Trash2, Loader2, LayoutGrid, List, Sparkles, ArrowLeft, FolderKanban } from "lucide-react";
import API from "../api/axios";

export default function MyDocuments() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [filter, setFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState("document");
  const [creating, setCreating] = useState(false);
  const [activeWorkspace, setActiveWorkspace] = useState(null);

  const [searchParams] = useSearchParams();
  const workspaceId = searchParams.get("workspace");
  const navigate = useNavigate();

  const fetchDocs = async () => {
    try {
      const url = workspaceId
        ? `/documents?workspaceId=${workspaceId}`
        : "/documents";
      const res = await API.get(url);
      setDocs(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkspace = async () => {
    if (!workspaceId) return;
    try {
      const res = await API.get(`/workspaces/${workspaceId}`);
      setActiveWorkspace(res.data);
    } catch (error) {
      console.error("Workspace not found", error);
    }
  };

  useEffect(() => {
    fetchDocs();
    fetchWorkspace();
  }, [workspaceId]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await API.post("/documents", {
        title: newTitle || "Untitled Document",
        type: newType,
        workspaceId: workspaceId || null,
      });
      setDocs([res.data, ...docs]);
      setShowModal(false);
      setNewTitle("");

      navigate(
        res.data.type === "presentation"
          ? `/presentation/${res.data._id}`
          : `/doc/${res.data._id}`
      );
    } catch (error) {
      alert("Failed to create document");
    } finally {
      setCreating(false);
    }
  };

  const handleToggleFavorite = async (e, id, currentFav) => {
    e.stopPropagation();
    try {
      const res = await API.patch(`/documents/${id}`, { isFavorite: !currentFav });
      setDocs(docs.map((d) => (d._id === id ? res.data : d)));
    } catch (error) {
      console.error(error);
    }
  };

  const handleTrash = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Move to trash?")) return;
    try {
      await API.patch(`/documents/${id}`, { isTrashed: true });
      setDocs(docs.filter((d) => d._id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const filteredDocs = docs.filter((doc) => filter === "all" || doc.type === filter);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-violet-600" size={32} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl p-8">
      {workspaceId && (
        <button
          onClick={() => navigate(`/workspace/${workspaceId}`)}
          className="mb-6 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-100"
        >
          <ArrowLeft size={16} /> Back to Workspace
        </button>
      )}

      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#202020]">
            {activeWorkspace ? activeWorkspace.name : "My Documents"}
          </h1>
          <p className="mt-1 text-sm font-medium text-gray-500">
            {activeWorkspace
              ? `Documents inside ${activeWorkspace.name}`
              : "Manage your documents, reports, and decks."}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition hover:-translate-y-0.5 hover:bg-violet-700"
        >
          <Plus size={16} /> Create New
        </button>
      </div>

      {activeWorkspace && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-violet-200 bg-violet-50 p-4">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r ${activeWorkspace.color}`}>
            <FileText size={18} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-violet-900">Creating in: {activeWorkspace.name}</p>
            <p className="text-xs text-violet-700">New documents will be added to this workspace.</p>
          </div>
        </div>
      )}

      {!workspaceId && (
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { icon: FileText, title: "Blank Document", desc: "Start from scratch", color: "text-blue-600", bg: "bg-blue-50", type: "document" },
            { icon: FileSpreadsheet, title: "Project Report", desc: "Use a template", color: "text-emerald-600", bg: "bg-emerald-50", type: "report" },
            { icon: Presentation, title: "Slide Deck", desc: "Build a presentation", color: "text-pink-600", bg: "bg-pink-50", type: "presentation" },
          ].map((item, i) => (
            <motion.button
              key={i}
              whileHover={{ y: -4 }}
              onClick={() => { setNewType(item.type); setShowModal(true); }}
              className="group flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm transition-all hover:shadow-xl hover:shadow-violet-500/5"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.bg} ${item.color} transition group-hover:scale-110`}>
                <item.icon size={20} />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">{item.title}</p>
                <p className="text-[11px] font-medium text-gray-500">{item.desc}</p>
              </div>
            </motion.button>
          ))}
        </div>
      )}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div className="flex space-x-1 overflow-x-auto">
          {[
            { id: "all", label: "All Docs" },
            { id: "document", label: "Documents" },
            { id: "report", label: "Reports" },
            { id: "presentation", label: "Decks" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold transition ${
                filter === tab.id ? "bg-violet-100 text-violet-700" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1">
          <button onClick={() => setViewMode("grid")} className={`rounded-md p-1.5 transition ${viewMode === "grid" ? "bg-gray-100 text-gray-900" : "text-gray-400 hover:text-gray-600"}`}>
            <LayoutGrid size={16} />
          </button>
          <button onClick={() => setViewMode("list")} className={`rounded-md p-1.5 transition ${viewMode === "list" ? "bg-gray-100 text-gray-900" : "text-gray-400 hover:text-gray-600"}`}>
            <List size={16} />
          </button>
        </div>
      </div>

      {filteredDocs.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-200 bg-white/50 py-24">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-violet-100 text-violet-600 shadow-inner">
            <FileText size={36} />
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            No {filter === "all" ? "documents" : filter + "s"} yet
          </h2>
          <p className="mb-8 mt-2 max-w-sm text-center text-sm text-gray-500">
            {workspaceId
              ? "This workspace has no documents yet. Create your first one!"
              : "You haven't created any documents yet. Start writing!"}
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition hover:bg-violet-700"
          >
            <Plus size={16} /> Create Document
          </button>
        </div>
      )}

      {/* GRID VIEW */}
      {filteredDocs.length > 0 && viewMode === "grid" && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence>
            {filteredDocs.map((doc, i) => (
              <motion.div
                key={doc._id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => navigate(doc.type === "presentation" ? `/presentation/${doc._id}` : `/doc/${doc._id}`)}
                className="group relative flex cursor-pointer flex-col rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-500/10 overflow-hidden"
              >
                <div className={`flex h-32 w-full items-center justify-center border-b border-gray-100 ${
                  doc.type === "presentation" ? "bg-pink-50/50" :
                  doc.type === "report" ? "bg-emerald-50/50" :
                  "bg-blue-50/50"
                }`}>
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ${
                    doc.type === "presentation" ? "text-pink-600" :
                    doc.type === "report" ? "text-emerald-600" :
                    "text-blue-600"
                  }`}>
                    {doc.type === "presentation" ? <Presentation size={28} /> : doc.type === "report" ? <FileSpreadsheet size={28} /> : <FileText size={28} />}
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 overflow-hidden">
                      <h3 className="font-bold text-gray-900 truncate group-hover:text-violet-600 transition">{doc.title}</h3>
                      <p className="mt-1 text-xs text-gray-500">
                        {new Date(doc.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleToggleFavorite(e, doc._id, doc.isFavorite)}
                      className={`rounded-full p-1.5 transition ${doc.isFavorite ? "text-amber-400 hover:bg-amber-50" : "text-gray-300 opacity-0 group-hover:opacity-100 hover:bg-gray-100 hover:text-gray-500"}`}
                    >
                      <Star size={16} fill={doc.isFavorite ? "currentColor" : "none"} />
                    </button>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="rounded-md bg-gray-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                        {doc.type}
                      </span>
                      {/* WORKSPACE BADGE — FIXED with Tailwind gradient */}
                      {doc.workspaceId && doc.workspaceId.name && (
                        <span
                          className={`flex items-center gap-1 rounded-md bg-gradient-to-r ${doc.workspaceId.color || "from-violet-600 to-fuchsia-600"} px-2 py-1 text-[10px] font-bold text-white truncate max-w-[120px] shadow-sm`}
                          title={`In workspace: ${doc.workspaceId.name}`}
                        >
                          <FolderKanban size={10} />
                          <span className="truncate">{doc.workspaceId.name}</span>
                        </span>
                      )}
                    </div>
                    <button onClick={(e) => handleTrash(e, doc._id)} className="rounded-md p-1.5 text-gray-400 opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* LIST VIEW */}
      {filteredDocs.length > 0 && viewMode === "list" && (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <AnimatePresence>
            {filteredDocs.map((doc, i) => (
              <motion.div
                key={doc._id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => navigate(doc.type === "presentation" ? `/presentation/${doc._id}` : `/doc/${doc._id}`)}
                className="group flex cursor-pointer items-center justify-between border-b border-gray-100 p-4 last:border-0 transition hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${doc.type === "presentation" ? "bg-pink-50 text-pink-600" : doc.type === "report" ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"}`}>
                    {doc.type === "presentation" ? <Presentation size={18} /> : doc.type === "report" ? <FileSpreadsheet size={18} /> : <FileText size={18} />}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 group-hover:text-violet-600">{doc.title}</h3>
                    <p className="text-xs text-gray-500">{new Date(doc.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {/* WORKSPACE BADGE — FIXED with Tailwind gradient */}
                  {doc.workspaceId && doc.workspaceId.name && (
                    <span
                      className={`hidden items-center gap-1 rounded-md bg-gradient-to-r ${doc.workspaceId.color || "from-violet-600 to-fuchsia-600"} px-2 py-1 text-[10px] font-bold text-white sm:flex shadow-sm`}
                    >
                      <FolderKanban size={10} />
                      {doc.workspaceId.name}
                    </span>
                  )}
                  <span className="hidden rounded-md bg-gray-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-500 sm:inline-block">{doc.type}</span>
                  <button onClick={(e) => handleToggleFavorite(e, doc._id, doc.isFavorite)} className={`rounded-full p-2 transition ${doc.isFavorite ? "text-amber-400" : "text-gray-300 opacity-0 group-hover:opacity-100 hover:text-amber-400"}`}>
                    <Star size={16} fill={doc.isFavorite ? "currentColor" : "none"} />
                  </button>
                  <button onClick={(e) => handleTrash(e, doc._id)} className="rounded-full p-2 text-gray-400 opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100">
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* CREATE MODAL */}
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
              <div className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute -top-32 -left-32 h-80 w-80 rounded-full bg-violet-300/20 blur-3xl" />
                <div className="absolute top-32 right-0 h-80 w-80 rounded-full bg-emerald-300/20 blur-3xl" />
                <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-blue-300/20 blur-3xl" />
              </div>

              <div className="mb-8 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 shadow-sm">
                  <Sparkles size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold tracking-tight text-[#202020]">Create Something New</h3>
                  <p className="text-sm text-gray-600">
                    {activeWorkspace ? `Creating in ${activeWorkspace.name}` : "Choose a format and start creating."}
                  </p>
                </div>
              </div>

              <form onSubmit={handleCreate} className="space-y-6">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-700">Document Title</label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Project Proposal, Q3 Strategy, Team Notes"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition-colors placeholder:text-slate-400 focus:ring-4 focus:border-violet-500 focus:ring-violet-500/15"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-700">Choose a Format</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: "document", label: "Document", icon: FileText, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-500" },
                      { id: "report", label: "Report", icon: FileSpreadsheet, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-500" },
                      { id: "presentation", label: "Deck", icon: Presentation, color: "text-pink-600", bg: "bg-pink-50", border: "border-pink-500" },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setNewType(t.id)}
                        className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-4 text-sm font-bold transition ${
                          newType === t.id
                            ? `${t.border} ${t.bg} ${t.color} shadow-sm`
                            : "border-gray-100 bg-white text-gray-500 hover:border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <t.icon size={22} />
                        {t.label}
                      </button>
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
                    {creating ? <Loader2 size={16} className="animate-spin" /> : "Create Document"}
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