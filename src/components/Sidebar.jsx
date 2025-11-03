import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    Truck,
    Calendar,
    Users,
    MapPin,
    Building2,
    BarChart3,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Delivery", path: "/delivery", icon: Truck },
    { name: "Calendar", path: "/calendar", icon: Calendar },
    { name: "Partners", path: "/partners", icon: Users },
    { name: "Hubs", path: "/hubs", icon: Building2 },
    { name: "Locations", path: "/locations", icon: MapPin },
    { name: "Reports", path: "/reports", icon: BarChart3 },
];

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();

    return (
        <aside
            className={`${collapsed ? "w-20" : "w-64"
                } bg-white border-r border-gray-200 flex flex-col transition-all duration-300 shadow-sm`}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h1
                    className={`font-extrabold text-xl tracking-wide text-[#b91c1c] transition-all duration-300 ${collapsed ? "opacity-0 w-0" : "opacity-100"
                        }`}
                >
                    IRONMAN
                </h1>
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="text-[#b91c1c] hover:text-[#fbbf24] transition"
                >
                    {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>
            </div>

            {/* Menu */}
            <nav className="flex-1 p-3 space-y-1">
                {menuItems.map(({ name, path, icon: Icon }) => {
                    const active = location.pathname === path;
                    return (
                        <Link
                            key={path}
                            to={path}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${active
                                    ? "bg-[#b91c1c]/10 text-[#b91c1c] border-l-4 border-[#b91c1c]"
                                    : "text-gray-700 hover:bg-[#b91c1c]/5 hover:text-[#b91c1c]"
                                }`}
                        >
                            <Icon size={18} />
                            {!collapsed && <span>{name}</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 text-xs text-gray-500 border-t border-gray-200">
                {!collapsed ? "© 2025 IronMan Systems" : "©"}
            </div>
        </aside>
    );
}
