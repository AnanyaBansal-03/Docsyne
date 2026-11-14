// src/components/layout/DashboardLayout.jsx
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function DashboardLayout() {
  return (
    <div className="relative flex h-screen overflow-hidden bg-[#faf9f6] font-sans text-[#202020] antialiased p-4 gap-4">
      {/* Soft Background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 -left-40 h-[40rem] w-[40rem] rounded-full bg-violet-300/20 blur-3xl" />
        <div className="absolute top-40 right-0 h-[30rem] w-[30rem] rounded-full bg-emerald-300/15 blur-3xl" />
      </div>

      {/* Floating Sidebar */}
      <div className="hidden h-full md:block">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden gap-4">
        {/* Floating Topbar */}
        <Topbar />
        
        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto rounded-3xl">
          <Outlet />
        </main>
      </div>
    </div>
  );
}