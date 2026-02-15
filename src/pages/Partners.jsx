import React, { useEffect, useState, useCallback } from "react";
import { Switch } from "@headlessui/react";
import toast from "react-hot-toast";
import { ChevronLeft, ChevronRight, Search, Loader2, AlertTriangle, Check, Upload, Download, X } from "lucide-react";

// --- 1. THEME CONSTANTS ---
// const IRON_RED = "bg-red-800";
// const IRON_TEXT = "text-red-800";
// const IRON_GOLD = "text-amber-500";
const DELIVERY_PARTNER_STATUS = Object.freeze({
  ACTIVE: "active",
  INACTIVE: "inactive",
});

// --- Confirmation Modal Component ---
const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText, confirmClass, isConfirming }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-50 flex justify-center items-center p-4 font-sans">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md transform transition-all border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="p-8 border-b border-gray-50 flex items-center">
          <div className="p-3 bg-amber-50 rounded-xl mr-4">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
          </div>
          <h3 className="text-xl font-extrabold text-gray-900 italic uppercase tracking-tight">{title}</h3>
        </div>

        {/* Body */}
        <div className="p-8">
          <p className="text-gray-600 font-semibold mb-8 leading-relaxed">{message}</p>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onCancel}
              disabled={isConfirming}
              className="px-6 py-3 text-[10px] font-extrabold uppercase italic tracking-[0.2em] rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all disabled:opacity-70"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isConfirming}
              className={`px-6 py-3 text-[10px] font-extrabold uppercase italic tracking-[0.2em] rounded-xl text-white shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center disabled:opacity-70 ${confirmClass}`}
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

// --- Helper Components ---

const ModernSpinner = () => (
  <div className="flex flex-col justify-center items-center py-24 space-y-4 font-sans">
    <div className="w-12 h-12 border-4 border-red-800 border-t-amber-500 rounded-full animate-spin shadow-lg" />
    <p className="text-[10px] font-extrabold text-red-800 uppercase tracking-[0.2em] animate-pulse">Looking for Delivery Partners...</p>
  </div>
);

const StatusBadge = ({ status }) => {
  const isActive = status === DELIVERY_PARTNER_STATUS.ACTIVE;

  return (
    <span
      className={`px-4 py-1.5 rounded-xl text-[10px] font-extrabold uppercase italic tracking-[0.2em] border
        ${isActive
          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
          : "bg-red-50 text-red-700 border-red-100"}
      `}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );
};


const downloadSampleFile = () => {
  const headers = ["first_name", "last_name", "email", "phone_number", "password"];
  const rows = [
    ["John", "Doe", "john@example.com", "9876543210", "Pass@123"],
    ["Jane", "Smith", "jane@example.com", "9876543211", "Test@123"]
  ];

  const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "delivery_partners_sample.csv";
  link.click();
};

const ImportModal = ({ isOpen, onClose, onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState(null);

  if (!isOpen) return null;

  const handleClose = () => {
    setFile(null);
    setResult(null);
    setIsUploading(false);
    onClose();
  };

  const handleUpload = async () => {
    if (!file) return toast.error("Please select a file first");
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("file", file);
    setIsUploading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/crm/users/upload-block`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data && data.summary) {
        setResult({ success: data.summary.success, failed: data.summary.failed, errors: data.errors || [] });
        if (data.summary.success > 0) onUploadSuccess();
      } else {
        toast.error("Invalid response from server");
      }
    } catch (error) {
      toast.error("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-50 flex justify-center items-center p-4 font-sans">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-8 relative border border-gray-100">
        <button onClick={handleClose} className="absolute top-6 right-6 text-gray-400 hover:text-red-800 transition-colors">
          <X size={24} strokeWidth={3} />
        </button>

        <h3 className="text-2xl font-extrabold text-gray-900 italic uppercase tracking-tight mb-6 border-b border-gray-50 pb-4">
          Import Partners
        </h3>

        {!result ? (
          <div className="space-y-6">
            <div className="border-2 border-dashed border-gray-200 rounded-3xl p-10 text-center hover:border-red-300 transition-colors group">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-red-50 transition-colors">
                <Upload className="text-gray-400 group-hover:text-red-800" size={32} />
              </div>
              <input type="file" accept=".csv,.xlsx" onChange={(e) => setFile(e.target.files[0])} className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-6 file:rounded-xl file:border-0 file:text-[10px] file:font-extrabold file:uppercase file:bg-red-50 file:text-red-800 hover:file:bg-red-800 hover:file:text-white" />
            </div>
            <button
              onClick={handleUpload}
              disabled={isUploading || !file}
              className="w-full bg-red-800 text-white py-4 rounded-2xl font-extrabold uppercase italic tracking-[0.2em] shadow-lg shadow-red-900/20 hover:bg-red-900 disabled:opacity-50 flex justify-center items-center gap-3 transition-all active:scale-95"
            >
              {isUploading ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
              {isUploading ? "Processing Sync..." : "Initialize Import"}
            </button>
          </div>
        ) : (
          <div className="text-center">
            <div className="flex justify-around py-8 border-b border-gray-50 mb-8">
              <div>
                <p className="text-4xl font-extrabold text-emerald-600 italic tracking-tighter">{result.success}</p>
                <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.2em] mt-1">Success</p>
              </div>
              <div>
                <p className="text-4xl font-extrabold text-red-600 italic tracking-tighter">{result.failed}</p>
                <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.2em] mt-1">Failed</p>
              </div>
            </div>
            <button onClick={handleClose} className="w-full bg-gray-900 text-white py-4 rounded-2xl font-extrabold uppercase italic tracking-[0.2em]">Done</button>
          </div>
        )}
      </div>
    </div>
  );
};

const DeliveryPartners = () => {
  const [partners, setPartners] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [search, setSearch] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const [modal, setModal] = useState({ isOpen: false, user: null, newStatus: null });

  const LIMIT = 10;

  const loadPartners = useCallback(async () => {
    const token = localStorage.getItem("token");
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/crm/users/delivery-partners?search=${encodeURIComponent(search)}&page=${page}&limit=${LIMIT}`,
        { method: "GET", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );
      if (res.status === 403) { localStorage.removeItem("token"); window.location.href = "/login"; return; }
      const data = await res.json();
      if (data?.status && Array.isArray(data.data)) {
        setPartners(data.data);
        setPagination(data.pagination || { totalPages: 0, total: 0 });
      } else {
        setPartners([]);
        setPagination({});
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => {
    const timer = setTimeout(() => { loadPartners(); }, 400);
    return () => clearTimeout(timer);
  }, [page, search, loadPartners]);

  const handleStatusChange = (user, checked) => {
    setModal({
      isOpen: true,
      user,
      newStatus: checked
        ? DELIVERY_PARTNER_STATUS.ACTIVE
        : DELIVERY_PARTNER_STATUS.INACTIVE,
    });
  };


  const handleConfirmStatusUpdate = async () => {
    const { user, newStatus } = modal;
    const oldStatus = user.status;
    setIsConfirming(true);
    setPartners((prev) => prev.map((u) => u.id === user.id ? { ...u, status: newStatus } : u));
    setUpdatingId(user.id);
    setModal({ isOpen: false, user: null, newStatus: null });

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/crm/users/update/userstatus`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.id,
          status:
            newStatus === DELIVERY_PARTNER_STATUS.ACTIVE
              ? DELIVERY_PARTNER_STATUS.ACTIVE
              : DELIVERY_PARTNER_STATUS.INACTIVE,
        }),
      });
      const data = await res.json();
      if (!data?.status) throw new Error();
      toast.success(
        `User ${newStatus === DELIVERY_PARTNER_STATUS.ACTIVE
          ? "activated"
          : "deactivated"
        } successfully`
      );
    } catch {
      setPartners((prev) => prev.map((u) => u.id === user.id ? { ...u, status: oldStatus } : u));
      toast.error("Failed to update user status");
    } finally { setUpdatingId(null); setIsConfirming(false); }
  };

  const isActivating =
    modal.newStatus === DELIVERY_PARTNER_STATUS.ACTIVE;
  return (
    <div className="p-4 sm:p-6 lg:p-10 bg-[#F9FAFB] min-h-screen font-sans">
      <ImportModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} onUploadSuccess={loadPartners} />
      <ConfirmationModal
        isOpen={modal.isOpen}
        title={isActivating ? 'Activate Delivery Partner' : 'Deactivate Delivery Partner'}
        message={modal.user ? `Are you sure you want to change the status of ${modal.user.name} to ${modal.newStatus.toUpperCase()}?` : ''}
        onConfirm={handleConfirmStatusUpdate}
        onCancel={() => setModal({ isOpen: false, user: null, newStatus: null })}
        confirmText={isActivating ? 'Yes, Activate' : 'Yes, Deactivate'}
        confirmClass={isActivating ? 'bg-emerald-600' : 'bg-red-800'}
        isConfirming={isConfirming}
      />

      {/* HEADER SECTION */}
      <div className="mb-12 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight italic uppercase">
            Delivery Partners Management
          </h1>
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">
            Maintain and monitor fleet operational status
          </p>
        </div>

        <div className="flex gap-4 items-center">
          <button onClick={downloadSampleFile} className="px-6 py-3 rounded-xl border border-gray-200 bg-white text-gray-600 font-extrabold uppercase text-[10px] tracking-[0.2em] hover:border-red-800 hover:text-red-800 transition-all shadow-sm">
            Sample File
          </button>
          <button onClick={() => setIsImportModalOpen(true)} className="px-6 py-3 rounded-xl bg-red-800 text-white font-extrabold uppercase text-[10px] tracking-[0.2em] italic shadow-lg shadow-red-900/20 hover:bg-red-900 transition-all flex items-center gap-2">
            <Upload size={14} strokeWidth={3} /> Import Partners
          </button>
        </div>
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
            className="pl-12 pr-6 py-4 w-full rounded-2xl bg-gray-50 text-sm font-semibold text-gray-800 placeholder-gray-400 border border-gray-100 focus:ring-2 focus:ring-red-800 focus:bg-white transition-all outline-none"
          />
        </div>
      </div>

      {/* DATA CONTENT */}
      {loading ? (
        <ModernSpinner />
      ) : (
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50/50">
                <tr>
                  {["S.No", "Name", "Email", "Phone", "Status", "Action"].map((h) => (
                    <th key={h} className="py-5 px-8 text-left text-[10px] font-extrabold text-gray-500 uppercase tracking-[0.2em]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-50">
                {!partners.length ? (
                  <tr><td colSpan={6} className="text-center py-20 text-[10px] font-extrabold uppercase tracking-[0.2em] text-gray-400 italic">No partners found..</td></tr>
                ) : (
                  partners.map((p, index) => (
                    <tr key={p.id} className="hover:bg-red-50/30 transition-colors group">
                      <td className="py-5 px-8 text-sm font-mono text-gray-400">{(page - 1) * LIMIT + index + 1}</td>
                      <td className="py-5 px-8 text-sm font-extrabold text-gray-900 italic uppercase tracking-tight">{p.name}</td>
                      <td className="py-5 px-8 text-sm font-semibold text-gray-600">{p.email}</td>
                      <td className="py-5 px-8 text-sm font-semibold text-gray-600">{p.phone_number}</td>
                      <td className="py-5 px-8"><StatusBadge status={p.status} /></td>
                      <td className="py-5 px-8">
                        <Switch
                          checked={p.status === DELIVERY_PARTNER_STATUS.ACTIVE}
                          disabled={updatingId === p.id}
                          onChange={(checked) => handleStatusChange(p, checked)}
                          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all shadow-inner
                            ${p.status === DELIVERY_PARTNER_STATUS.ACTIVE ? "bg-emerald-500" : "bg-gray-200"}
                            ${updatingId === p.id ? "opacity-50 cursor-not-allowed" : "hover:scale-110"}
                          `}
                        >
                          <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-all duration-300 ${p.status === DELIVERY_PARTNER_STATUS.ACTIVE ? "translate-x-6" : "translate-x-1"}`} />
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
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">
            Showing <span className="text-red-800 font-extrabold italic">{(page - 1) * LIMIT + 1} - {Math.min(page * LIMIT, pagination.totalItems || pagination.total)}</span>
            <span className="mx-2">/</span> Total Partners <span className="text-red-800 font-extrabold italic">{pagination.totalItems || pagination.total}</span>
          </p>
          <div className="flex items-center gap-3">
            <button onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1} className="w-12 h-12 flex items-center justify-center rounded-2xl border border-gray-100 bg-white text-gray-400 hover:text-red-800 disabled:opacity-30 transition-all shadow-sm">
              <ChevronLeft size={24} strokeWidth={3} />
            </button>
            <div className="px-6 h-12 flex items-center justify-center bg-gray-50 rounded-2xl border border-gray-100">
              <span className="text-[10px] font-extrabold text-gray-700 uppercase italic">Page {page} <span className="text-gray-400 mx-1">/</span> {pagination.totalPages}</span>
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

export default DeliveryPartners;