// src/pages/Dashboard.jsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, FileText, Presentation, FileSpreadsheet, ArrowRight, Loader2, FolderKanban } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import API from "../api/axios";

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const navigate = useNavigate();
  const [recentDocs, setRecentDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const res = await API.get("/documents");
        setRecentDocs(res.data.slice(0, 10));
      } catch (error) {
        console.error("Failed to load recent docs", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecent();
  }, []);

  const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";  // afternoon ends at 5 PM
  return "Good evening";                    // evening starts at 5 PM
};

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "short", day: "numeric",
  });

  // 🆕 Filter by search query
  const filteredDocs = recentDocs.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-5xl p-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            {getGreeting()}, <span className="text-violet-600">{user.name?.split(" ")[0] || "User"}</span> 👋
          </h1>
          <p className="mt-1 text-sm font-medium text-gray-500">
            {today} · What are we creating today?
          </p>
        </div>
        <motion.button whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }} onClick={() => navigate("/documents")} className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition hover:bg-violet-700">
          <Plus size={16} /> Create new
        </motion.button>
      </div>

      {/* Spotlight Banner */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="relative mb-10 overflow-hidden rounded-3xl border border-white/60 bg-[#faf9f6] p-8 shadow-xl">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-violet-300/30 blur-3xl" />
          <div className="absolute top-40 right-0 h-96 w-96 rounded-full bg-emerald-300/30 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-blue-300/30 blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-white/70 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-violet-700 backdrop-blur">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-600"></span>
              Spotlight
            </span>
            <h2 className="mt-4 text-3xl font-bold leading-tight text-gray-900 md:text-4xl">
              Pick up where you<br />left off, {user.name?.split(" ")[0]}.
            </h2>
            <p className="mt-3 max-w-md text-sm font-medium text-gray-600">
              Your team has been busy. Jump into the latest document and keep the momentum going.
            </p>
          </div>
          <div className="w-full shrink-0 rounded-xl border border-gray-200 bg-white/80 p-3 shadow-md backdrop-blur-sm md:w-72">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <div className="flex gap-1">
                <div className="h-2 w-2 rounded-full bg-gray-300" />
                <div className="h-2 w-2 rounded-full bg-gray-300" />
                <div className="h-2 w-2 rounded-full bg-gray-300" />
              </div>
              <span className="text-[10px] font-medium text-gray-400">project-q3.docsyne</span>
            </div>
            <p className="mt-2 text-xs font-mono text-gray-600">
              <span className="text-violet-600 font-bold"># Project Proposal</span><br />
              The new design system will focus on...
              <span className="ml-0.5 inline-block h-3 w-0.5 animate-pulse bg-violet-600 align-middle" />
            </p>
          </div>
        </div>
      </motion.div>

      {/* Create Cards */}
      <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          { icon: FileText, title: "Document", desc: "Start from scratch", color: "text-blue-600", bg: "bg-blue-50", border: "hover:border-blue-400" },
          { icon: FileSpreadsheet, title: "Report", desc: "From a template", color: "text-emerald-600", bg: "bg-emerald-50", border: "hover:border-emerald-400" },
          { icon: Presentation, title: "Presentation", desc: "Build a deck", color: "text-pink-600", bg: "bg-pink-50", border: "hover:border-pink-400" },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.button key={i} whileHover={{ y: -4 }} onClick={() => navigate("/documents")} className={`group flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm transition-all hover:shadow-xl ${item.border}`}>
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.bg} ${item.color} transition group-hover:scale-110`}>
                <Icon size={24} />
              </div>
              <div>
                <p className="font-bold text-gray-900">{item.title}</p>
                <p className="text-xs font-medium text-gray-500">{item.desc}</p>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Recent Documents */}
      <div className="rounded-3xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <h2 className="text-base font-bold text-gray-900">
            {searchQuery ? `Search Results for "${searchQuery}"` : "Recent Documents"}
          </h2>
          <button onClick={() => navigate("/documents")} className="text-xs font-bold text-violet-600 hover:text-violet-700 hover:underline">
            View all
          </button>
        </div>
        <div className="p-3">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="animate-spin text-violet-600" size={24} />
            </div>
          )}
          {!loading && filteredDocs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm text-gray-500">
                {searchQuery ? `No documents match "${searchQuery}"` : "No documents yet. Create one to get started!"}
              </p>
            </div>
          )}
          {!loading && filteredDocs.map((doc, i) => (
            <motion.div key={doc._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} onClick={() => navigate(doc.type === "presentation" ? `/presentation/${doc._id}` : `/doc/${doc._id}`)} className="group flex cursor-pointer items-center justify-between rounded-2xl p-4 transition hover:bg-gray-50">
              <div className="flex items-center gap-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg shadow-sm ${doc.type === "presentation" ? "bg-pink-50 text-pink-500" : doc.type === "report" ? "bg-emerald-50 text-emerald-500" : "bg-blue-50 text-blue-500"}`}>
                  {doc.type === "presentation" ? "📊" : doc.type === "report" ? "📈" : "📄"}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-gray-900 group-hover:text-violet-600 transition">{doc.title}</p>
                    {doc.workspaceId && doc.workspaceId.name && (
                      <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold text-white" style={{ background: doc.workspaceId.color || "#7c3aed" }} title={`In workspace: ${doc.workspaceId.name}`}>
                        <FolderKanban size={9} />
                        {doc.workspaceId.name}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-medium text-gray-500">
                    Edited {new Date(doc.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                </div>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 transition group-hover:bg-violet-100">
                <ArrowRight size={16} className="text-gray-400 transition group-hover:translate-x-0.5 group-hover:text-violet-600" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}