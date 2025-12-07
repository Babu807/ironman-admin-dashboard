import React, { useState, useMemo, useEffect } from "react";

const Delivery = () => {
  const [filters, setFilters] = useState({
    partner: "",
    shift: "",
  });

  const [orders, setOrders] = useState([]);
  const [shiftConfig, setShiftConfig] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  // ---------------------------
  // 📌 Fetch Delivery Orders API
  // ---------------------------
  useEffect(() => {
    const token = localStorage.getItem("token");

    setLoading(true);

    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/crm/delivery/orders`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
    })
      .then(async (res) => {
        // 🔐 Handle expired/invalid token
        if (res.status === 403) {
          localStorage.removeItem("token");
          window.location.href = "/login";
          return;
        }

        return res.json();
      })
      .then((data) => {
        if (!data || !data.status) {
          console.error("Error loading delivery data");
          return;
        }

        // Extract API data        
        setOrders(data.data.orders || []);
        setShiftConfig(data.data.shifts || []);
        setPartners(data.data.partners || []);

        setLoading(false);
      })
      .catch((err) => {
        console.error("Delivery fetch error:", err);
        setLoading(false);
      });
  }, []);

  // ---------------------------
  // 🔎 Filter orders
  // ---------------------------
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      return (
        (filters.partner === "" || order.partner === filters.partner) &&
        (filters.shift === "" || order.shift === filters.shift)
      );
    });
  }, [filters, orders]);

  // ---------------------------
  // 🧮 Shift Summary
  // ---------------------------
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

      {/* LOADING STATE */}
      {loading && (
        <p className="text-gray-500 text-sm">Loading delivery details...</p>
      )}

      {!loading && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <select
              className="border p-2 rounded-lg"
              value={filters.partner}
              onChange={(e) =>
                setFilters({ ...filters, partner: e.target.value })
              }
            >
              <option value="">All Partners</option>
              {partners.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>

            <select
              className="border p-2 rounded-lg"
              value={filters.shift}
              onChange={(e) =>
                setFilters({ ...filters, shift: e.target.value })
              }
            >
              <option value="">All Shifts</option>
              {shiftConfig.map((shift) => (
                <option key={shift.name} value={shift.name}>
                  {shift.name}
                </option>
              ))}
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
                  <h2 className="text-lg font-semibold text-gray-800">
                    {s.shift} Shift
                  </h2>
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
              <p className="text-gray-500 text-sm">
                No deliveries match your filters.
              </p>
            ) : (
              <table className="min-w-full border border-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    {[
                      "Order ID",
                      "Customer",
                      // "Location",
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
                      className={`hover:bg-gray-50 ${
                        order.status === "Delayed"
                          ? "bg-red-50"
                          : "bg-white"
                      }`}
                    >
                      <td className="py-3 px-4 border-b text-sm font-medium text-gray-800">
                        {order.order_number}
                      </td>
                      <td className="py-3 px-4 border-b text-sm">
                        {order.customer}
                      </td>
                      {/* <td className="py-3 px-4 border-b text-sm">
                        {order.location}
                      </td> */}
                      <td className="py-3 px-4 border-b text-sm">
                        {order.partner}
                      </td>
                      <td className="py-3 px-4 border-b text-sm">
                        {order.deliveryTime}
                      </td>
                      <td className="py-3 px-4 border-b text-sm">
                        {order.shift}
                      </td>
                      <td
                        className={`py-3 px-4 border-b text-sm font-semibold ${
                          order.status === "Delayed"
                            ? "text-red-600"
                            : "text-green-600"
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
        </>
      )}
    </div>
  );
};

export default Delivery;
