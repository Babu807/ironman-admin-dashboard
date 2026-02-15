import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  BoltIcon,
  CheckCircleIcon,
  ClockIcon,
  ShoppingBagIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

// --- THEME CONSTANTS ---
// Semantic palette for data visualization (intuitive colors)
const DATA_VIZ_PALETTE = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#06B6D4", "#6366F1"];
// IronMan HUD palette for system elements
// const IRON_RED = "#991B1B";
// const IRON_GOLD = "#F59E0B";

// --- 1. LOGIC HELPERS ---
const getDateRangeParams = (range, customDates) => {
  const today = dayjs();
  let startDate = null;
  let endDate = today.format('YYYY-MM-DD');

  switch (range) {
    case "today": startDate = today.format('YYYY-MM-DD'); break;
    case "yesterday":
      startDate = today.subtract(1, "day").format('YYYY-MM-DD');
      endDate = startDate;
      break;
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
    default: startDate = null; endDate = null;
  }
  return { startDate, endDate };
};

// --- 2. SUB-COMPONENTS ---

const DateFilter = ({ selectedRange, setSelectedRange, customDates, setCustomDates, handleApplyCustomRange }) => {
  const [showCustomPicker, setShowCustomPicker] = useState(selectedRange === 'custom_range');

  const handleRangeChange = (e) => {
    const newRange = e.target.value;
    setSelectedRange(newRange);
    setShowCustomPicker(newRange === 'custom_range');
    if (newRange !== 'custom_range') setCustomDates({ start: null, end: null });
  };

  const handleClear = (e) => {
    e.preventDefault();
    setSelectedRange("entire_data");
    setCustomDates({ start: null, end: null });
    setShowCustomPicker(false);
  };

  return (
    <div className="flex flex-col items-end space-y-2 relative z-50 font-sans">
      <div className="flex flex-col sm:flex-row items-end sm:items-center space-x-0 sm:space-x-4 space-y-3 sm:space-y-0">
        {selectedRange !== "entire_data" && (
          <button
            onClick={handleClear}
            className="text-[10px] font-extrabold text-red-800 hover:text-red-900 uppercase tracking-[0.2em] transition-colors mb-2 sm:mb-0 italic"
          >
            Clear Filter
          </button>
        )}

        <div className="relative inline-flex items-center bg-white border border-gray-200 rounded-xl shadow-sm h-11 px-4 hover:border-red-200 transition-all">
          <CalendarDaysIcon className="w-5 h-5 text-red-800 mr-2" />
          <select value={selectedRange} onChange={handleRangeChange} className="bg-transparent text-sm font-bold text-gray-700 outline-none cursor-pointer pr-4 tracking-tight">
            <option value="entire_data">All Time</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="last_7_days">Last 7 Days</option>
            <option value="this_month">This Month</option>
            <option value="last_month">Last Month</option>
            <option value="custom_range">Custom Range...</option>
          </select>
        </div>

        {showCustomPicker && (
          <div className="flex items-center space-x-2 bg-white p-2 rounded-xl border border-red-100 shadow-xl">
            <DatePicker selected={customDates.start} onChange={(d) => setCustomDates(p => ({ ...p, start: d }))} placeholderText="Start" aria-label="Start date" className="w-24 text-xs font-bold text-center border-none focus:ring-2 focus:ring-red-500 rounded"
            />
            <span className="text-gray-400 font-bold">-</span>
            <DatePicker selected={customDates.end} onChange={(d) => setCustomDates(p => ({ ...p, end: d }))} placeholderText="End" aria-label="End date" className="w-24 text-xs font-bold text-center border-none focus:ring-2 focus:ring-red-500 rounded" />
            <button
              onClick={handleApplyCustomRange}
              disabled={!customDates.start || !customDates.end}
              className="bg-red-800 text-white text-[10px] font-extrabold px-4 py-2 rounded-lg uppercase tracking-wider hover:bg-red-900 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Apply
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const SummaryCard = ({ title, value, colorClass, Icon, isLoading }) => {
  const themeMap = {
    "bg-cyan-500": "text-blue-600 bg-blue-50 border-blue-100",
    "bg-emerald-500": "text-emerald-600 bg-emerald-50 border-emerald-100",
    "bg-amber-500": "text-amber-600 bg-amber-50 border-amber-100",
    "bg-indigo-500": "text-indigo-600 bg-indigo-50 border-indigo-100",
    "bg-green-600": "text-emerald-700 bg-emerald-100 border-emerald-200"
  };
  const theme = themeMap[colorClass] || "text-gray-600 bg-gray-50 border-gray-100";

  return (
    <div className="bg-white rounded-2xl p-6 flex items-center justify-between border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 h-full group font-sans">
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1">{title}</p>
        {isLoading ? (
          <div className="h-8 w-20 bg-gray-100 animate-pulse rounded" />
        ) : (
          <p className="text-3xl font-extrabold text-gray-900 tracking-tight leading-none">{value}</p>
        )}
      </div>
      <div className={`p-4 rounded-2xl transition-transform duration-300 group-hover:scale-110 ${theme} border`}>
        <Icon className="w-7 h-7" strokeWidth={2} />
      </div>
    </div>
  );
};

const ChartCard = ({ title, children, isLoading, isEmpty, extraHeader }) => (
  <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 h-full font-sans">
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      <h2 className="text-xl font-extrabold text-gray-900 tracking-tight uppercase italic border-l-4 border-red-800 pl-4">{title}</h2>
      {extraHeader}
    </div>
    {isLoading ? (
      <div className="flex justify-center items-center py-20"><div className="w-10 h-10 border-4 border-red-800 border-t-amber-500 rounded-full animate-spin" /></div>
    ) : isEmpty ? (
      <div className="text-center py-20 text-gray-400 font-bold uppercase tracking-[0.2em] text-xs">No Records Found</div>
    ) : children}
  </div>
);

// --- 3. MAIN DASHBOARD ---

const Dashboard = () => {
  const [selectedRange, setSelectedRange] = useState("entire_data");
  const [customDates, setCustomDates] = useState({ start: null, end: null });
  const [applyTrigger, setApplyTrigger] = useState(0);

  const [summary, setSummary] = useState([]);
  const [breakdown, setBreakdown] = useState([]);
  const [avgDeliveryData, setAvgDeliveryData] = useState([]);
  const [stageSummary, setStageSummary] = useState([]);

  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingBreakdown, setLoadingBreakdown] = useState(true);
  const [loadingAvg, setLoadingAvg] = useState(true);
  const [loadingStage, setLoadingStage] = useState(true);

  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem("token");
    const BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const authHeaders = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

    const { startDate, endDate } = getDateRangeParams(selectedRange, customDates);
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('start_date', startDate);
    if (endDate) queryParams.append('end_date', endDate);
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';

    if (selectedRange === 'custom_range' && (!startDate || !endDate)) {
      setLoadingSummary(false); setLoadingBreakdown(false); setLoadingAvg(false); setLoadingStage(false);
      return;
    }

    const fetchData = async (endpoint, setter, loadingSetter, mapData = (d) => d) => {
      loadingSetter(true);
      try {
        const res = await fetch(`${BASE_URL}/api/v1/crm/dashboard/${endpoint}${query}`, { method: "GET", headers: authHeaders });
        if (res.status === 403) {
          localStorage.removeItem("token");
          navigate("/login", { replace: true });
          return;
        }
        const result = await res.json();
        if (result?.status) setter(mapData(result.data));
      } catch (err) { console.error(`Error fetching ${endpoint}:`, err); }
      finally { loadingSetter(false); }
    };

    fetchData('summary', setSummary, setLoadingSummary, (d) => ([
      { title: "Total Orders", value: d.total_orders, colorClass: "bg-cyan-500", Icon: ShoppingBagIcon },
      { title: "Completed", value: d.completed_orders, colorClass: "bg-emerald-500", Icon: CheckCircleIcon },
      { title: "Avg Delivery Time", value: `${d.avg_delivery_time} mins`, colorClass: "bg-indigo-500", Icon: ClockIcon },
      { title: "Active Pickups", value: d.active_pickups, colorClass: "bg-amber-500", Icon: BoltIcon },
    ]));
    fetchData('breakdown', setBreakdown, setLoadingBreakdown);
    fetchData('avg-delivery', setAvgDeliveryData, setLoadingAvg);
    fetchData('stages', setStageSummary, setLoadingStage, (data) =>
      Array.isArray(data) ? data.map(item => ({ stage: item.status, orders: item.orders, percent: item.percent, avg: parseFloat(item.avg_time) })) : []
    );
  }, [selectedRange, applyTrigger, customDates]);

  const formatStageLabel = (s) => s?.replace(/[_-]/g, " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase()) || "";
  const totalOrders = Number(summary.find(s => s.title === "Total Orders")?.value) || 0;
  const completedOrders = Number(summary.find(s => s.title === "Completed")?.value) || 0;
  const completionRate = totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(1) : 0;

  return (
    <div className="bg-[#F9FAFB] min-h-screen p-6 lg:p-10 font-sans">
      <div className="max-w-7xl mx-auto">

        {/* HEADER - Manrope Refined */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight italic uppercase">Analytics Dashboard</h1>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.25em] mt-1">Real-time Performance Metrics</p>
          </div>
          <DateFilter
            selectedRange={selectedRange}
            setSelectedRange={setSelectedRange}
            customDates={customDates}
            setCustomDates={setCustomDates}
            handleApplyCustomRange={() => setApplyTrigger(t => t + 1)}
          />
        </div>

        {/* BLOCK 1: STATUS PIE & VOLUME CARDS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-1">
            <ChartCard title="Order Status" isLoading={loadingBreakdown} isEmpty={breakdown.length === 0}>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={breakdown} cx="50%" cy="50%" innerRadius={70} outerRadius={95} paddingAngle={8} dataKey="value">
                      {breakdown.map((_, i) => <Cell key={i} fill={DATA_VIZ_PALETTE[i % DATA_VIZ_PALETTE.length]} cornerRadius={8} />)}
                    </Pie>
                    <Tooltip contentStyle={{ fontFamily: 'Manrope', borderRadius: '12px', border: 'none', boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)", fontWeight: 'bold' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-6">
                {breakdown.map((item, i) => (
                  <div key={i} className="flex items-center text-[10px] font-extrabold text-gray-500 uppercase tracking-tight">
                    <span className="w-2.5 h-2.5 rounded-full mr-2 shadow-sm" style={{ backgroundColor: DATA_VIZ_PALETTE[i % DATA_VIZ_PALETTE.length] }} />
                    {formatStageLabel(item.name)}
                  </div>
                ))}
              </div>
            </ChartCard>
          </div>

          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {summary.filter(s => s.title !== "Avg Delivery Time").map((item, i) => (
              <SummaryCard key={i} {...item} isLoading={loadingSummary} />
            ))}
            <SummaryCard title="Completion Rate" value={`${completionRate}%`} colorClass="bg-green-600" Icon={CheckCircleIcon} isLoading={loadingSummary} />
          </div>
        </div>

        {/* BLOCK 2: TREND AREA CHART */}
        <div className="grid grid-cols-1 gap-8 mb-8">
          <ChartCard
            title="Performance Trend"
            isLoading={loadingAvg}
            isEmpty={avgDeliveryData.length === 0}
            extraHeader={
              <div className="flex items-center bg-red-800 px-6 py-3 rounded-2xl shadow-lg shadow-red-900/20 border border-red-900">
                <div className="p-2 bg-white/10 text-amber-400 rounded-lg mr-4 border border-white/10"><ClockIcon className="w-5 h-5" /></div>
                <div>
                  <p className="text-[10px] font-bold text-red-100 uppercase tracking-[0.2em] leading-none mb-1">Global Avg</p>
                  <p className="text-xl font-extrabold text-white italic tracking-tight leading-none">{summary.find(s => s.title === "Avg Delivery Time")?.value || "0 mins"}</p>
                </div>
              </div>
            }
          >
            <div className="h-80 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={avgDeliveryData}>
                  <defs>
                    <linearGradient id="ironGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#991B1B" stopOpacity={0.2} /><stop offset="95%" stopColor="#991B1B" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontFamily: 'Manrope', fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontFamily: 'Manrope', fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} />
                  <Tooltip contentStyle={{ fontFamily: 'Manrope', borderRadius: "16px", border: "none", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)", fontWeight: 'bold' }} />
                  <Area type="monotone" dataKey="avgTime" stroke="#991B1B" strokeWidth={4} fill="url(#ironGradient)" dot={{ r: 5, fill: "#F59E0B", strokeWidth: 3, stroke: "#fff" }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* TABLE SECTION - Manrope Technical Table */}
        <ChartCard title="Stage Analysis Table" isLoading={loadingStage} isEmpty={stageSummary.length === 0}>
          <div className="overflow-x-auto rounded-2xl border border-gray-100">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr className="text-left text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">
                  <th className="py-5 px-8">Stage</th><th className="py-5 px-8">Orders</th><th className="py-5 px-8">Success %</th><th className="py-5 px-8">Avg (Hrs)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 bg-white">
                {stageSummary.map((row, i) => (
                  <tr key={i} className="hover:bg-red-50/50 transition-colors">
                    <td className="py-5 px-8 text-sm font-extrabold text-gray-800 tracking-tight">{formatStageLabel(row.stage)}</td>
                    <td className="py-5 px-8 text-sm font-semibold text-gray-600">{row.orders}</td>
                    <td className="py-5 px-8">
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg text-[10px] font-extrabold uppercase tracking-tight">
                        {row.percent}%
                      </span>
                    </td>
                    <td className="py-5 px-8 text-sm font-extrabold text-red-800 tracking-tight italic">{row.avg.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>
      </div>
    </div>
  );
};

export default Dashboard;