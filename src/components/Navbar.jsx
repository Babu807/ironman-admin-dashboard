import React from "react";
import { Bell, Search, Power } from "lucide-react";

export default function Navbar({ title = "Dashboard" }) {
    return (
        <header className="sticky top-0 z-40 flex items-center justify-between h-14 px-6 border-b border-[#3a0a0a] bg-gradient-to-r from-[#8B0000] via-[#B22222] to-[#A0522D] shadow-[0_2px_10px_rgba(255,215,0,0.25)]">
            {/* Left side - Page title */}
            <div className="flex items-center gap-3">
                <h1 className="text-lg font-display text-[#FFD700] tracking-wide drop-shadow-[0_0_4px_rgba(255,215,0,0.4)]">
                    {title}
                </h1>
                <span className="text-sm text-gray-300 font-medium">Super Admin</span>
            </div>

            {/* Right side - Quick actions */}
            <div className="flex items-center gap-4">
                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-300" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="pl-8 pr-3 py-1.5 rounded-md bg-[#1e1e1e]/70 text-sm text-gray-200 placeholder-gray-500 border border-[#4b0000] focus:ring-1 focus:ring-[#FFD700] focus:border-[#FFD700] outline-none"
                    />
                </div>

                {/* Notifications */}
                <button className="relative p-2 hover:text-[#FFD700] transition">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1 right-1 inline-block w-2 h-2 bg-[#FF4500] rounded-full shadow-[0_0_4px_#FF4500]" />
                </button>

                {/* Power / Logout */}
                <button className="p-2 text-gray-400 hover:text-[#FF6347] transition">
                    <Power className="h-5 w-5" />
                </button>
            </div>
        </header>
    );
}
