import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const COLORS = ["#60A5FA", "#34D399", "#FBBF24", "#6366F1", "#EF4444"];

const Dashboard = () => {
  // API states
  const [summary, setSummary] = useState([]);
  const [breakdown, setBreakdown] = useState([]);
  const [avgDeliveryData, setAvgDeliveryData] = useState([]);
  const [stageSummary, setStageSummary] = useState([]);

  // Loading states
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingBreakdown, setLoadingBreakdown] = useState(true);
  const [loadingAvg, setLoadingAvg] = useState(true);
  const [loadingStage, setLoadingStage] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    // Summary Cards API
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/crm/dashboard/summary`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (res.status === 403) {
          localStorage.removeItem("token");
          window.location.href = "/ironman-admin-dashboard/login";
          return;
        }
        return res.json();
      })
      .then((result) => {
        if (!result || !result.status) return;

        const d = result.data;

        setSummary([
          { title: "Total Orders", value: d.total_orders, color: "bg-blue-500" },
          { title: "Completed", value: d.completed_orders, color: "bg-green-500" },
          { title: "Avg Delivery Time", value: `${d.avg_delivery_time} mins`, color: "bg-indigo-500" },
          { title: "Active Pickups", value: d.active_pickups, color: "bg-yellow-500" },
        ]);

        setLoadingSummary(false);
      })
      .catch(() => setLoadingSummary(false));

    // Order Breakdown Pie API
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/crm/dashboard/breakdown`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (res.status === 403) {
          localStorage.removeItem("token");
          window.location.href = "/ironman-admin-dashboard/login";
          return;
        }
        return res.json();
      })
      .then((result) => {
        if (!result || !result.status) return;
        setBreakdown(result.data);
        setLoadingBreakdown(false);
      })
      .catch(() => setLoadingBreakdown(false));

    // Avg Delivery API
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/crm/dashboard/avg-delivery`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (res.status === 403) {
          localStorage.removeItem("token");
          window.location.href = "/ironman-admin-dashboard/login";
          return;
        }
        return res.json();
      })
      .then((data) => {
        setAvgDeliveryData(data.data);
        setLoadingAvg(false);
      });

    // Stage Summary API
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/crm/dashboard/stages`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then(async (res) => {
        if (res.status === 403) {
          localStorage.removeItem("token");
          window.location.href = "/ironman-admin-dashboard/login";
          return;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.status && Array.isArray(data.data)) {
          setStageSummary(
            data.data.map((item) => ({
              stage: item.status,
              orders: item.orders,
              percent: `${item.percent}%`,
              avg: parseFloat(item.avg_time),
            }))
          );
        }
        setLoadingStage(false);
      })
      .catch((err) => {
        console.error("Stage Summary Fetch Error:", err);
        setLoadingStage(false);
      });
  }, []);


  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Dashboard Overview</h1>

      {/* SUMMARY CARDS */}
      {loadingSummary ? (
        <div className="text-center py-8 text-gray-500">Loading summary...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {summary.map((item, index) => (
            <div
              key={index}
              className={`${item.color} text-white rounded-2xl shadow-lg p-5`}
            >
              <h2 className="text-lg font-medium">{item.title}</h2>
              <p className="text-3xl font-bold mt-2">{item.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* ORDER BREAKDOWN PIE */}
      <div className="bg-white rounded-2xl shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">
          Order Breakdown by Stage
        </h2>

        {loadingBreakdown ? (
          <div className="text-center py-10 text-gray-500">Loading chart...</div>
        ) : breakdown.length === 0 ? (
          <div className="text-center py-10 text-gray-400">No data available</div>
        ) : (
          <div className="w-full h-80">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={breakdown}
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  dataKey="value"
                  label={({ name }) => name}
                >
                  {breakdown.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* DAILY AVG DELIVERY CHART */}
      <div className="bg-white rounded-2xl shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">
          Average Delivery Time (Daily Trend)
        </h2>

        {loadingAvg ? (
          <div className="text-center py-10 text-gray-500">Loading graph...</div>
        ) : avgDeliveryData.length === 0 ? (
          <div className="text-center text-gray-400">No data to display</div>
        ) : (
          <div className="w-full h-80">
            <ResponsiveContainer>
              <LineChart data={avgDeliveryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="avgTime"
                  stroke="#6366F1"
                  strokeWidth={3}
                  dot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* STAGE SUMMARY TABLE */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Stage-wise Summary</h2>

        {loadingStage ? (
          <div className="text-center py-10 text-gray-500">Loading summary...</div>
        ) : stageSummary.length === 0 ? (
          <div className="text-center py-10 text-gray-400">No stage data</div>
        ) : (
          <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left">Stage</th>
                <th className="py-3 px-4 text-left">Orders</th>
                <th className="py-3 px-4 text-left">Percentage</th>
                <th className="py-3 px-4 text-left">Avg Time (hrs)</th>
              </tr>
            </thead>

            <tbody>
              {stageSummary.map((row, index) => (
                <tr
                  key={index}
                  className={`${index % 2 ? "bg-gray-50" : "bg-white"} hover:bg-gray-100`}
                >
                  <td className="py-3 px-4">{row.stage}</td>
                  <td className="py-3 px-4">{row.orders}</td>
                  <td className="py-3 px-4">{row.percent}%</td>
                  <td className="py-3 px-4">{row.avg}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
