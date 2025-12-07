import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import { Bell, Search, Power } from "lucide-react";

export default function Layout() {
  const location = useLocation();

  // Clean page title logic
  const routeTitle = (() => {
    if (location.pathname === "/") return "Dashboard";
    const path = location.pathname.replace("/", "");
    return path.charAt(0).toUpperCase() + path.slice(1);
  })();

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#0b0f14] via-gray-900 to-black text-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-col flex-1">
        {/* Top Navbar */}
        <header className="sticky top-0 z-40 flex items-center justify-between h-14 px-6
  border-b border-gray-200
  bg-white
  shadow-sm">

          <h1 className="text-lg font-semibold tracking-wide text-gray-800">
            {routeTitle || "IronMan"}
          </h1>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-600" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-8 pr-3 py-1.5 rounded-md bg-white/90 text-sm text-gray-800 placeholder-gray-500 border border-gray-300 focus:ring-1 focus:ring-[#FFD700] focus:border-[#FFD700] outline-none"
              />
            </div>

            {/* Notifications */}
            <button className="relative p-2 text-gray-500 hover:text-gray-800 transition">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 inline-block w-2 h-2 bg-[#FF4500] rounded-full shadow-[0_0_4px_#FF4500]" />
            </button>

            {/* Power / Logout */}
            <button
              className="p-2 text-gray-400 hover:text-red-600 transition"
              onClick={() => {
                localStorage.removeItem("auth");
                window.location.href = "/login";
              }}
            >
              <Power className="h-5 w-5" />
            </button>

          </div>
        </header>


        {/* Page Container */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-100 text-gray-900 shadow-inner">
          <div className="bg-white p-6 rounded-xl shadow-md min-h-[85vh]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
