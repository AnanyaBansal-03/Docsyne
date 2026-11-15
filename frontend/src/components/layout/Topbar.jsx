// src/components/layout/Topbar.jsx
import { useState, useEffect, useRef } from "react";
import { Search, Bell, Check } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import API from "../../api/axios";
import { connectSocket } from "../../api/socket";

export default function Topbar() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await API.get("/me/notifications");
        setNotifications(res.data);
      } catch (error) {
        console.error("Failed to fetch notifications", error);
      }
    };
    fetchNotifications();

    // 🆕 Listen to Socket.IO for live notifications
    const socket = connectSocket();
    socket.on("new-notification", (notification) => {
      console.log("🔔 Real-time notification received:", notification);
      setNotifications((prev) => [notification, ...prev]);
    });

    // Fallback: poll every 15s (in case socket fails)
    const interval = setInterval(fetchNotifications, 15000);

    return () => {
      socket.off("new-notification");
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    if (window.location.pathname === "/dashboard") {
      if (value.trim()) navigate(`/dashboard?search=${encodeURIComponent(value)}`);
      else navigate("/dashboard");
    } else {
      if (value.trim()) navigate(`/documents?search=${encodeURIComponent(value)}`);
      else navigate("/documents");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await API.patch("/me/notifications/read");
      setNotifications(notifications.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error(error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="relative z-50 flex h-16 shrink-0 items-center justify-between rounded-2xl border border-white/60 bg-white/60 px-6 shadow-sm backdrop-blur-xl">
      <div className="relative w-96 max-w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          value={search}
          onChange={handleSearchChange}
          placeholder="Search documents..."
          className="w-full rounded-xl border border-gray-200/60 bg-white/50 py-2 pl-9 pr-4 text-sm outline-none transition focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-500/10"
        />
      </div>

      <div className="flex items-center gap-4">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-xl border border-gray-200/60 bg-white/50 p-2 text-gray-500 transition hover:bg-white hover:text-violet-600"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full z-[999] mt-2 w-80 rounded-xl border border-gray-100 bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="flex items-center gap-1 text-[10px] font-semibold text-violet-600 hover:underline"
                  >
                    <Check size={10} /> Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto p-2">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-gray-500">No notifications yet</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      className={`mb-1 rounded-lg p-3 ${n.read ? "bg-white" : "bg-violet-50"}`}
                    >
                      <p className="text-xs text-gray-700">{n.message}</p>
                      <p className="mt-1 text-[10px] text-gray-400">
                        {new Date(n.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

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