// src/components/layout/Sidebar.jsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, FileText, Users, Star, LayoutTemplate, LogOut, Settings, FolderKanban } from "lucide-react";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const links = [
    { icon: Home, label: "Overview", path: "/dashboard" },
    { icon: FolderKanban, label: "Workspaces", path: "/workspaces" }, // <-- NEW
    { icon: FileText, label: "My Documents", path: "/documents" },
    { icon: Users, label: "Shared with me", path: "/shared" },
    { icon: Star, label: "Favorites", path: "/favorites" },
    { icon: LayoutTemplate, label: "Templates", path: "/templates" },
  ];

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-gray-200/50 bg-white/40 p-4 backdrop-blur-xl">
      {/* Logo */}
      <Link to="/dashboard" className="mb-8 flex items-center gap-2.5 px-2 text-xl font-extrabold tracking-tight">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-md">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
        </div>
        Docsyne
      </Link>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path || (link.path !== "/dashboard" && location.pathname.startsWith(link.path));
          return (
            <Link
              key={link.label}
              to={link.path}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-violet-100/80 text-violet-700 shadow-sm"
                  : "text-gray-500 hover:bg-white hover:text-gray-900 hover:shadow-sm"
              }`}
            >
              <Icon size={18} className={isActive ? "text-violet-600" : "opacity-70"} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section: Settings & Logout */}
      <div className="mt-auto border-t border-gray-200/60 pt-4 space-y-1">
        <button className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-gray-500 transition hover:bg-white hover:text-gray-900 hover:shadow-sm">
          <Settings size={18} className="opacity-70" />
          Settings
        </button>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-red-500 transition hover:bg-red-50"
        >
          <LogOut size={18} className="opacity-70" />
          Logout
        </button>
      </div>
    </aside>
  );
}