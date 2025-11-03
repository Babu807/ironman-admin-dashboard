import React from "react";
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

const Dashboard = () => {
  const stats = [
    { title: "Total Orders", value: 1200, color: "bg-blue-500" },
    { title: "Completed", value: 980, color: "bg-green-500" },
    { title: "Avg Delivery Time", value: "2.3 hrs", color: "bg-indigo-500" },
    { title: "Active Pickups", value: 150, color: "bg-yellow-500" },
  ];

  const breakdownData = [
    { name: "Requested", value: 180 },
    { name: "Picked-up", value: 250 },
    { name: "In-progress", value: 300 },
    { name: "Ready for Delivery", value: 220 },
    { name: "Delivered", value: 250 },
  ];

  const COLORS = ["#60A5FA", "#34D399", "#FBBF24", "#6366F1", "#EF4444"];

  const avgDeliveryData = [
    { day: "Mon", avgTime: 2.5 },
    { day: "Tue", avgTime: 2.1 },
    { day: "Wed", avgTime: 2.9 },
    { day: "Thu", avgTime: 2.2 },
    { day: "Fri", avgTime: 1.8 },
    { day: "Sat", avgTime: 2.4 },
    { day: "Sun", avgTime: 2.0 },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Dashboard Overview</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((item, index) => (
          <div
            key={index}
            className={`${item.color} text-white rounded-2xl shadow-lg p-5 flex flex-col justify-between`}
          >
            <h2 className="text-lg font-medium">{item.title}</h2>
            <p className="text-3xl font-bold mt-2">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Order Breakdown */}
      <div className="bg-white rounded-2xl shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">
          Order Breakdown by Stage
        </h2>
        <div className="w-full h-80">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={breakdownData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
                label={({ name }) => name}
              >
                {breakdownData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Average Delivery Time Trend */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">
          Average Delivery Time (Daily Trend)
        </h2>
        <div className="w-full h-80">
          <ResponsiveContainer>
            <LineChart data={avgDeliveryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis label={{ value: "Hours", angle: -90, position: "insideLeft" }} />
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
      </div>

      {/* Stage-wise Summary Table */}
      <div className="bg-white rounded-2xl shadow p-6 mt-8">
        <h2 className="text-xl font-semibold mb-4">Stage-wise Summary</h2>
        <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 border-b">
                Stage
              </th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 border-b">
                Orders
              </th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 border-b">
                Percentage
              </th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 border-b">
                Avg Time (hrs)
              </th>
            </tr>
          </thead>
          <tbody>
            {[
              { stage: "Requested", orders: 180, percent: "15%", avg: 1.2 },
              { stage: "Picked-up", orders: 250, percent: "21%", avg: 1.8 },
              { stage: "In-progress", orders: 300, percent: "25%", avg: 2.4 },
              { stage: "Ready for Delivery", orders: 220, percent: "18%", avg: 1.6 },
              { stage: "Delivered", orders: 250, percent: "21%", avg: 2.1 },
            ].map((row, index) => (
              <tr
                key={index}
                className={`hover:bg-gray-50 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
              >
                <td className="py-3 px-4 text-sm text-gray-800 border-b">
                  {row.stage}
                </td>
                <td className="py-3 px-4 text-sm text-gray-800 border-b">
                  {row.orders}
                </td>
                <td className="py-3 px-4 text-sm text-gray-800 border-b">
                  {row.percent}
                </td>
                <td className="py-3 px-4 text-sm text-gray-800 border-b">
                  {row.avg}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default Dashboard;
