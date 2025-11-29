import React, { useState, useEffect } from "react";
import Select from "react-select";
import { saveAs } from "file-saver";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import moment from "moment";

const Reports = () => {
  const [orders, setOrders] = useState([]);

  // Filters
  const [status, setStatus] = useState(null);
  const [location, setLocation] = useState(null);
  const [partner, setPartner] = useState(null);
  const [shift, setShift] = useState(null);
  const [date, setDate] = useState("");

  // Dropdown options (dynamic options)
  const [locationOptions, setLocationOptions] = useState([]);
  const [partnerOptions, setPartnerOptions] = useState([]);

  // Status filter (Frontend labels → Backend mapping handled in API)
  const statusOptions = [
    { value: "Requested", label: "Requested" },
    { value: "Picked-Up", label: "Picked-Up" },
    { value: "In Progress", label: "In Progress" },
    { value: "Delivered", label: "Delivered" },
    { value: "Cancelled", label: "Cancelled" },
  ];

  const shiftOptions = [
    { value: "Morning", label: "Morning" },
    { value: "Afternoon", label: "Afternoon" },
    { value: "Evening", label: "Evening" },
  ];

  // 🔥 Fetch Reports with backend filtering
  const fetchReports = () => {
    const token = localStorage.getItem("token");

    const params = new URLSearchParams();
    if (status) params.append("status", status.value);
    if (location) params.append("location", location.value);
    if (partner) params.append("partner", partner.value);
    if (shift) params.append("shift", shift.value);
    if (date) params.append("date", date);

    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/crm/reports/orders?${params.toString()}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then(async (res) => {
        if (res.status === 403) {
          localStorage.removeItem("token");
          window.location.href = "/login";
          return;
        }
        return res.json();
      })
      .then((data) => {
        if (!data?.status) return;

        setOrders(data.data);

        // Auto-populate dynamic dropdowns
        const uniqueLocations = [
          ...new Set(data.data.map((o) => o.location.split(" - ")[0])),
        ].map((loc) => ({ value: loc, label: loc }));

        const uniquePartners = [
          ...new Set(data.data.map((o) => o.partner)),
        ].map((p) => ({ value: p, label: p }));

        setLocationOptions(uniqueLocations);
        setPartnerOptions(uniquePartners);
      })
      .catch(console.error);
  };

  // Re-fetch whenever filters change
  useEffect(() => {
    fetchReports();
  }, [status, location, partner, shift, date]);

  // 🔁 Reset Filters
  const resetFilters = () => {
    setStatus(null);
    setLocation(null);
    setPartner(null);
    setShift(null);
    setDate("");
  };

  // ----------------------------------------------------
  // 📊 Summary Metrics
  // ----------------------------------------------------
  const totalOrders = orders.length;
  const completedOrders = orders.filter((o) => o.status === "completed").length;
  const activeDeliveries = orders.filter((o) => o.status !== "completed").length;

  const avgDeliveryTime =
    orders.reduce((acc, o) => acc + (o.deliveryTime || 0), 0) /
    (orders.length || 1);

  // ----------------------------------------------------
  // 📤 Export Buttons
  // ----------------------------------------------------
  const handleExportCSV = () => {
    const csv = Papa.unparse(orders);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "reports.csv");
  };

  const handleExportXLSX = () => {
    const worksheet = XLSX.utils.json_to_sheet(orders);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reports");
    XLSX.writeFile(workbook, "reports.xlsx");
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Reports</h2>

      {/* Filters */}
      <div className="grid grid-cols-6 gap-4 mb-6">

        <Select
          options={statusOptions}
          value={status}
          onChange={setStatus}
          placeholder="Status"
        />

        <Select
          options={locationOptions}
          value={location}
          onChange={setLocation}
          placeholder="Location"
        />

        <Select
          options={partnerOptions}
          value={partner}
          onChange={setPartner}
          placeholder="Partner"
        />

        <Select
          options={shiftOptions}
          value={shift}
          onChange={setShift}
          placeholder="Shift"
        />

        <input
          type="date"
          className="border rounded p-2"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        {/* Reset Button */}
        <button
          onClick={resetFilters}
          className="border px-4 py-2 rounded-lg hover:bg-gray-100 text-sm"
        >
          Clear Filters
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-100 p-4 rounded-lg text-center">
          <h3 className="text-lg font-medium">Total Orders</h3>
          <p className="text-2xl font-bold">{totalOrders}</p>
        </div>

        <div className="bg-green-100 p-4 rounded-lg text-center">
          <h3 className="text-lg font-medium">Completed</h3>
          <p className="text-2xl font-bold">{completedOrders}</p>
        </div>

        <div className="bg-yellow-100 p-4 rounded-lg text-center">
          <h3 className="text-lg font-medium">Avg Delivery Time</h3>
          <p className="text-2xl font-bold">{avgDeliveryTime.toFixed(1)} hrs</p>
        </div>

        <div className="bg-red-100 p-4 rounded-lg text-center">
          <h3 className="text-lg font-medium">Active Deliveries</h3>
          <p className="text-2xl font-bold">{activeDeliveries}</p>
        </div>
      </div>

      {/* Table */}
      <table className="min-w-full bg-white rounded-lg shadow">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-3">S.No</th>
            <th className="p-3">Order ID</th>
            <th className="p-3">Status</th>
            <th className="p-3">Location</th>
            <th className="p-3">Partner</th>
            <th className="p-3">Date</th>
            <th className="p-3">Shift</th>
            <th className="p-3">Delivery Time (hrs)</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o, index) => (
            <tr key={o.id} className="border-t hover:bg-gray-50">
              <td className="p-3">{index + 1}</td>
              <td className="p-3">{o.id}</td>
              <td className="p-3">{o.status}</td>
              <td className="p-3">{o.location}</td>
              <td className="p-3">{o.partner}</td>
              <td className="p-3">{moment(o.date).format("YYYY-MM-DD")}</td>
              <td className="p-3">{o.shift ? o.shift : 'NA'}</td>
              <td className="p-3">{moment(o.deliveryTime).format("YYYY-MM-DD hh:mm:ss A")}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Export Buttons */}
      <div className="mt-6 flex gap-4">
        <button
          onClick={handleExportCSV}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Export CSV
        </button>

        <button
          onClick={handleExportXLSX}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Export XLSX
        </button>
      </div>
    </div>
  );
};

export default Reports;
