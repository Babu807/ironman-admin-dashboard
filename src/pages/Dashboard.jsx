import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
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

const VIBRANT_COLORS = ["#06B6D4", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444", "#3B82F6"];


const getDateRangeParams = (range, customDates) => {
  const today = dayjs();
  let startDate = null;
  let endDate = today.format('YYYY-MM-DD');

  switch (range) {
    case "today":
      startDate = today.format('YYYY-MM-DD');
      break;
    case "yesterday":
      startDate = today.subtract(1, "day").format('YYYY-MM-DD');
      endDate = startDate;
      break;
    case "last_7_days":
      startDate = today.subtract(7, "day").format('YYYY-MM-DD');
      break;
    case "this_month":
      startDate = today.startOf("month").format('YYYY-MM-DD');
      break;
    case "last_month":
      startDate = today.subtract(1, "month").startOf("month").format('YYYY-MM-DD');
      endDate = today.subtract(1, "month").endOf("month").format('YYYY-MM-DD');
      break;
    case "custom_range":
      startDate = customDates.start ? dayjs(customDates.start).format('YYYY-MM-DD') : null;
      endDate = customDates.end ? dayjs(customDates.end).format('YYYY-MM-DD') : null;
      break;
    case "entire_data":
    default:
      startDate = null;
      endDate = null;
      break;
  }

  return { startDate, endDate };
};

const DateFilter = ({ selectedRange, setSelectedRange, customDates, setCustomDates, handleApplyCustomRange }) => {
  const [showCustomPicker, setShowCustomPicker] = useState(selectedRange === 'custom_range');

  const handleRangeChange = (e) => {
    const newRange = e.target.value;
    setSelectedRange(newRange);
    if (newRange === 'custom_range') {
      setShowCustomPicker(true);
    } else {
      setShowCustomPicker(false);
      setCustomDates({ start: null, end: null });
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-end sm:items-center space-y-3 sm:space-y-0 sm:space-x-3 z-50 relative">
      {/* Date Range Dropdown */}
      <div className="relative inline-flex items-center bg-white border border-gray-300 rounded-lg shadow-md h-11 p-2">
        <CalendarDaysIcon className="w-5 h-5 text-cyan-600 mr-2 flex-shrink-0" />
        <select
          value={selectedRange}
          onChange={handleRangeChange}
          className="appearance-none bg-transparent text-sm font-semibold text-gray-700 focus:outline-none cursor-pointer pr-6 h-full"
        >
          <option value="entire_data">Entire Data (All Time)</option>
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
          <option value="last_7_days">Last 7 Days</option>
          <option value="this_month">This Month</option>
          <option value="last_month">Last Month</option>
          <option value="custom_range">Custom Range...</option>
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>

      {showCustomPicker && (
        <div className="flex items-center space-x-2 bg-white p-2 rounded-xl transition duration-300">

          {/* Start Date Picker */}
          <DatePicker
            selected={customDates.start}
            onChange={(date) => setCustomDates(prev => ({ ...prev, start: date }))}
            selectsStart
            startDate={customDates.start}
            endDate={customDates.end}
            placeholderText="Start Date"
            className="border border-gray-300 rounded-lg p-2.5 h-11 text-sm focus:ring-cyan-500 focus:border-cyan-500 w-full text-center"
            popperClassName="modern-datepicker-popper"
            calendarClassName="modern-datepicker-calendar"
            wrapperClassName="flex-grow" 
          />
          <span className="text-gray-500">-</span>

          {/* End Date Picker */}
          <DatePicker
            selected={customDates.end}
            onChange={(date) => setCustomDates(prev => ({ ...prev, end: date }))}
            selectsEnd
            startDate={customDates.start}
            endDate={customDates.end}
            minDate={customDates.start}
            placeholderText="End Date"
            className="border border-gray-300 rounded-lg p-2.5 h-11 text-sm focus:ring-cyan-500 focus:border-cyan-500 w-full text-center"
            popperClassName="modern-datepicker-popper"
            calendarClassName="modern-datepicker-calendar"
            wrapperClassName="flex-grow" 
          />

          <button
            onClick={handleApplyCustomRange}
            className="bg-cyan-600 text-white text-sm font-semibold py-2 px-4 h-11 rounded-lg hover:bg-cyan-700 transition duration-150 shadow-md disabled:bg-gray-400 disabled:shadow-none flex-shrink-0"
            disabled={!customDates.start || !customDates.end}
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
};


// (SummaryCard, ModernSpinner, ChartCard components are unchanged and omitted for brevity)
const SummaryCard = ({ title, value, colorClass, Icon, isLoading }) => {
  const textColor = colorClass.includes('cyan') || colorClass.includes('emerald') || colorClass.includes('indigo') || colorClass.includes('amber')
    ? 'text-white'
    : 'text-gray-900';

  return (
    <div
      className={`${colorClass} rounded-xl p-5 flex items-center justify-between shadow-xl transition duration-300 transform hover:scale-[1.02]`}
    >
      <div className="flex flex-col items-start">
        {isLoading ? (
          <div className="flex items-center mt-1 h-8">
            <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <p className={`text-3xl font-extrabold ${textColor}`}>{value}</p>
        )}
        <p className={`text-base font-semibold ${textColor} mt-0.5 opacity-90`}>{title}</p>
      </div>

      <div
        className={`p-1 rounded-full bg-transparent flex-shrink-0`}
      >
        <Icon className={`w-10 h-10 ${textColor}`} />
      </div>
    </div>
  );
};

const ModernSpinner = ({ size = "w-8 h-8", color = "border-cyan-500" }) => (
  <div className="flex justify-center items-center py-12">
    <div
      className={`${size} border-4 ${color} border-t-transparent rounded-full animate-spin`}
    />
  </div>
);

const ChartCard = ({ title, children, isLoading, isEmpty }) => (
  <div className="bg-white p-7 rounded-2xl shadow-xl border border-gray-100 h-full">
    <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b border-cyan-100 pb-3">
      {title}
    </h2>
    {isLoading ? (
      <ModernSpinner />
    ) : isEmpty ? (
      <div className="text-center py-16 text-gray-400 font-medium">
        <p>😔 No data available to display for this chart.</p>
      </div>
    ) : (
      children
    )}
  </div>
);


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

  const handleApplyCustomRange = () => {
    setApplyTrigger(prev => prev + 1);
  };


  useEffect(() => {
    const token = localStorage.getItem("token");
    const BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const authHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    const handleForbidden = (res) => {
      if (res.status === 403) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return true;
      }
      return false;
    };

    const { startDate, endDate } = getDateRangeParams(selectedRange, customDates);

    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('start_date', startDate);
    if (endDate) queryParams.append('end_date', endDate);
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';

    if (selectedRange === 'custom_range' && (!startDate || !endDate)) {
      setLoadingSummary(false);
      setLoadingBreakdown(false);
      setLoadingAvg(false);
      setLoadingStage(false);
      return;
    }

    const fetchData = async (endpoint, setter, loadingSetter, mapData = (d) => d) => {
      loadingSetter(true);
      try {
        const res = await fetch(`${BASE_URL}/api/v1/crm/dashboard/${endpoint}${query}`, {
          method: "GET",
          headers: authHeaders,
        });

        if (handleForbidden(res)) return;

        const result = await res.json();
        if (result?.status) {
          setter(mapData(result.data));
        }
      } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
      } finally {
        loadingSetter(false);
      }
    };

    fetchData('summary', setSummary, setLoadingSummary, (d) => ([
      { title: "Total Orders", value: d.total_orders, colorClass: "bg-cyan-500", Icon: ShoppingBagIcon },
      { title: "Completed", value: d.completed_orders, colorClass: "bg-emerald-500", Icon: CheckCircleIcon },
      { title: "Avg Delivery Time", value: `${d.avg_delivery_time} mins`, colorClass: "bg-indigo-500", Icon: ClockIcon },
      { title: "Active Pickups", value: d.active_pickups, colorClass: "bg-amber-500", Icon: BoltIcon },
    ]));

    fetchData('breakdown', setBreakdown, setLoadingBreakdown);

    fetchData('avg-delivery', setAvgDeliveryData, setLoadingAvg);

    fetchData('stages', setStageSummary, setLoadingStage, (data) => (
      Array.isArray(data) ? data.map((item) => ({
        stage: item.status,
        orders: item.orders,
        percent: item.percent,
        avg: parseFloat(item.avg_time),
      })) : []
    ));


  }, [selectedRange, applyTrigger]);

  const formatStageLabel = (stage) => {
    if (!stage) return "";
    return stage
      .replace(/[_-]/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900 border-b-4 border-cyan-300 pb-2 inline-block mb-6 sm:mb-0">
          Dashboard
        </h1>

        {/* DATE FILTER WITH CUSTOM RANGE */}
        <DateFilter
          selectedRange={selectedRange}
          setSelectedRange={setSelectedRange}
          customDates={customDates}
          setCustomDates={setCustomDates}
          handleApplyCustomRange={handleApplyCustomRange}
        />
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {(loadingSummary ? Array(4).fill(null) : summary).map((item, index) => (
          <SummaryCard
            key={index}
            title={item?.title || "Loading..."}
            value={item?.value || ""}
            colorClass={item?.colorClass || "bg-gray-400"}
            Icon={item?.Icon || ClockIcon}
            isLoading={loadingSummary}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {/* ORDER BREAKDOWN PIE */}
        <div className="lg:col-span-1">
          <ChartCard
            title="Order Breakdown by Stage"
            isLoading={loadingBreakdown}
            isEmpty={!loadingBreakdown && breakdown.length === 0}
          >
            <div className="w-full h-96 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={breakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={120}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {breakdown.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={VIBRANT_COLORS[index % VIBRANT_COLORS.length]}
                        stroke="#fff"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>

                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #06B6D4",
                      borderRadius: "10px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                    formatter={(value, name) => [
                      value,
                      formatStageLabel(name),
                    ]}
                  />

                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    iconType="circle"
                    formatter={(value) => (
                      <span className="text-gray-700 text-sm font-medium ml-1">
                        {formatStageLabel(value)}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* DAILY AVG DELIVERY CHART */}

   <div className="lg:col-span-2">
          <ChartCard
            title="Average Delivery Time (Daily Trend in Mins)"
            isLoading={loadingAvg}
            isEmpty={!loadingAvg && avgDeliveryData.length === 0}
          >
            <div className="w-full h-96">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={avgDeliveryData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="5 5" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="day"
                    stroke="#6b7280"
                    tickLine={false}
                    padding={{ left: 20, right: 20 }}
                  />
                  <YAxis 
                    stroke="#6b7280" 
                    tickLine={false} 
                    domain={[0, 'auto']} 
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#111827",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                    labelStyle={{ color: "#fff", fontWeight: "bold" }}
                    formatter={(value) => [`${value} mins`, "Avg Time"]}
                  />

                  <defs>
                    <linearGradient id="colorAvgTime" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>

                  <Area
                    type="monotone"
                    dataKey="avgTime"
                    name="Average Time"
                    stroke="#06B6D4"
                    strokeWidth={3}
                    fill="url(#colorAvgTime)"
                    activeDot={{ r: 6, fill: '#06B6D4', stroke: '#fff', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>
      </div>

      {/* STAGE SUMMARY TABLE */}
      <ChartCard
        title="Stage-wise Summary"
        isLoading={loadingStage}
        isEmpty={!loadingStage && stageSummary.length === 0}
      >
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-cyan-50">
              <tr>
                <th className="py-4 px-6 text-left text-sm font-bold text-cyan-700 uppercase tracking-wider">
                  Stage
                </th>
                <th className="py-4 px-6 text-left text-sm font-bold text-cyan-700 uppercase tracking-wider">
                  Orders
                </th>
                <th className="py-4 px-6 text-left text-sm font-bold text-cyan-700 uppercase tracking-wider">
                  Percentage
                </th>
                <th className="py-4 px-6 text-left text-sm font-bold text-cyan-700 uppercase tracking-wider">
                  Avg Time (hrs)
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-100">
              {stageSummary.map((row, index) => (
                <tr
                  key={index}
                  className="hover:bg-cyan-50 transition duration-150"
                >
                  <td className="py-4 px-6 text-sm font-semibold text-gray-900">
                    {formatStageLabel(row.stage)}
                  </td>
                  <td className="py-4 px-6 text-base font-medium text-gray-700">
                    {row.orders}
                  </td>
                  <td className="py-4 px-6 text-base font-medium text-gray-700">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                      {row.percent}%
                    </span>
                  </td>
                  <td className="py-4 px-6 text-base font-medium text-gray-700">
                    {row.avg.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </>
  );
};

export default Dashboard;