import React, { useEffect, useState, useCallback } from "react";
import { Switch } from "@headlessui/react";
import toast from "react-hot-toast";
import { ChevronLeft, ChevronRight, AlertTriangle, Check, UserCog, Loader2, Search } from "lucide-react";

// --- Theme Constants ---
const IRON_RED = "bg-red-800";
const IRON_TEXT = "text-red-800";

const ModernSpinner = () => (
  <div className="flex flex-col justify-center items-center py-24 space-y-4">
    <div className="w-12 h-12 border-4 border-red-800 border-t-amber-500 rounded-full animate-spin shadow-lg" />
    <p className="text-[10px] font-black text-red-800 uppercase tracking-widest animate-pulse">Looking for Hub Admins...</p>
  </div>
);

// --- Confirmation Modal Component ---
const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText, confirmClass, isConfirming }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md transform transition-all border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex items-center">
          <div className="p-3 bg-amber-50 rounded-xl mr-4">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
          </div>
          <h3 className="text-xl font-black text-gray-900 italic uppercase tracking-tighter">{title}</h3>
        </div>

        <div className="p-8">
          <p className="text-gray-600 font-medium mb-8 leading-relaxed">{message}</p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={onCancel}
              disabled={isConfirming}
              className="px-6 py-3 text-xs font-black uppercase italic tracking-widest rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isConfirming}
              className={`px-6 py-3 text-xs font-black uppercase italic tracking-widest rounded-xl text-white shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center disabled:opacity-70 ${confirmClass}`}
            >
              {isConfirming ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const HubAdmins = () => {
  const [admins, setAdmins] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [search, setSearch] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);

  const [modal, setModal] = useState({ isOpen: false, user: null, newStatus: null });

  const LIMIT = 10;

  const loadAdmins = useCallback(async () => {
    const token = localStorage.getItem("token");
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/crm/users/hub-admins?search=${encodeURIComponent(search)}&page=${page}&limit=${LIMIT}`,
        { method: "GET", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );
      if (res.status === 403) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }
      const data = await res.json();
      if (data?.status && Array.isArray(data.data)) {
        setAdmins(data.data);
        setPagination(data.pagination || { totalPages: 0, total: 0 });
      } else {
        setAdmins([]);
        setPagination({});
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    const timer = setTimeout(() => { loadAdmins(); }, 400);
    return () => clearTimeout(timer);
  }, [page, search, loadAdmins]);

  const updateUserStatus = async (userId, status) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/crm/users/update/userstatus`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ status, id: userId }),
    });
    return res.json();
  };

  const handleStatusChange = (user, checked) => {
    setModal({ isOpen: true, user, newStatus: checked ? "active" : "inactive" });
  };

  const handleConfirmStatusUpdate = async () => {
    const { user, newStatus } = modal;
    const oldStatus = user.status;
    setIsConfirming(true);
    setAdmins((prev) => prev.map((u) => u.id === user.id ? { ...u, status: newStatus } : u));
    setUpdatingId(user.id);
    setModal({ isOpen: false, user: null, newStatus: null });

    try {
      const res = await updateUserStatus(user.id, newStatus);
      if (!res?.status) throw new Error();
      toast.success(`User ${newStatus} successfully`);
    } catch {
      setAdmins((prev) => prev.map((u) => u.id === user.id ? { ...u, status: oldStatus } : u));
      toast.error("Failed to update user status");
    } finally {
      setUpdatingId(null);
      setIsConfirming(false);
    }
  };

  const StatusBadge = ({ status }) => (
    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase italic tracking-widest border
      ${status === "active" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-700 border-red-100"}`}>
      {status === "active" ? "Active" : "Inactive"}
    </span>
  );
  const totalItems = pagination.totalItems ?? pagination.total ?? 0;

  return (
    <div className="p-4 sm:p-6 lg:p-10 bg-[#F9FAFB] min-h-screen">
      <ConfirmationModal
        isOpen={modal.isOpen}
        title={modal.newStatus === 'active' ? 'Activate Hub Administrator' : 'Deactivate Hub Administrator'}
        message={modal.user ? `Are you sure you want to change the status of ${modal.user.name}?` : ''}
        onConfirm={handleConfirmStatusUpdate}
        onCancel={() => {
          setIsConfirming(false);
          setModal({ isOpen: false, user: null, newStatus: null });
        }}
        confirmText={modal.newStatus === 'active' ? 'Yes, Activate' : 'Yes, Deactivate'}
        confirmClass={modal.newStatus === 'active' ? 'bg-emerald-600' : 'bg-red-800'}
        isConfirming={isConfirming}
      />

      {/* HEADER SECTION */}
      <div className="mb-12">
        <h1 className="text-4xl font-black text-gray-900 tracking-tighter italic uppercase">
          Hub Administrators Management
        </h1>
        <p className="text-gray-500 text-sm font-bold uppercase tracking-widest mt-1">
          Monitor and manage administrative access across all hubs
        </p>
      </div>

      {/* FILTER PANEL */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 mb-8 flex items-center">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-12 pr-6 py-4 w-full rounded-2xl bg-gray-50 text-sm font-bold text-gray-800 placeholder-gray-400 border border-gray-100 focus:ring-2 focus:ring-red-800 focus:bg-white transition-all outline-none"
          />
        </div>
      </div>

      {loading ? (
        <ModernSpinner />
      ) : (
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50/50">
                <tr>
                  {["S.No", "Name", "Email", "Phone", "Status", "Action"].map((h) => (
                    <th key={h} className="py-5 px-8 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-50">
                {!admins.length ? (
                  <tr>
                    <td colSpan={6} className="text-center py-20 text-xs font-black uppercase tracking-widest text-gray-400 italic">
                      <UserCog className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                      No administrators found..
                    </td>
                  </tr>
                ) : (
                  admins.map((p, index) => (
                    <tr key={p.id} className="hover:bg-red-50/30 transition-colors group">
                      <td className="py-5 px-8 text-sm font-mono text-gray-400">{(page - 1) * LIMIT + index + 1}</td>
                      <td className="py-5 px-8 text-sm font-black text-gray-900 italic uppercase">{p.name}</td>
                      <td className="py-5 px-8 text-sm font-bold text-gray-600">{p.email}</td>
                      <td className="py-5 px-8 text-sm font-bold text-gray-600">{p.phone_number}</td>
                      <td className="py-5 px-8"><StatusBadge status={p.status} /></td>
                      <td className="py-5 px-8">
                        <Switch
                          checked={p.status === "active"}
                          disabled={updatingId === p.id}
                          onChange={(checked) => handleStatusChange(p, checked)}
                          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all shadow-inner
                            ${p.status === "active" ? "bg-emerald-500" : "bg-gray-200"}
                            ${updatingId === p.id ? "opacity-50 cursor-not-allowed" : "hover:scale-110"}
                          `}
                        >
                          <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-all duration-300 ${p.status === "active" ? "translate-x-6" : "translate-x-1"}`} />
                          {updatingId === p.id && <Loader2 className="absolute inset-0 m-auto w-4 h-4 text-white animate-spin" />}
                        </Switch>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PAGINATION */}
      {pagination.totalPages >= 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between mt-8 p-6 bg-white rounded-[2rem] border border-gray-100 shadow-sm gap-4">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            Showing <span className="text-red-800 font-black italic">{(page - 1) * LIMIT + 1} - {Math.min(page * LIMIT, totalItems)}</span>
          </p>
          <div className="flex items-center gap-3">
            <button onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1} className="w-12 h-12 flex items-center justify-center rounded-2xl border border-gray-100 bg-white text-gray-400 hover:text-red-800 disabled:opacity-30 transition-all shadow-sm">
              <ChevronLeft size={24} strokeWidth={3} />
            </button>
            <div className="px-6 h-12 flex items-center justify-center bg-gray-50 rounded-2xl border border-gray-100">
              <span className="text-xs font-black text-gray-700 uppercase italic">Page {page} <span className="text-gray-400 mx-1">/</span> {pagination.totalPages}</span>
            </div>
            <button onClick={() => setPage((p) => Math.min(p + 1, pagination.totalPages))} disabled={page >= pagination.totalPages} className="w-12 h-12 flex items-center justify-center rounded-2xl border border-gray-100 bg-white text-gray-400 hover:text-red-800 disabled:opacity-30 transition-all shadow-sm">
              <ChevronRight size={24} strokeWidth={3} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HubAdmins;