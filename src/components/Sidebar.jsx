import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
    Truck,
    Users,
    Building2,
    BarChart3,
    ChevronLeft,
    ChevronRight,
    Home,
} from "lucide-react";

// IronMan Palette Constants
// const IRON_RED = "#991B1B";
// const IRON_GOLD = "#F59E0B";

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
                bg-white border-r border-gray-200 flex flex-col transition-all duration-300 shadow-2xl flex-shrink-0 z-50 font-sans`}
        >
            {/* Header: Logo and Toggle */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 h-16">
                {!isCollapsed && (
                    <h1 className="font-extrabold text-2xl tracking-tighter text-red-800 italic uppercase">
                        IRON<span className="text-amber-500">MAN</span>
                    </h1>
                )}

                <button
                    type="button"
                    onClick={toggleSidebar}
                    className={`p-2 rounded-xl transition-all ${isCollapsed ? 'mx-auto' : ''} 
        text-red-800 hover:bg-red-50 
        focus:outline-none focus:ring-2 focus:ring-red-500 
        border border-transparent hover:border-red-100`}
                >
                    {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>

            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto mt-4">
                {menuItems.map(({ name, path, icon: Icon }) => {
                    const active =
                        location.pathname === path ||
                        location.pathname.startsWith(`${path}/`);
                    return (
                        <Link
                            title={isCollapsed ? name : undefined}
                            key={path}
                            to={path}
                            onClick={handleLinkClick}
                            className={`group flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-4 px-4'} py-3 
                                        rounded-xl text-sm font-extrabold transition-all duration-200 
                                        ${active
                                    ? "bg-red-800 text-white shadow-lg shadow-red-900/30"
                                    : "text-gray-500 hover:bg-red-50 hover:text-red-800"
                                }`}
                        >
                            <Icon
                                size={18}
                                className={`${active ? 'text-amber-400' : 'text-gray-400 group-hover:text-red-800'} transition-colors`}
                                strokeWidth={active ? 2.5 : 2}
                            />

                            {!isCollapsed && (
                                <span className={`uppercase tracking-tight ${active ? 'font-extrabold italic' : 'font-extrabold'}`}>
                                    {name}
                                </span>
                            )}

                            {/* Active Indicator Pip */}
                            {active && !isCollapsed && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 flex-shrink-0">
                {!isCollapsed ? (
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                        <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.2em] text-center">
                            © 2026 IronMan Systems
                        </p>
                    </div>
                ) : (
                    <p className="text-[10px] font-extrabold text-red-800 text-center uppercase tracking-tighter">IM</p>
                )}
            </div>
        </aside>
    );
}