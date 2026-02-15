import React, { useState, useRef, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import {
  Bell,
  Search,
  LogOut,
  Menu,
  User,
  Settings,
  Shield,
} from "lucide-react";
import toast from "react-hot-toast";

const LogoutConfirmationModal = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-red-100 transform transition-all">
        <div className="bg-red-800 p-5 border-b border-red-900/10 flex items-center space-x-3">
          <LogOut className="w-6 h-6 text-white flex-shrink-0" />
          <h3 className="text-lg font-extrabold italic tracking-tight text-white uppercase">
            Confirm Logout
          </h3>
        </div>

        <div className="p-6">
          <p className="text-gray-600 font-medium leading-relaxed">
            Are you sure you want to sign out? You will need to log in again to access the dashboard.
          </p>
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 transition uppercase tracking-[0.15em]"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 text-sm font-extrabold text-white bg-red-800 rounded-xl shadow-lg shadow-red-900/20 hover:bg-red-900 transition active:scale-95 uppercase tracking-wider"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Layout() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const profileRef = useRef(null);
  const navigate = useNavigate();

  const routeTitle = (() => {
    if (location.pathname === "/" || location.pathname === "/dashboard") return "Dashboard";
    const path = location.pathname.split('/').pop();
    if (!path) return "Dashboard";
    return path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');
  })();

  const confirmLogout = () => {
    localStorage.removeItem("auth");
    toast.success("Logout successful!");
    setTimeout(() => {
      navigate("/login", { replace: true });
    }, 800);
  };

  const handleLogoutClick = () => setIsLogoutModalOpen(true);

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setIsProfileOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans selection:bg-red-100 selection:text-red-900">
      {/* Sidebar Section */}
      <div className={`fixed inset-y-0 left-0 z-50 ${isMobileMenuOpen ? 'block' : 'hidden'} lg:relative lg:block`}>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
        )}
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed((prev) => !prev)}
          onLinkClick={() => setIsMobileMenuOpen(false)}
        />
      </div>

      <div className="flex flex-col flex-1 min-w-0">
        {/* Header Section */}
        <header className="sticky top-0 z-50 flex items-center justify-between h-16 px-6 bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100">
          <div className="flex items-center space-x-4">
            <button
              aria-label="Open sidebar menu"
              className="lg:hidden p-2 text-red-800 hover:bg-red-50 rounded-lg transition
             focus:outline-none focus:ring-2 focus:ring-red-500"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-extrabold tracking-tighter text-gray-800 italic uppercase">
              {routeTitle}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Quick search..."
                className="pl-10 pr-4 py-2 w-56 rounded-xl bg-gray-100/50 text-sm font-semibold border border-transparent focus:bg-white focus:ring-2 focus:ring-red-800/10 focus:border-red-800 transition-all outline-none"
              />
            </div>

            <button className="relative p-2 rounded-full text-gray-400 hover:bg-red-50 hover:text-red-800 transition hidden">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 inline-block w-2 h-2 bg-red-600 rounded-full" />
            </button>

            <div className="w-px h-6 bg-gray-200"></div>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                title="View Profile"
                aria-expanded={isProfileOpen}
                className="flex items-center justify-center h-10 w-10 
             rounded-full bg-red-50 text-red-800 font-extrabold 
             border border-amber-500 shadow-sm hover:scale-105 
             transition-all focus:outline-none focus:ring-2 focus:ring-red-500"
                onClick={() => setIsProfileOpen(prev => !prev)}
              >
                <User className="w-5 h-5" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transform origin-top-right z-[99999]">
                  <div className="p-4 flex items-center space-x-3 border-b border-gray-100 bg-gradient-to-br from-red-800 to-red-900">
                    <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center text-amber-400 backdrop-blur-sm">
                      <User className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-extrabold text-white italic tracking-wide">
                        TONY STARK
                      </span>
                      <span className="text-[10px] text-red-100 flex items-center font-bold uppercase tracking-[0.2em]">
                        <Shield className="w-3 h-3 mr-1 text-amber-500" />
                        Administrator
                      </span>
                    </div>
                  </div>

                  <div className="p-2 hidden">
                    <a
                      href="/profile"
                      className="flex items-center space-x-3 p-3 text-sm font-bold text-gray-700 rounded-xl hover:bg-red-50 hover:text-red-800 transition"
                      onClick={(e) => {
                        e.preventDefault();
                        setIsProfileOpen(false);
                      }}
                    >
                      <Settings className="w-4 h-4" />
                      <span>Profile Settings</span>
                    </a>
                  </div>
                </div>
              )}
            </div>

            <button
              title="Logout"
              className="p-2 rounded-full text-gray-400 hover:bg-red-50 hover:text-red-600 transition focus:outline-none focus:ring-2 focus:ring-red-500"
              onClick={handleLogoutClick}
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 bg-[#f8fafc]">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      <LogoutConfirmationModal
        isOpen={isLogoutModalOpen}
        onConfirm={confirmLogout}
        onCancel={() => setIsLogoutModalOpen(false)}
      />
    </div>
  );
}