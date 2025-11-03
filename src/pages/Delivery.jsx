import React, { useState, useMemo } from "react";

const Delivery = () => {
  const [filters, setFilters] = useState({
    route: "",
    partner: "",
    shift: "",
  });

  const [shiftConfig] = useState([
    { name: "Morning", start: "6:00 AM", end: "12:00 PM" },
    { name: "Afternoon", start: "12:00 PM", end: "6:00 PM" },
    { name: "Evening", start: "6:00 PM", end: "11:59 PM" },
  ]);

  const orders = [
    {
      id: "ORD-001",
      customer: "Arun Kumar",
      location: "Coimbatore - East",
      route: "Route 1",
      partner: "John Doe",
      deliveryTime: "10:30 AM",
      shift: "Morning",
      status: "On Time",
    },
    {
      id: "ORD-002",
      customer: "Sneha Raj",
      location: "Chennai - South",
      route: "Route 2",
      partner: "Ravi Kumar",
      deliveryTime: "2:15 PM",
      shift: "Afternoon",
      status: "Delayed",
    },
    {
      id: "ORD-003",
      customer: "Mohan",
      location: "Bangalore - North",
      route: "Route 1",
      partner: "Asha Singh",
      deliveryTime: "5:45 PM",
      shift: "Evening",
      status: "On Time",
    },
    {
      id: "ORD-004",
      customer: "Priya",
      location: "Coimbatore - West",
      route: "Route 1",
      partner: "John Doe",
      deliveryTime: "8:30 AM",
      shift: "Morning",
      status: "On Time",
    },
  ];

  // ✅ Filter orders based on selected filters
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      return (
        (filters.route === "" || order.route === filters.route) &&
        (filters.partner === "" || order.partner === filters.partner) &&
        (filters.shift === "" || order.shift === filters.shift)
      );
    });
  }, [filters, orders]);

  // ✅ Group orders by shift
  const shiftSummary = useMemo(() => {
    return shiftConfig.map((shift) => {
      const shiftOrders = filteredOrders.filter((o) => o.shift === shift.name);
      const partners = [...new Set(shiftOrders.map((o) => o.partner))];
      return {
        shift: shift.name,
        time: `${shift.start} - ${shift.end}`,
        count: shiftOrders.length,
        partners,
      };
    });
  }, [filteredOrders, shiftConfig]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-2">Daily Delivery Overview</h1>
      <p className="text-gray-600 mb-6">Deliveries scheduled for today</p>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <select
          className="border p-2 rounded-lg"
          value={filters.route}
          onChange={(e) => setFilters({ ...filters, route: e.target.value })}
        >
          <option value="">All Routes</option>
          <option value="Route 1">Route 1</option>
          <option value="Route 2">Route 2</option>
        </select>

        <select
          className="border p-2 rounded-lg"
          value={filters.partner}
          onChange={(e) => setFilters({ ...filters, partner: e.target.value })}
        >
          <option value="">All Partners</option>
          <option value="John Doe">John Doe</option>
          <option value="Ravi Kumar">Ravi Kumar</option>
          <option value="Asha Singh">Asha Singh</option>
        </select>

        <select
          className="border p-2 rounded-lg"
          value={filters.shift}
          onChange={(e) => setFilters({ ...filters, shift: e.target.value })}
        >
          <option value="">All Shifts</option>
          <option value="Morning">Morning</option>
          <option value="Afternoon">Afternoon</option>
          <option value="Evening">Evening</option>
        </select>
      </div>

      {/* Shift Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {shiftSummary.map((s) => (
          <div
            key={s.shift}
            className="border rounded-2xl shadow-sm bg-gray-50 p-4 flex flex-col justify-between"
          >
            <div>
              <h2 className="text-lg font-semibold text-gray-800">{s.shift} Shift</h2>
              <p className="text-sm text-gray-500 mb-2">{s.time}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Orders:</span> {s.count}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <span className="font-medium">Partners:</span>{" "}
                {s.partners.length > 0 ? s.partners.join(", ") : "—"}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Delivery Table */}
      <div className="bg-white rounded-2xl shadow p-4">
        {filteredOrders.length === 0 ? (
          <p className="text-gray-500 text-sm">No deliveries match your filters.</p>
        ) : (
          <table className="min-w-full border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                {[
                  "Order ID",
                  "Customer",
                  "Location",
                  "Route",
                  "Partner",
                  "Delivery Time",
                  "Shift",
                  "Status",
                ].map((col) => (
                  <th
                    key={col}
                    className="py-3 px-4 text-left text-sm font-semibold text-gray-700 border-b"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  className={`hover:bg-gray-50 ${order.status === "Delayed" ? "bg-red-50" : "bg-white"
                    }`}
                >
                  <td className="py-3 px-4 border-b text-sm font-medium text-gray-800">
                    {order.id}
                  </td>
                  <td className="py-3 px-4 border-b text-sm">{order.customer}</td>
                  <td className="py-3 px-4 border-b text-sm">{order.location}</td>
                  <td className="py-3 px-4 border-b text-sm">{order.route}</td>
                  <td className="py-3 px-4 border-b text-sm">{order.partner}</td>
                  <td className="py-3 px-4 border-b text-sm">{order.deliveryTime}</td>
                  <td className="py-3 px-4 border-b text-sm">{order.shift}</td>
                  <td
                    className={`py-3 px-4 border-b text-sm font-semibold ${order.status === "Delayed" ? "text-red-600" : "text-green-600"
                      }`}
                  >
                    {order.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Delivery;
