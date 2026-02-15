import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Truck, Users, Clock, Loader2, CalendarDays, XCircle, ChevronLeft, ChevronRight } from "lucide-react";
import dayjs from "dayjs";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const MIN_LOAD_TIME = 500;
const LIMIT = 10;
const DATE_RANGES = Object.freeze({
  ALL: "entire_data",
  TODAY: "today",
  YESTERDAY: "yesterday",
  LAST_7_DAYS: "last_7_days",
  THIS_MONTH: "this_month",
  LAST_MONTH: "last_month",
  CUSTOM: "custom_range",
});

const getDateRangeParams = (range, customDates) => {
  const today = dayjs();
  let startDate = null;
  let endDate = today.format('YYYY-MM-DD');

  switch (range) {
    case DATE_RANGES.TODAY:
      startDate = today.format("YYYY-MM-DD");
      break;

    case DATE_RANGES.YESTERDAY:
      startDate = today.subtract(1, "day").format("YYYY-MM-DD");
      endDate = startDate;
      break;

    case DATE_RANGES.LAST_7_DAYS:
      startDate = today.subtract(7, "day").format("YYYY-MM-DD");
      break;

    case DATE_RANGES.THIS_MONTH:
      startDate = today.startOf("month").format("YYYY-MM-DD");
      break;

    case DATE_RANGES.LAST_MONTH:
      startDate = today.subtract(1, "month").startOf("month").format("YYYY-MM-DD");
      endDate = today.subtract(1, "month").endOf("month").format("YYYY-MM-DD");
      break;

    case DATE_RANGES.CUSTOM:
      startDate = customDates.start ? dayjs(customDates.start).format("YYYY-MM-DD") : null;
      endDate = customDates.end ? dayjs(customDates.end).format("YYYY-MM-DD") : null;
      break;

    default:
      console.error("Invalid date range term:", range);
      startDate = null;
      endDate = null;
  }

  return { startDate, endDate };
};

const ModernSpinner = () => (
  <div className="flex justify-center items-center py-24 font-sans">
    <div className="w-12 h-12 border-4 border-red-800 border-t-amber-500 rounded-full animate-spin shadow-lg" />
  </div>
);

const DateFilterDropdown = ({ selectedRange, setSelectedRange, setCustomDates }) => {
  const handleRangeChange = (e) => {
    const v = e.target.value;
    setSelectedRange(v);
    if (v !== "custom_range") setCustomDates({ start: null, end: null });
  };

  return (
    <div className="relative inline-flex items-center bg-white border border-gray-200 rounded-xl shadow-sm px-4 h-11 w-full hover:border-red-300 transition-all">
      <CalendarDays className="w-5 h-5 text-red-800 mr-2 flex-shrink-0" />
      <select
        value={selectedRange}
        onChange={handleRangeChange}
        className="appearance-none bg-transparent text-sm font-extrabold text-gray-700 focus:outline-none cursor-pointer pr-6 h-full w-full uppercase tracking-tight"
      >
        <option value={DATE_RANGES.ALL}>Entire Data (All Time)</option>
        <option value={DATE_RANGES.TODAY}>Today</option>
        <option value={DATE_RANGES.YESTERDAY}>Yesterday</option>
        <option value={DATE_RANGES.LAST_7_DAYS}>Last 7 Days</option>
        <option value={DATE_RANGES.THIS_MONTH}>This Month</option>
        <option value={DATE_RANGES.LAST_MONTH}>Last Month</option>
        <option value={DATE_RANGES.CUSTOM}>Custom Range…</option>
      </select>
    </div>
  );
};

const Delivery = () => {
  const [filters, setFilters] = useState({ partner: "", shift: "" });
  const [orders, setOrders] = useState([]);
  const [shiftConfig, setShiftConfig] = useState([]);
  const [partners, setPartners] = useState([]);
  const [pagination, setPagination] = useState(null);

  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [timerComplete, setTimerComplete] = useState(false);

  const [selectedRange, setSelectedRange] = useState("entire_data");
  const [customDates, setCustomDates] = useState({ start: null, end: null });
  const [appliedCustomDates, setAppliedCustomDates] = useState({ start: null, end: null });

  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => setTimerComplete(true), MIN_LOAD_TIME);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const valid = Object.values(DATE_RANGES);
    if (!valid.includes(selectedRange)) {
      console.error("Invalid selectedRange detected:", selectedRange);
      setSelectedRange(DATE_RANGES.ALL);
    }
  }, [selectedRange]);

  const applyRange = () => {
    if (customDates.start && customDates.end) {
      setAppliedCustomDates(customDates);
      setPage(1);
    }
  };

  const fetchOrders = useCallback(async () => {
    setIsFetching(true);
    const { startDate, endDate } = getDateRangeParams(selectedRange, appliedCustomDates);
    const params = new URLSearchParams();
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);
    if (filters.partner) params.append("partner", filters.partner);
    if (filters.shift) params.append("shift", filters.shift);
    params.append("page", page);
    params.append("limit", LIMIT);

    const url = `${import.meta.env.VITE_API_BASE_URL}/api/v1/crm/delivery/orders?${params.toString()}`;
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 403) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }
      const data = await res.json();
      if (!data?.status) return;

      setOrders(data.data.orders || []);
      setShiftConfig(data.data.shifts || []);
      setPartners(data.data.partners || []);
      setPagination(data.pagination || null);
    } finally {
      setIsFetching(false);
    }
  }, [selectedRange, appliedCustomDates, filters.partner, filters.shift, page]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);
  useEffect(() => { setPage(1); }, [selectedRange, appliedCustomDates, filters.partner, filters.shift]);
  useEffect(() => {
    if (!isFetching && timerComplete) setLoading(false);
    else setLoading(true);
  }, [isFetching, timerComplete]);

  const shiftSummary = useMemo(() => {
    return shiftConfig.map((shift) => {
      const shiftOrders = orders.filter((o) => o.shift === shift.name);
      const uniquePartners = [...new Set(shiftOrders.map((o) => o.partner))];
      return {
        shift: shift.name,
        time: `${shift.start} - ${shift.end}`,
        count: shiftOrders.length,
        partners: uniquePartners,
      };
    });
  }, [orders, shiftConfig]);

  const totalOrders = pagination?.total || 0;
  const totalPartners = partners.length;

  if (loading) return <ModernSpinner />;

  const isFilterActive = filters.partner || filters.shift || selectedRange !== DATE_RANGES.ALL;

  return (
    <div className="p-4 sm:p-6 lg:p-10 bg-[#F9FAFB] min-h-screen font-sans">
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tighter italic uppercase">
          Daily Delivery Overview
        </h1>
        <p className="text-gray-500 text-[10px] font-extrabold uppercase tracking-[0.2em] mt-1">
          Deliveries scheduled for the selected period. Total {totalOrders} orders across {totalPartners} partners.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-8 p-6 bg-white rounded-3xl shadow-sm border border-gray-100">
        <span className="text-[10px] font-extrabold text-gray-500 uppercase tracking-[0.2em] mr-2">Filter by:</span>
        <div className="w-full sm:w-auto flex-grow max-w-xs">
          <DateFilterDropdown selectedRange={selectedRange} setSelectedRange={setSelectedRange} setCustomDates={setCustomDates} />
        </div>

        <select
          className="border border-gray-200 text-gray-700 font-extrabold py-2 px-4 rounded-xl cursor-pointer shadow-sm hover:border-red-300 transition-all h-11 text-sm uppercase tracking-tight"
          value={filters.partner}
          onChange={(e) => setFilters({ ...filters, partner: e.target.value })}
        >
          <option value="">All Partners ({partners.length})</option>
          {partners.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <select
          className="border border-gray-200 text-gray-700 font-extrabold py-2 px-4 rounded-xl cursor-pointer shadow-sm hover:border-red-300 transition-all h-11 text-sm uppercase tracking-tight"
          value={filters.shift}
          onChange={(e) => setFilters({ ...filters, shift: e.target.value })}
        >
          <option value="">All Shifts ({shiftConfig.length})</option>
          {shiftConfig.map((shift) => (
            <option key={shift.name} value={shift.name}>{shift.name}</option>
          ))}
        </select>

        {isFilterActive && (
          <button
            onClick={() => {
              setFilters({ partner: "", shift: "" });
              setSelectedRange("entire_data");
              setCustomDates({ start: null, end: null });
              setAppliedCustomDates({ start: null, end: null });
              setPage(1);
            }}
            className="px-6 py-2 text-[10px] font-extrabold bg-red-50 text-red-800 rounded-xl hover:bg-red-800 hover:text-white flex items-center transition-all uppercase italic tracking-[0.2em]"
          >
            <XCircle className="w-4 h-4 mr-1" /> Reset All
          </button>
        )}
      </div>

      {selectedRange === DATE_RANGES.CUSTOM && (
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8 p-6 border border-red-100 bg-red-50/30 rounded-3xl">
          <span className="text-[10px] font-extrabold text-red-800 self-center uppercase tracking-[0.2em]">Custom Range:</span>
          <DatePicker
            selected={customDates.start}
            onChange={(date) => setCustomDates((p) => ({ ...p, start: date }))}
            selectsStart
            placeholderText="Start Date"
            className="border border-gray-200 rounded-xl p-3 h-11 text-sm font-extrabold w-full text-center uppercase tracking-tight"
            wrapperClassName="w-full"
          />
          <DatePicker
            selected={customDates.end}
            onChange={(date) => setCustomDates((p) => ({ ...p, end: date }))}
            selectsEnd
            minDate={customDates.start}
            placeholderText="End Date"
            className="border border-gray-200 rounded-xl p-3 h-11 text-sm font-extrabold w-full text-center uppercase tracking-tight"
            wrapperClassName="w-full"
          />
          <button
            onClick={applyRange}
            disabled={!customDates.start || !customDates.end}
            className="bg-red-800 text-white text-[10px] font-extrabold py-2 px-6 h-11 rounded-xl shadow-md disabled:bg-gray-300 hover:bg-red-900 uppercase italic tracking-[0.2em]"
          >
            Apply Date Range
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
        {shiftSummary.map((s) => (
          <div key={s.shift} className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.2em] mb-1 group-hover:text-red-800 transition-colors">
                  {s.shift} Shift
                </p>
                <p className="text-4xl font-extrabold text-gray-900 italic tracking-tighter">
                  {s.count}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-gray-50 text-gray-400 group-hover:bg-red-50 group-hover:text-red-800 transition-all">
                <Clock className="w-8 h-8" />
              </div>
            </div>
            <div className="flex items-center pt-6 border-t border-gray-50">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg mr-3 border border-amber-100">
                <Users className="w-5 h-5" />
              </div>
              <p className="text-sm font-extrabold text-gray-700 uppercase tracking-tight">
                {s.partners.length} <span className="text-gray-400 font-semibold lowercase italic">Partners</span>
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-red-800 p-8 rounded-[2rem] shadow-xl shadow-red-900/20 mb-10 flex flex-wrap justify-between items-center">
        <div className="w-full lg:w-auto text-xl font-extrabold text-white italic flex items-center uppercase tracking-tight">
          <span className="p-3 mr-4 bg-white/10 rounded-2xl text-amber-400">
            <Truck className="w-8 h-8" />
          </span>
          Filtered Delivery Metrics
        </div>
        <div className="flex flex-wrap gap-10 w-full lg:w-auto justify-end">
          <div className="border-r border-white/10 pr-10">
            <span className="text-3xl font-extrabold text-white italic block">{pagination?.total || 0}</span>
            <span className="text-[10px] font-extrabold text-red-200 uppercase tracking-[0.2em] block">Total Orders (Overall)</span>
          </div>
          <div className="border-r border-white/10 pr-10">
            <span className="text-3xl font-extrabold text-amber-400 italic block">{partners.length}</span>
            <span className="text-[10px] font-extrabold text-red-200 uppercase tracking-[0.2em] block">Unique Partners (Overall)</span>
          </div>
          <div>
            <span className="text-3xl font-extrabold text-white italic block">
              {partners.length === 0 ? 0 : (pagination.total / partners.length).toFixed(1)}
            </span>
            <span className="text-[10px] font-extrabold text-red-200 uppercase tracking-[0.2em] block">Orders / Partner (Overall)</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        {orders.length === 0 ? (
          <div className="text-center py-20 text-gray-400 font-extrabold uppercase tracking-[0.2em] text-[10px] italic">No deliveries found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50/50">
                <tr>
                  {["Order ID", "Customer", "Partner", "Delivery Time", "Shift", "Status"].map((col) => (
                    <th key={col} className="py-5 px-8 text-left text-[10px] font-extrabold text-gray-500 uppercase tracking-[0.2em]">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-50">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-red-50/30 transition-colors">
                    <td className="py-5 px-8 text-sm font-extrabold text-gray-900 italic uppercase tracking-tight">{order.order_number}</td>
                    <td className="py-5 px-8 text-sm font-semibold text-gray-600">{order.customer}</td>
                    <td className="py-5 px-8 text-sm font-semibold text-gray-600">{order.partner}</td>
                    <td className="py-5 px-8 text-sm font-mono text-gray-500">{order.deliveryTime}</td>
                    <td className="py-5 px-8"><span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-extrabold uppercase italic">{order.shift}</span></td>
                    <td className="py-5 px-8">
                      <span className={`px-4 py-1.5 rounded-xl text-[10px] font-extrabold uppercase italic tracking-[0.2em] border ${order.status === "Delivered" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                        order.status === "Cancelled" ? "bg-red-50 text-red-700 border-red-100" :
                          "bg-amber-50 text-amber-700 border-amber-100"
                        }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pagination?.totalPages >= 1 && (
        <div className="flex items-center justify-between mt-8 p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-[10px] font-extrabold text-gray-500 uppercase tracking-[0.2em]">
            Showing <span className="text-red-800 font-extrabold italic">{(page - 1) * LIMIT + 1}</span> to{" "}
            <span className="text-red-800 font-extrabold italic">{Math.min(page * LIMIT, pagination.total)}</span> of{" "}
            <span className="text-red-800 font-extrabold italic">{pagination.total}</span> deliveries
          </p>
          <div className="flex items-center gap-3">
            <button onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1} className="w-11 h-11 flex items-center justify-center rounded-2xl border border-gray-100 bg-white text-gray-400 hover:text-red-800 disabled:opacity-30 shadow-sm transition-all">
              <ChevronLeft size={22} strokeWidth={3} />
            </button>
            <span className="text-[10px] font-extrabold text-gray-700 uppercase italic tracking-tight">Page {page} of {pagination.totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(p + 1, pagination.totalPages))} disabled={page >= pagination.totalPages} className="w-11 h-11 flex items-center justify-center rounded-2xl border border-gray-100 bg-white text-gray-400 hover:text-red-800 disabled:opacity-30 shadow-sm transition-all">
              <ChevronRight size={22} strokeWidth={3} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Delivery;