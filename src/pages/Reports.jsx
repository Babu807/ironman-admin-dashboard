// src/pages/Reports.jsx
import React, { useState, useMemo } from "react";
import Select from "react-select";
import { saveAs } from "file-saver";
import Papa from "papaparse";
import * as XLSX from "xlsx";

const mockOrders = [
  {
    id: 1,
    status: "Delivered",
    location: "Downtown",
    partner: "IronPro",
    date: "2025-10-25",
    shift: "Morning",
    deliveryTime: 2.1,
  },
  {
    id: 2,
    status: "In Progress",
    location: "Uptown",
    partner: "QuickWash",
    date: "2025-10-25",
    shift: "Evening",
    deliveryTime: 4.3,
  },
  {
    id: 3,
    status: "Picked-Up",
    location: "Downtown",
    partner: "IronPro",
    date: "2025-10-26",
    shift: "Morning",
    deliveryTime: 1.5,
  },
  {
    id: 4,
    status: "Requested",
    location: "Suburb",
    partner: "SpeedyClean",
    date: "2025-10-26",
    shift: "Evening",
    deliveryTime: 0,
  },
];

const statusOptions = [
  { value: "Requested", label: "Requested" },
  { value: "Picked-Up", label: "Picked-Up" },
  { value: "In Progress", label: "In Progress" },
  { value: "Delivered", label: "Delivered" },
];

const locationOptions = [
  { value: "Downtown", label: "Downtown" },
  { value: "Uptown", label: "Uptown" },
  { value: "Suburb", label: "Suburb" },
];

const partnerOptions = [
  { value: "IronPro", label: "IronPro" },
  { value: "QuickWash", label: "QuickWash" },
  { value: "SpeedyClean", label: "SpeedyClean" },
];

const shiftOptions = [
  { value: "Morning", label: "Morning" },
  { value: "Evening", label: "Evening" },
];

const Reports = () => {
  const [status, setStatus] = useState(null);
  const [location, setLocation] = useState(null);
  const [partner, setPartner] = useState(null);
  const [shift, setShift] = useState(null);
  const [date, setDate] = useState("");

  // Filtered Data
  const filteredData = useMemo(() => {
    return mockOrders.filter((order) => {
      return (
        (!status || order.status === status.value) &&
        (!location || order.location === location.value) &&
        (!partner || order.partner === partner.value) &&
        (!shift || order.shift === shift.value) &&
        (!date || order.date === date)
      );
    });
  }, [status, location, partner, shift, date]);

  const totalOrders = filteredData.length;
  const completedOrders = filteredData.filter(
    (o) => o.status === "Delivered"
  ).length;
  const avgDeliveryTime =
    filteredData.reduce((acc, o) => acc + o.deliveryTime, 0) /
    (filteredData.length || 1);
  const activeDeliveries = filteredData.filter(
    (o) => o.status !== "Delivered"
  ).length;

  const handleExportCSV = () => {
    const csv = Papa.unparse(filteredData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "reports.csv");
  };

  const handleExportXLSX = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reports");
    XLSX.writeFile(workbook, "reports.xlsx");
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Reports</h2>

      {/* Filters */}
      <div className="grid grid-cols-5 gap-4 mb-6">
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
      </div>

      {/* Summary Metrics */}
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
          {filteredData.map((order) => (
            <tr key={order.id} className="border-t hover:bg-gray-50">
              <td className="p-3">{order.id}</td>
              <td className="p-3">{order.status}</td>
              <td className="p-3">{order.location}</td>
              <td className="p-3">{order.partner}</td>
              <td className="p-3">{order.date}</td>
              <td className="p-3">{order.shift}</td>
              <td className="p-3">{order.deliveryTime}</td>
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
