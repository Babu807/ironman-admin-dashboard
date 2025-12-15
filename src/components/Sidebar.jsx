import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    Truck,
    Users,
    Building2,
    BarChart3,
    ChevronLeft,
    ChevronRight,
    Home,
} from "lucide-react";

const BRAND_COLOR = "#06B6D4";

const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: Home },
    { name: "Delivery", path: "/delivery", icon: Truck },
    { name: "Partners", path: "/partners", icon: Users },
    { name: "Hubs", path: "/hubs", icon: Building2 },
    { name: "Reports", path: "/reports", icon: BarChart3 },
];

export default function Sidebar({ collapsed, onToggle, onLinkClick }) {
    const location = useLocation();

    const isCollapsed = collapsed !== undefined ? collapsed : false;
    const toggleSidebar = onToggle || (() => { });
    const handleLinkClick = onLinkClick || (() => { });


    return (
        <aside
            className={`h-full relative ${isCollapsed ? "w-20" : "w-64"} 
                bg-white border-r border-gray-200 flex flex-col transition-all duration-300 shadow-xl flex-shrink-0 z-50`}
        >
            {/* Header: Logo/Title and Collapse Toggle */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 h-16">
                {!isCollapsed && (
                    <h1 className="font-extrabold text-2xl tracking-wide text-cyan-600">
                        IRONMAN
                    </h1>
                )}

                <button
                    type="button"
                    onClick={toggleSidebar}
                    className={`p-2 rounded-full transition ${isCollapsed ? 'ml-auto' : ''} 
                        text-cyan-600 hover:bg-cyan-50 focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                    title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                    {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>
            </div>

            {/* Menu */}
            <nav className="flex-1 p-3 space-y-2 overflow-y-auto">
                {menuItems.map(({ name, path, icon: Icon }) => {
                    const active = location.pathname === path;
                    return (
                        <Link
                            key={path}
                            to={path}
                            onClick={handleLinkClick}
                            className={`group flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2 
                                        rounded-xl text-sm font-medium transition-all duration-300 
                                        ${active
                                    ? "bg-cyan-600 text-white shadow-md"
                                    : "text-gray-700 hover:bg-cyan-50 hover:text-cyan-600"
                                }`}
                        >
                            <Icon size={18} className={`${active ? 'text-white' : 'text-gray-500 group-hover:text-cyan-600'}`} />

                            {!isCollapsed && (
                                <span className={`${isCollapsed ? 'hidden' : 'block'}`}>{name}</span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 text-xs text-gray-500 border-t border-gray-100 text-center flex-shrink-0">
                {!isCollapsed ? "© 2025 IronMan Systems" : "©"}
            </div>
        </aside>
    );
}