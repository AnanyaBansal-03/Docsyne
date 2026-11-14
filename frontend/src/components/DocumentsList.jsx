// src/components/DocumentsList.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, Presentation, FileSpreadsheet, Star, Trash2,
  LayoutGrid, List, FolderKanban, Plus
} from "lucide-react";
import API from "../api/axios";

export default function DocumentsList({
  documents,
  onUpdate,
  emptyIcon: EmptyIcon = FileText,
  emptyTitle = "Nothing here yet",
  emptyDescription = "Create your first document to get started.",
  emptyAction,
}) {
  const [viewMode, setViewMode] = useState("grid");
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleToggleFavorite = async (e, id, currentFav) => {
    e.stopPropagation();
    try {
      const res = await API.patch(`/documents/${id}`, { isFavorite: !currentFav });
      if (onUpdate) onUpdate(id, res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleTrash = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Move to trash?")) return;
    try {
      await API.patch(`/documents/${id}`, { isTrashed: true });
      if (onUpdate) onUpdate(id, null);
    } catch (error) {
      console.error(error);
    }
  };

  // Filter + search
  const filteredDocs = documents.filter((doc) => {
    const matchesFilter = filter === "all" || doc.type === filter;
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Empty state
  if (documents.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-3xl border-2 border-dashed border-gray-200 bg-white/50 py-20">
        {/* Soft gradient background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 -left-32 h-64 w-64 rounded-full bg-violet-200/30 blur-3xl" />
          <div className="absolute -bottom-32 right-0 h-64 w-64 rounded-full bg-emerald-200/30 blur-3xl" />
        </div>

        <div className="relative flex flex-col items-center justify-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-100 to-fuchsia-100 text-violet-600 shadow-lg shadow-violet-500/10">
            <EmptyIcon size={36} />
          </div>
          <h2 className="text-xl font-bold text-gray-900">{emptyTitle}</h2>
          <p className="mb-8 mt-2 max-w-sm text-center text-sm text-gray-500">
            {emptyDescription}
          </p>
          {emptyAction && (
            <button
              onClick={emptyAction.onClick}
              className="flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition hover:-translate-y-0.5 hover:bg-violet-700"
            >
              <Plus size={16} />
              {emptyAction.label}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* TOOLBAR */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-4">
        {/* Filter tabs */}
        <div className="flex space-x-1 overflow-x-auto">
          {[
            { id: "all", label: "All" },
            { id: "document", label: "Documents" },
            { id: "report", label: "Reports" },
            { id: "presentation", label: "Decks" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold transition ${
                filter === tab.id
                  ? "bg-violet-100 text-violet-700"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search + View toggle */}
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-48 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/10"
          />
          <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`rounded-md p-1.5 transition ${
                viewMode === "grid"
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`rounded-md p-1.5 transition ${
                viewMode === "list"
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* No results after filter */}
      {filteredDocs.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white/50 py-16">
          <p className="text-sm text-gray-500">No documents match your filter.</p>
          <button
            onClick={() => { setFilter("all"); setSearchQuery(""); }}
            className="mt-3 text-xs font-semibold text-violet-600 hover:underline"
          >
            Clear filters
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
                      {doc.workspaceId && doc.workspaceId.name && (
                        <span
                          className={`flex items-center gap-1 rounded-md bg-gradient-to-r ${doc.workspaceId.color || "from-violet-600 to-fuchsia-600"} px-2 py-1 text-[10px] font-bold text-white truncate max-w-[120px] shadow-sm`}
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
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    doc.type === "presentation" ? "bg-pink-50 text-pink-600" :
                    doc.type === "report" ? "bg-emerald-50 text-emerald-600" :
                    "bg-blue-50 text-blue-600"
                  }`}>
                    {doc.type === "presentation" ? <Presentation size={18} /> : doc.type === "report" ? <FileSpreadsheet size={18} /> : <FileText size={18} />}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 group-hover:text-violet-600">{doc.title}</h3>
                    <p className="text-xs text-gray-500">
                      {new Date(doc.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {doc.workspaceId && doc.workspaceId.name && (
                    <span className={`hidden items-center gap-1 rounded-md bg-gradient-to-r ${doc.workspaceId.color || "from-violet-600 to-fuchsia-600"} px-2 py-1 text-[10px] font-bold text-white sm:flex shadow-sm`}>
                      <FolderKanban size={10} />
                      {doc.workspaceId.name}
                    </span>
                  )}
                  <span className="hidden rounded-md bg-gray-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-500 sm:inline-block">
                    {doc.type}
                  </span>
                  <button
                    onClick={(e) => handleToggleFavorite(e, doc._id, doc.isFavorite)}
                    className={`rounded-full p-2 transition ${doc.isFavorite ? "text-amber-400" : "text-gray-300 opacity-0 group-hover:opacity-100 hover:text-amber-400"}`}
                  >
                    <Star size={16} fill={doc.isFavorite ? "currentColor" : "none"} />
                  </button>
                  <button
                    onClick={(e) => handleTrash(e, doc._id)}
                    className="rounded-full p-2 text-gray-400 opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}