import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const Locations = () => {
  // 🔹 Dummy location data
  const [locationData] = useState([
    {
      region: "South India",
      states: [
        {
          name: "Tamil Nadu",
          cities: [
            {
              name: "Chennai",
              hubs: [
                { name: "Hub 1", orders: 220, avgTime: 18 },
                { name: "Hub 2", orders: 180, avgTime: 25 },
              ],
            },
            {
              name: "Coimbatore",
              hubs: [
                { name: "Hub 1", orders: 140, avgTime: 20 },
                { name: "Hub 2", orders: 100, avgTime: 22 },
              ],
            },
          ],
        },
      ],
    },
    {
      region: "North India",
      states: [
        {
          name: "Delhi",
          cities: [
            {
              name: "Delhi City",
              hubs: [
                { name: "Hub 1", orders: 300, avgTime: 15 },
                { name: "Hub 2", orders: 260, avgTime: 19 },
              ],
            },
          ],
        },
      ],
    },
  ]);

  // 🔹 For chart summary
  const chartData = [
    { name: "Chennai Hub 1", orders: 220, avgTime: 18 },
    { name: "Chennai Hub 2", orders: 180, avgTime: 25 },
    { name: "Coimbatore Hub 1", orders: 140, avgTime: 20 },
    { name: "Delhi Hub 1", orders: 300, avgTime: 15 },
    { name: "Delhi Hub 2", orders: 260, avgTime: 19 },
  ];

  // 🔹 Helper for summary
  const totalOrders = chartData.reduce((acc, l) => acc + l.orders, 0);
  const avgDelivery =
    chartData.reduce((acc, l) => acc + l.avgTime, 0) / chartData.length;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-2">Geographical Performance Overview</h1>
      <p className="text-gray-600 mb-6">
        View order performance by geography and identify delivery bottlenecks.
      </p>

      {/* 🔹 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
          <h3 className="text-sm text-gray-600">Total Orders</h3>
          <p className="text-2xl font-semibold text-blue-600">{totalOrders}</p>
        </div>
        <div className="bg-green-50 border border-green-100 p-4 rounded-xl">
          <h3 className="text-sm text-gray-600">Avg Delivery Time</h3>
          <p className="text-2xl font-semibold text-green-600">
            {avgDelivery.toFixed(1)} min
          </p>
        </div>
        <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-xl">
          <h3 className="text-sm text-gray-600">Completed Deliveries</h3>
          <p className="text-2xl font-semibold text-yellow-600">
            {Math.round(totalOrders * 0.92)}
          </p>
        </div>
        <div className="bg-red-50 border border-red-100 p-4 rounded-xl">
          <h3 className="text-sm text-gray-600">Delayed Deliveries</h3>
          <p className="text-2xl font-semibold text-red-600">
            {Math.round(totalOrders * 0.08)}
          </p>
        </div>
      </div>

      {/* 🔹 Drill-down Table */}
      <div className="bg-white rounded-2xl shadow p-4 mb-8">
        {locationData.map((region) => (
          <div key={region.region} className="mb-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              {region.region}
            </h2>
            {region.states.map((state) => (
              <div key={state.name} className="ml-4 mb-2">
                <h3 className="text-md font-medium text-gray-700">{state.name}</h3>
                {state.cities.map((city) => (
                  <div key={city.name} className="ml-6 mb-1">
                    <p className="text-sm font-semibold text-gray-600">{city.name}</p>
                    <table className="w-full text-sm border mt-1 mb-3">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="p-2 text-left">Hub</th>
                          <th className="p-2 text-left">Orders</th>
                          <th className="p-2 text-left">Avg Delivery Time (min)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {city.hubs.map((hub) => (
                          <tr key={hub.name} className="border-t hover:bg-gray-50">
                            <td className="p-2">{hub.name}</td>
                            <td className="p-2">{hub.orders}</td>
                            <td
                              className={`p-2 font-medium ${
                                hub.avgTime < 20
                                  ? "text-green-600"
                                  : hub.avgTime < 25
                                  ? "text-yellow-600"
                                  : "text-red-600"
                              }`}
                            >
                              {hub.avgTime}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* 🔹 Chart */}
      <div className="bg-white rounded-2xl shadow p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Orders vs Avg Delivery Time
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" orientation="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="orders" fill="#3B82F6" name="Orders" />
            <Bar yAxisId="right" dataKey="avgTime" fill="#F59E0B" name="Avg Time (min)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Locations;
