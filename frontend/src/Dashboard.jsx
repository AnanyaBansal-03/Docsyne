// src/Dashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import API from "./api/axios";

const WORKSPACE_COLORS = [
  "from-violet-500 to-fuchsia-500",
  "from-blue-500 to-cyan-500",
  "from-emerald-500 to-teal-500",
  "from-orange-500 to-red-500",
  "from-pink-500 to-rose-500",
];

const ACTIVITY_USERS = [
  { name: "Riya", color: "#8b5cf6" },
  { name: "Karan", color: "#3b82f6" },
  { name: "Meera", color: "#10b981" },
  { name: "Arjun", color: "#ec4899" },
];

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [workspaces, setWorkspaces] = useState([]);
  const [activity, setActivity] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  // Auth + Load workspaces
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!token || !storedUser) {
      navigate("/login");
      return;
    }
    setUser(JSON.parse(storedUser));
    fetchWorkspaces();
    setTimeout(() => setLoading(false), 400);
  }, [navigate]);

  // Live activity simulation
  useEffect(() => {
    const actions = ["edited a document", "shared a link", "left a comment", "created a doc", "invited a teammate"];
    const docs = ["Project Q3", "Design Notes", "Roadmap", "Meeting Recap"];

    const id = setInterval(() => {
      const randomUser = ACTIVITY_USERS[Math.floor(Math.random() * ACTIVITY_USERS.length)];
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      const randomDoc = docs[Math.floor(Math.random() * docs.length)];

      setActivity((prev) => [
        {
          id: Date.now(),
          user: randomUser,
          action: randomAction,
          doc: randomDoc,
          time: "just now",
        },
        ...prev.slice(0, 4),
      ]);
    }, 4500);

    return () => clearInterval(id);
  }, []);

  const fetchWorkspaces = async () => {
    try {
      const res = await API.get("/workspaces");
      setWorkspaces(res.data);
    } catch (err) {
      console.error("Failed to load workspaces", err);
    }
  };

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await API.post("/workspaces", { name: newName });
      setWorkspaces([res.data, ...workspaces]);
      setShowModal(false);
      setNewName("");
    } catch (err) {
      alert("Failed to create workspace");
    } finally {
      setCreating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#faf9f6]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600"></div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#faf9f6] text-[#202020]">
      {/* Ambient Background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 -left-40 h-[40rem] w-[40rem] rounded-full bg-violet-300/20 blur-3xl" />
        <div className="absolute top-40 right-0 h-[30rem] w-[30rem] rounded-full bg-emerald-300/15 blur-3xl" />
      </div>

      <div className="flex h-screen">
        {/* SIDEBAR */}
        <aside className="hidden w-64 flex-col border-r border-gray-200/50 bg-white/40 p-6 backdrop-blur-xl md:flex">
          <Link to="/" className="mb-10 flex items-center gap-2.5 text-xl font-bold tracking-tight">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-md">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            </div>
            Docsyne
          </Link>

          <nav className="flex-1 space-y-1">
            {[
              { icon: "🏠", label: "Home", active: true },
              { icon: "👥", label: "Shared with me" },
              { icon: "⭐", label: "Starred" },
              { icon: "🗑️", label: "Trash" },
            ].map((item, i) => (
              <button key={i} className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${item.active ? "bg-violet-100/80 text-violet-700 shadow-sm" : "text-gray-500 hover:bg-white hover:text-gray-900 hover:shadow-sm"}`}>
                <span className="text-base opacity-80">{item.icon}</span> {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-auto rounded-xl border border-gray-200/60 bg-white/60 p-3.5 shadow-sm backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-semibold text-white shadow-sm">
                {user?.name[0].toUpperCase()}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-semibold text-gray-800">{user?.name}</p>
                <p className="truncate text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-gray-50 py-2 text-xs font-semibold text-gray-600 transition hover:bg-red-50 hover:text-red-600">
              Logout
            </button>
          </div>
        </aside>

        {/* MAIN */}
        <main className="flex-1 overflow-y-auto">
          <header className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-200/50 bg-[#faf9f6]/70 px-8 py-3.5 backdrop-blur-md">
            <div className="relative w-80 max-w-full">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input type="text" placeholder="Search workspaces, docs..." className="w-full rounded-lg border border-gray-200/80 bg-white/60 py-2 pl-9 pr-4 text-sm outline-none transition focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-500/10" />
            </div>
            <motion.button
              onClick={() => setShowModal(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-1.5 rounded-lg bg-gray-900 px-3.5 py-2 text-sm font-medium text-white shadow-md transition hover:bg-gray-800"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              New Workspace
            </motion.button>
          </header>

          <div className="mx-auto max-w-6xl px-8 py-8">
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              
              {/* Greeting */}
              <div className="mb-8">
                <h1 className="text-2xl font-semibold tracking-tight text-gray-800">
                  {getGreeting()}, <span className="text-violet-600">{user?.name.split(" ")[0]}</span> 👋
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Here is a quick overview of your workspace today.
                </p>
              </div>

              {/* --- YOUR WORKSPACES SECTION --- */}
              <section className="mb-10">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                    Your Workspaces ({workspaces.length})
                  </h2>
                  <button onClick={() => setShowModal(true)} className="text-xs font-medium text-violet-600 hover:underline">
                    + New
                  </button>
                </div>

                {/* Grid: Shows workspace cards + the create card */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {workspaces.map((ws, i) => (
                    <motion.div
                      key={ws._id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ y: -4 }}
                      onClick={() => navigate(`/workspace/${ws._id}`)}
                      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-gray-100 bg-white/80 p-5 shadow-sm backdrop-blur transition hover:shadow-xl hover:shadow-violet-500/10"
                    >
                      <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${WORKSPACE_COLORS[i % WORKSPACE_COLORS.length]} text-white shadow-lg`}>
                        <span className="text-xl font-bold">{ws.name[0].toUpperCase()}</span>
                      </div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-violet-600 transition">
                        {ws.name}
                      </h3>
                      <p className="mt-1 text-xs text-gray-500">
                        Created {new Date(ws.createdAt).toLocaleDateString()}
                      </p>
                      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                        <div className="flex -space-x-1.5">
                          <div className="h-6 w-6 rounded-full border-2 border-white bg-violet-500" />
                          <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-[10px] font-bold text-gray-600">
                            +{ws.members?.length || 1}
                          </div>
                        </div>
                        <span className="text-xs font-medium text-violet-600 opacity-0 transition group-hover:opacity-100">
                          Open →
                        </span>
                      </div>
                    </motion.div>
                  ))}

                  {/* Create Workspace Card */}
                  <motion.div
                    whileHover={{ y: -4 }}
                    onClick={() => setShowModal(true)}
                    className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-transparent p-5 transition hover:border-violet-400 hover:bg-violet-50/30"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </div>
                    <p className="mt-3 text-sm font-semibold text-gray-500">Create Workspace</p>
                    <p className="mt-1 text-xs text-gray-400">Start collaborating</p>
                  </motion.div>
                </div>
              </section>

              {/* Stats Grid */}
              <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
                {[
                  { label: "Total Documents", val: "12", trend: "+2", color: "text-violet-600", icon: "📄", bg: "bg-violet-50" },
                  { label: "Shared with me", val: "4", trend: "+1", color: "text-blue-600", icon: "👥", bg: "bg-blue-50" },
                  { label: "Live Editors", val: "2", trend: "Online", color: "text-emerald-600", icon: "🟢", bg: "bg-emerald-50" },
                ].map((s, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, y: 15 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: i * 0.08 }}
                    className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white/80 p-5 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-gray-500">{s.label}</p>
                        <p className={`mt-1 text-2xl font-bold ${s.color}`}>{s.val}</p>
                      </div>
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${s.bg} text-lg`}>
                        {s.icon}
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-1 text-xs font-medium text-gray-400">
                      <span className="text-emerald-500">↑</span> {s.trend} this week
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* --- SPLIT LAYOUT: RECENT DOCS & LIVE ACTIVITY --- */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                
                {/* 1. Recent Documents List (Takes 2 columns) */}
                <div className="lg:col-span-2 rounded-xl border border-gray-100 bg-white/80 shadow-sm backdrop-blur">
                  <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                    <h2 className="text-sm font-semibold text-gray-800">Recent Documents</h2>
                    <button className="text-xs font-medium text-violet-600 hover:underline">View all</button>
                  </div>
                  
                  <div className="p-2">
                    {[
                      { title: "Project Proposal Q3", updated: "2 mins ago", type: "Doc", users: ["#8b5cf6", "#3b82f6"] },
                      { title: "Meeting Notes - Design", updated: "1 hour ago", type: "Doc", users: ["#10b981"] },
                      { title: "Marketing Strategy", updated: "Yesterday", type: "Sheet", users: ["#ec4899", "#f59e0b"] },
                      { title: "App Architecture Draft", updated: "2 days ago", type: "Doc", users: ["#8b5cf6"] },
                    ].map((doc, i) => (
                      <motion.div 
                        key={i} 
                        initial={{ opacity: 0, x: -10 }} 
                        animate={{ opacity: 1, x: 0 }} 
                        transition={{ delay: 0.2 + (i * 0.05) }}
                        className="group flex cursor-pointer items-center justify-between rounded-lg p-3 transition hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`flex h-9 w-9 items-center justify-center rounded-lg text-base ${doc.type === "Doc" ? "bg-blue-50/80 text-blue-500" : "bg-emerald-50/80 text-emerald-500"}`}>
                            {doc.type === "Doc" ? "📄" : "📊"}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800 group-hover:text-violet-600 transition">{doc.title}</p>
                            <p className="text-xs text-gray-400">Edited {doc.updated}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-5">
                          <div className="hidden -space-x-1.5 sm:flex">
                            {doc.users.map((color, idx) => (
                              <div key={idx} className="h-6 w-6 rounded-full border-2 border-white shadow-sm" style={{ background: color }} />
                            ))}
                          </div>
                          <span className="text-xs font-medium text-gray-400 opacity-0 transition group-hover:opacity-100 group-hover:text-violet-600">Open →</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* 2. Live Activity Feed (Takes 1 column) */}
                <div className="lg:col-span-1 rounded-xl border border-gray-100 bg-white/80 shadow-sm backdrop-blur">
                  <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                    <h2 className="text-sm font-semibold text-gray-800">Live Activity</h2>
                    <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-600">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500"></span> Live
                    </span>
                  </div>
                  
                  <div className="p-5 space-y-4 min-h-[280px]">
                    <AnimatePresence initial={false}>
                      {activity.map((a) => (
                        <motion.div
                          key={a.id}
                          initial={{ opacity: 0, x: -10, height: 0 }}
                          animate={{ opacity: 1, x: 0, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="flex items-start gap-3"
                        >
                          <div
                            className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white shadow-sm"
                            style={{ background: a.user.color }}
                          >
                            {a.user.name[0]}
                          </div>
                          <div className="text-xs leading-relaxed">
                            <span className="font-semibold text-gray-800">{a.user.name}</span>{" "}
                            <span className="text-gray-500">{a.action}</span>{" "}
                            <span className="font-medium text-violet-600">{a.doc}</span>
                            <p className="text-[10px] text-gray-400 mt-0.5">{a.time}</p>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {activity.length === 0 && (
                      <div className="flex h-full flex-col items-center justify-center text-center text-gray-400">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-violet-500 mb-2"></div>
                        <p className="text-xs">Waiting for team activity...</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        </main>
      </div>

      {/* CREATE WORKSPACE MODAL */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl border border-white/60 bg-white p-8 shadow-2xl"
            >
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900">Create a workspace</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Give your team a space to collaborate on documents.
                </p>
              </div>
              <form onSubmit={handleCreateWorkspace}>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700">Workspace Name</label>
                <input
                  type="text"
                  autoFocus
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g., Engineering, Design Team, Marketing"
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                />
                <div className="mt-6 flex gap-3">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 rounded-xl border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50">
                    Cancel
                  </button>
                  <button type="submit" disabled={creating} className="flex-1 rounded-xl bg-violet-600 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/30 transition hover:bg-violet-700 disabled:opacity-50">
                    {creating ? "Creating..." : "Create"}
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