// src/components/layout/Topbar.jsx
import { Search, Bell } from "lucide-react";

export default function Topbar() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <header className="flex h-16 shrink-0 items-center justify-between rounded-2xl border border-white/60 bg-white/60 px-6 shadow-sm backdrop-blur-xl">
      {/* Search */}
      <div className="relative w-96 max-w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          placeholder="Search documents..."
          className="w-full rounded-xl border border-gray-200/60 bg-white/50 py-2 pl-9 pr-4 text-sm outline-none transition focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-500/10"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        <button className="rounded-xl border border-gray-200/60 bg-white/50 p-2 text-gray-500 transition hover:bg-white hover:text-violet-600">
          <Bell size={16} />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-bold text-white shadow-sm">
            {user.name ? user.name[0].toUpperCase() : "U"}
          </div>
          <div className="hidden flex-col md:flex">
            <span className="text-sm font-semibold text-gray-800">{user.name || "User"}</span>
            <span className="text-[11px] text-gray-500">{user.email || "user@example.com"}</span>
          </div>
        </div>
      </div>
    </header>
  );
}