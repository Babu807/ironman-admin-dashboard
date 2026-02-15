import React, { useEffect, useState, useCallback } from "react";
import Select from "react-select";
import { ChevronLeft, ChevronRight, Filter, Download, XCircle, ShoppingBagIcon, CheckCircleIcon, ClockIcon, BoltIcon, Search, UserCog } from "lucide-react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import moment from "moment";
import { CalendarDaysIcon } from "@heroicons/react/24/outline";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import dayjs from "dayjs";

const MIN_LOAD_TIME = 500;

const selectStyles = {
  control: (p, s) => ({
    ...p,
    borderRadius: "1rem",
    minHeight: "44px",
    backgroundColor: "#f9fafb",
    border: "1px solid #f3f4f6",
    fontSize: "0.875rem",
    fontWeight: "800", // Extrabold
    textTransform: "uppercase",
    boxShadow: s.isFocused ? "0 0 0 2px rgba(153, 27, 27, 0.1)" : "none",
    borderColor: s.isFocused ? "#991b1b" : "#f3f4f6",
    "&:hover": { borderColor: "#991b1b" }
  }),
  option: (p, s) => ({
    ...p,
    backgroundColor: s.isFocused ? "#fef2f2" : "white",
    color: s.isFocused ? "#991b1b" : "#1f2937",
    fontWeight: "800", // Extrabold
    fontSize: "0.75rem",
    textTransform: "uppercase"
  })
};

const ModernSpinner = () => (
  <div className="flex flex-col justify-center items-center py-24 space-y-4 font-sans">
    <div className="w-12 h-12 border-4 border-red-800 border-t-amber-500 rounded-full animate-spin shadow-lg" />
    <p className="text-[10px] font-extrabold text-red-800 uppercase tracking-[0.2em] animate-pulse">Looking for Orders & Statistics...</p>
  </div>
);

const getDateRangeParams = (range, customDates) => {
  const today = dayjs();
  let startDate = null;
  let endDate = today.format('YYYY-MM-DD');

  switch (range) {
    case "today": startDate = today.format('YYYY-MM-DD'); break;
    case "yesterday": startDate = today.subtract(1, "day").format('YYYY-MM-DD'); endDate = startDate; break;
    case "last_7_days": startDate = today.subtract(7, "day").format('YYYY-MM-DD'); break;
    case "this_month": startDate = today.startOf("month").format('YYYY-MM-DD'); break;
    case "last_month":
      startDate = today.subtract(1, "month").startOf("month").format('YYYY-MM-DD');
      endDate = today.subtract(1, "month").endOf("month").format('YYYY-MM-DD');
      break;
    case "custom_range":
      startDate = customDates.start ? dayjs(customDates.start).format('YYYY-MM-DD') : null;
      endDate = customDates.end ? dayjs(customDates.end).format('YYYY-MM-DD') : null;
      break;
    default: startDate = null; endDate = null; break;
  }
  return { startDate, endDate };
};

const SummaryCard = ({ title, value, color, Icon, loading }) => {
  const themeMap = {
    cyan: "bg-red-50 text-red-800",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    indigo: "bg-blue-50 text-blue-600",
  };
  const theme = themeMap[color] || "bg-gray-50 text-gray-600";

  return (
    <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 group">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.2em] mb-1 group-hover:text-red-800 transition-colors">{title}</p>
          {loading ? (
            <div className="h-8 w-20 bg-gray-100 animate-pulse rounded" />
          ) : (
            <p className="text-3xl font-extrabold text-gray-900 tracking-tighter italic uppercase">{value}</p>
          )}
        </div>
        <div className={`p-4 rounded-2xl ${theme} transition-all`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  let c = "border-gray-200 text-gray-500";
  if (status === "Delivered") c = "border-emerald-200 bg-emerald-50 text-emerald-700";
  else if (status === "Picked-Up" || status === "In Progress") c = "border-blue-200 bg-blue-50 text-blue-700";
  else if (status === "Requested") c = "border-amber-200 bg-amber-50 text-amber-700";
  else if (status === "Cancelled") c = "border-red-200 bg-red-50 text-red-700";

  return (
    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-extrabold uppercase italic tracking-[0.2em] border ${c}`}>
      {status}
    </span>
  );
};

const Reports = () => {
  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [timerComplete, setTimerComplete] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [status, setStatus] = useState(null);
  const [hubStatus, setHubStatus] = useState(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedRange, setSelectedRange] = useState("entire_data");
  const [customDates, setCustomDates] = useState({ start: null, end: null });
  const [appliedCustomDates, setAppliedCustomDates] = useState({ start: null, end: null });
  const [page, setPage] = useState(1);
  const limit = 10;

  const statusOptions = [
    { value: "Requested", label: "Requested" },
    { value: "Picked-Up", label: "Picked-Up" },
    { value: "In Progress", label: "In Progress" },
    { value: "Delivered", label: "Delivered" },
    { value: "Cancelled", label: "Cancelled" }
  ];

  const hubStatusOptions = [
    { value: "ASSIGNED_TO_PICKUP", label: "Assigned to Pickup" },
    { value: "PICKED_UP", label: "Picked Up" },
    { value: "PROCESSING", label: "Processing" }
  ];

  useEffect(() => {
    if (initialLoad) {
      const t = setTimeout(() => {
        setTimerComplete(true);
        setInitialLoad(false);
      }, MIN_LOAD_TIME);
      return () => clearTimeout(t);
    }
  }, [initialLoad]);

  useEffect(() => {
    if (initialLoad) { setIsLoading(!timerComplete); return; }
    setIsLoading(isFetching);
  }, [isFetching, timerComplete, initialLoad]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(t);
  }, [search]);

  const applyRange = () => {
    if (customDates.start && customDates.end) setAppliedCustomDates(customDates);
  };

  const fetchReports = useCallback(async () => {
    setIsFetching(true);
    const token = localStorage.getItem("token");
    const datesToUse = selectedRange === 'custom_range' ? appliedCustomDates : customDates;
    const { startDate, endDate } = getDateRangeParams(selectedRange, datesToUse);

    if (selectedRange === 'custom_range' && (!appliedCustomDates.start || !appliedCustomDates.end)) {
      setIsFetching(false); setOrders([]); setSummary(null); setPagination(null); return;
    }

    const params = new URLSearchParams();
    if (status) params.append("status", status.value);
    if (hubStatus) params.append("hubStatus", hubStatus.value);
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    if (debouncedSearch) params.append("search", debouncedSearch);
    params.append("page", page);
    params.append("limit", limit);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/crm/reports/orders?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 403) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }
      const data = await res.json();
      setOrders(data.data || []);
      setSummary(data.summary || null);
      setPagination(data.meta || null);
    } finally {
      setIsFetching(false);
    }
  }, [status, hubStatus, selectedRange, appliedCustomDates, debouncedSearch, page]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  useEffect(() => { setPage(1); }, [status, hubStatus, selectedRange, appliedCustomDates, debouncedSearch]);

  const clearFilters = () => {
    setStatus(null); setHubStatus(null); setSearch("");
    setSelectedRange("entire_data"); setCustomDates({ start: null, end: null });
    setAppliedCustomDates({ start: null, end: null }); setPage(1);
  };

  const formatExportData = (d) => d.map((o, i) => ({
    sno: i + 1, order_id: o.id, order_number: o.order_number, status: o.status,
    hub_status: o.hubStatus, partner: o.partner, delivery_date: o.date, delivery_time_hours: o.deliveryTime
  }));

  const exportCSV = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/crm/reports/orders?exportType=csv`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    saveAs(new Blob([Papa.unparse(formatExportData(data.data))], { type: "text/csv" }), "orders-report.csv");
  };

  const exportXLSX = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/crm/reports/orders?exportType=xlsx`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    const ws = XLSX.utils.json_to_sheet(formatExportData(data.data));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reports");
    XLSX.writeFile(wb, "orders-report.xlsx");
  };

  const isFilterActive =
    status !== null ||
    hubStatus !== null ||
    search.trim() !== "" ||
    selectedRange !== "entire_data" ||
    customDates.start !== null ||
    customDates.end !== null;

  return (
    <div className="p-4 sm:p-6 lg:p-10 bg-[#F9FAFB] min-h-screen font-sans">
      {/* HEADER SECTION */}
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tighter italic uppercase">
          Reports
        </h1>
        <p className="text-gray-500 text-[10px] font-extrabold uppercase tracking-[0.2em] mt-1">
          Operational Analytics & Order Statistics
        </p>
      </div>

      {/* FILTER PANEL */}
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 mb-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-red-50 rounded-lg">
            <Filter className="w-5 h-5 text-red-800" />
          </div>
          <h2 className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-gray-400">Filter Data</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Select options={statusOptions} value={status} onChange={setStatus} placeholder="Order Status" styles={selectStyles} />
          <Select options={hubStatusOptions} value={hubStatus} onChange={setHubStatus} placeholder="Hub Status" styles={selectStyles} />

          <div className="relative">
            <CalendarDaysIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-800 z-10" />
            <select
              value={selectedRange}
              onChange={(e) => { setSelectedRange(e.target.value); if (e.target.value !== "custom_range") setCustomDates({ start: null, end: null }); }}
              className="pl-10 pr-4 py-3 h-11 w-full rounded-2xl bg-gray-50 text-[10px] font-extrabold uppercase italic tracking-widest text-gray-800 border border-gray-100 focus:ring-2 focus:ring-red-800 outline-none appearance-none"
            >
              <option value="entire_data">Entire Data (All Time)</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="last_7_days">Last 7 Days</option>
              <option value="this_month">This Month</option>
              <option value="last_month">Last Month</option>
              <option value="custom_range">Custom Range...</option>
            </select>
          </div>

          <button
            onClick={clearFilters}
            disabled={!isFilterActive}
            className={`px-6 py-3 h-11 rounded-2xl text-[10px] font-extrabold uppercase italic tracking-[0.2em] transition-all flex items-center justify-center gap-2 border ${isFilterActive
              ? "border-red-600 bg-red-50 text-red-800 shadow-md hover:bg-red-800 hover:text-white active:scale-95"
              : "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed"
              }`}
          >
            <XCircle className={`w-4 h-4 ${isFilterActive ? "animate-pulse" : ""}`} />
            Clear Filters
          </button>
        </div>

        {selectedRange === "custom_range" && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 pt-6 border-t border-gray-50">
            <DatePicker
              selected={customDates.start}
              onChange={(date) => setCustomDates((p) => ({ ...p, start: date }))}
              placeholderText="Start Date"
              className="w-full h-11 px-6 rounded-2xl bg-gray-50 text-[10px] font-extrabold uppercase border border-gray-100 outline-none focus:ring-2 focus:ring-red-800"
            />
            <DatePicker
              selected={customDates.end}
              onChange={(date) => setCustomDates((p) => ({ ...p, end: date }))}
              placeholderText="End Date"
              className="w-full h-11 px-6 rounded-2xl bg-gray-50 text-[10px] font-extrabold uppercase border border-gray-100 outline-none focus:ring-2 focus:ring-red-800"
            />
            <button
              onClick={applyRange}
              className="bg-red-800 text-white px-6 h-11 rounded-2xl text-[10px] font-extrabold uppercase tracking-[0.2em] shadow-lg shadow-red-900/20"
            >
              Apply Range
            </button>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-4 pt-6 border-t border-gray-50">
          <div className="relative flex-1 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-red-800 transition-colors" />
            <input
              type="text"
              placeholder="Search by Order ID or Partner..."
              className="w-full h-14 pl-14 pr-6 rounded-[1.5rem] bg-gray-50 text-xs font-extrabold text-gray-800 placeholder-gray-300 border border-gray-50 focus:bg-white focus:ring-4 focus:ring-red-800/5 transition-all outline-none italic uppercase tracking-tight"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <button onClick={exportCSV} className="flex items-center gap-2 bg-gray-900 text-white px-6 h-14 rounded-2xl text-[10px] font-extrabold uppercase tracking-[0.2em] hover:bg-black transition-all">
              <Download className="w-4 h-4 text-red-500" /> CSV
            </button>
            <button onClick={exportXLSX} className="flex items-center gap-2 bg-emerald-700 text-white px-6 h-14 rounded-2xl text-[10px] font-extrabold uppercase tracking-[0.2em] hover:bg-emerald-800 transition-all">
              <Download className="w-4 h-4 text-white" /> XLSX
            </button>
          </div>
        </div>
      </div>

      {isLoading ? <ModernSpinner /> : (
        <>
          {summary && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
              <SummaryCard title="Total Orders" value={summary.totalOrders || 0} color="cyan" Icon={ShoppingBagIcon} />
              <SummaryCard title="Completed" value={summary.completed || 0} color="emerald" Icon={CheckCircleIcon} />
              <SummaryCard title="Avg Delivery Time" value={summary.avgDeliveryTime ? `${summary.avgDeliveryTime} hrs` : 'N/A'} color="amber" Icon={ClockIcon} />
              <SummaryCard title="Active Deliveries" value={summary.active || 0} color="indigo" Icon={BoltIcon} />
            </div>
          )}

          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden w-full mb-6">
            <div className="overflow-x-auto w-full">
              <table className="w-full table-fixed divide-y divide-gray-100 border-collapse">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="w-[6%] px-6 py-5 text-left text-[10px] font-extrabold text-gray-500 uppercase tracking-[0.2em]">S.NO</th>
                    <th className="w-[10%] px-4 py-5 text-left text-[10px] font-extrabold text-gray-500 uppercase tracking-[0.2em]">Order ID</th>
                    <th className="w-[16%] px-4 py-5 text-left text-[10px] font-extrabold text-gray-500 uppercase tracking-[0.2em]">Order NUMBER</th>
                    <th className="w-[12%] px-4 py-5 text-left text-[10px] font-extrabold text-gray-500 uppercase tracking-[0.2em]">Status</th>
                    <th className="w-[14%] px-4 py-5 text-left text-[10px] font-extrabold text-gray-500 uppercase tracking-[0.2em]">Hub Status</th>
                    <th className="w-[12%] px-4 py-5 text-left text-[10px] font-extrabold text-gray-500 uppercase tracking-[0.2em]">PARTNER</th>
                    <th className="w-[10%] px-4 py-5 text-left text-[10px] font-extrabold text-gray-500 uppercase tracking-[0.2em]">Date</th>
                    <th className="w-[10%] px-6 py-5 text-right text-[10px] font-extrabold text-gray-500 uppercase tracking-[0.2em]">DELIVERY (HRS)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 bg-white">
                  {!orders.length ? (
                    <tr>
                      <td colSpan={8} className="text-center py-20 text-[10px] font-extrabold uppercase tracking-[0.2em] text-gray-400 italic">
                        <UserCog className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                        No Orders & Statistics found..
                      </td>
                    </tr>
                  ) : (orders.map((o, i) => (
                    <tr key={o.id} className="hover:bg-red-50/30 transition-colors group">
                      <td className="px-6 py-5 text-sm font-mono font-bold text-gray-400">{(page - 1) * limit + i + 1}</td>
                      <td className="px-4 py-5 text-sm font-extrabold text-gray-900 italic uppercase tracking-tight truncate">#{o.id}</td>
                      <td className="px-4 py-5 text-sm font-semibold text-gray-600 truncate">{o.order_number}</td>
                      <td className="px-4 py-5 overflow-hidden whitespace-nowrap">
                        <StatusBadge status={o.status} />
                      </td>
                      <td className="px-4 py-5">
                        <div className="w-full">
                          <p className="text-[10px] font-extrabold uppercase text-gray-400 tracking-tighter leading-tight break-all line-clamp-2 italic" title={o.hubStatus}>
                            {o.hubStatus}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-5 text-sm font-semibold text-gray-800 truncate">{o.partner}</td>
                      <td className="px-4 py-5 text-sm font-mono text-gray-500 whitespace-nowrap">{moment(o.date).format("DD.MM.YY")}</td>
                      <td className="px-6 py-5 text-sm font-extrabold text-red-800 italic text-right">{o.deliveryTime}H</td>
                    </tr>
                  )))
                  }
                </tbody>
              </table>
            </div>
          </div>

          {pagination?.totalPages >= 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between mt-8 p-6 bg-white rounded-[2rem] border border-gray-100 shadow-sm gap-4">
              <p className="text-[10px] font-extrabold text-gray-500 uppercase tracking-[0.2em]">
                Showing <span className="text-red-800 font-extrabold italic">{(page - 1) * limit + 1}-{Math.min(page * limit, pagination.total)}</span> / {pagination.total}
              </p>
              <div className="flex items-center gap-3">
                <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1} className="w-11 h-11 flex items-center justify-center rounded-2xl border border-gray-100 bg-white text-gray-400 hover:text-red-800 shadow-sm transition-all"><ChevronLeft size={22} strokeWidth={3} /></button>
                <div className="px-6 h-11 flex items-center justify-center bg-gray-50 rounded-2xl border border-gray-100">
                  <span className="text-[10px] font-extrabold text-gray-700 uppercase italic tracking-tight">Page {page} / {pagination.totalPages}</span>
                </div>
                <button onClick={() => setPage(p => Math.min(p + 1, pagination.totalPages))} disabled={page >= pagination.totalPages} className="w-11 h-11 flex items-center justify-center rounded-2xl border border-gray-100 bg-white text-gray-400 hover:text-red-800 shadow-sm transition-all"><ChevronRight size={22} strokeWidth={3} /></button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Reports;