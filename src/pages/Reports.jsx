import React, { useEffect, useState } from "react";
import Select from "react-select";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import moment from "moment";

const Reports = () => {
  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);

  // Filters
  const [status, setStatus] = useState(null);
  const [hubStatus, setHubStatus] = useState(null);
  const [date, setDate] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const limit = 10;

  const statusOptions = [
    { value: "Requested", label: "Requested" },
    { value: "Picked-Up", label: "Picked-Up" },
    { value: "In Progress", label: "In Progress" },
    { value: "Delivered", label: "Delivered" },
    { value: "Cancelled", label: "Cancelled" },
  ];

  const hubStatusOptions = [
    { value: "ASSIGNED_TO_PICKUP", label: "Assigned to Pickup" },
    { value: "PICKED_UP", label: "Picked Up" },
    { value: "PROCESSING", label: "Processing" },
  ];

  const isFilterActive = status || hubStatus || date || search;

  // ✅ Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // ✅ Fetch data
  const fetchReports = () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    const params = new URLSearchParams();

    if (status) params.append("status", status.value);
    if (hubStatus) params.append("hubStatus", hubStatus.value);
    if (date) params.append("date", date);
    if (debouncedSearch) params.append("search", debouncedSearch);
    params.append("page", page);
    params.append("limit", limit);

    fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/v1/crm/reports/orders?${params}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then((res) => res.json())
      .then((data) => {
        setOrders(data.data || []);
        setSummary(data.summary || null);
        setPagination(data.meta || null);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReports();
  }, [status, hubStatus, date, debouncedSearch, page]);

  useEffect(() => {
    setPage(1);
  }, [status, hubStatus, date, debouncedSearch]);

  // ✅ Clear filters
  const clearFilters = () => {
    setStatus(null);
    setHubStatus(null);
    setDate("");
    setSearch("");
    setPage(1);
  };

  // ✅ Export helpers
  const buildExportUrl = (type) => {
    const params = new URLSearchParams();
    if (status) params.append("status", status.value);
    if (hubStatus) params.append("hubStatus", hubStatus.value);
    if (date) params.append("date", date);
    if (debouncedSearch) params.append("search", debouncedSearch);
    params.append("exportType", type);

    return `${import.meta.env.VITE_API_BASE_URL}/api/v1/crm/reports/orders?${params}`;
  };

  const formatExportData = (data) =>
    data.map((o, index) => ({
      sno: index + 1,
      order_id: o.id,
      order_number: o.order_number,
      status: o.status,
      hub_status: o.hubStatus,
      partner: o.partner,
      delivery_date: o.date,
      delivery_time_hours: o.deliveryTime,
    }));

  const exportCSV = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(buildExportUrl("csv"), {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    const csv = Papa.unparse(formatExportData(data.data));
    saveAs(new Blob([csv], { type: "text/csv;charset=utf-8;" }), "orders-report.csv");
  };

  const exportXLSX = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(buildExportUrl("xlsx"), {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    const worksheet = XLSX.utils.json_to_sheet(formatExportData(data.data));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reports");
    XLSX.writeFile(workbook, "orders-report.xlsx");
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Reports</h2>

      {/* FILTERS */}
      <div className="bg-white border rounded-lg p-4 mb-6">
        <div className="grid grid-cols-12 gap-4 mb-4">
          <div className="col-span-2">
            <Select options={statusOptions} value={status} onChange={setStatus} placeholder="Status" />
          </div>

          <div className="col-span-2">
            <Select options={hubStatusOptions} value={hubStatus} onChange={setHubStatus} placeholder="Hub Status" />
          </div>

          <div className="col-span-2">
            <input
              type="date"
              className="w-full border rounded p-2"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="col-span-6">
            <input
              type="text"
              placeholder="Search by Order ID or Partner"
              className="w-full border rounded p-2"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            disabled={!isFilterActive}
            onClick={clearFilters}
            className={`px-4 py-2 rounded-md text-sm border ${!isFilterActive ? "text-gray-400 cursor-not-allowed" : "hover:bg-gray-100"
              }`}
          >
            Clear Filters
          </button>

          <button onClick={exportCSV} className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm">
            Export CSV
          </button>

          <button onClick={exportXLSX} className="bg-green-600 text-white px-4 py-2 rounded-md text-sm">
            Export XLSX
          </button>
        </div>
      </div>

      {/* LOADER */}
      {loading && (
        <div className="py-8 flex justify-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
        </div>
      )}

      {!loading && (
        <>
          {/* SUMMARY */}
          {summary && (
            <div className="grid grid-cols-4 gap-4 mb-6">
              <SummaryCard
                title="Total Orders"
                value={summary.totalOrders}
                color="blue"
                loading={loading}
              />
              <SummaryCard
                title="Completed"
                value={summary.completed}
                color="green"
                loading={loading}
              />
              <SummaryCard
                title="Avg Delivery Time"
                value={`${summary.avgDeliveryTime} hrs`}
                color="yellow"
                loading={loading}
              />
              <SummaryCard
                title="Active Deliveries"
                value={summary.active}
                color="red"
                loading={loading}
              />
            </div>
          )}

          {/* TABLE */}
          <table className="min-w-full bg-white shadow rounded">
            <thead className="bg-gray-100">
              <tr>
                {["#", "Order ID", "Order Number", "Status", "Hub Status", "Partner", "Date", "Delivery Time (hrs)"]
                  .map((h) => (
                    <th key={h} className="p-3 text-left">{h}</th>
                  ))}
              </tr>
            </thead>

            <tbody>
              {orders.map((o, i) => (
                <tr key={o.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{(page - 1) * limit + i + 1}</td>
                  <td className="p-3">{o.id}</td>
                  <td className="p-3">{o.order_number}</td>
                  <td className="p-3">{o.status}</td>
                  <td className="p-3">{o.hubStatus}</td>
                  <td className="p-3">{o.partner}</td>
                  <td className="p-3">{moment(o.date).format("YYYY-MM-DD")}</td>
                  <td className="p-3">{o.deliveryTime}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* PAGINATION */}
          <div className="flex items-center justify-center gap-4 mt-6 flex-wrap">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="flex items-center justify-center w-9 h-9 rounded-full border shrink-0 disabled:opacity-40"
            >
              <ChevronLeft size={18} />
            </button>

            <span className="text-sm text-gray-600 w-24 text-center shrink-0">
              {page} / {pagination?.totalPages || 1}
            </span>

            <button
              onClick={() => setPage((p) =>
                Math.min(p + 1, pagination?.totalPages || p)
              )}
              disabled={page >= (pagination?.totalPages || 1)}
              className="flex items-center justify-center w-9 h-9 rounded-full border shrink-0 disabled:opacity-40"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const SummaryCard = ({ title, value, color, loading }) => {
  const styles = {
    blue: "bg-blue-100 text-blue-900",
    green: "bg-green-100 text-green-900",
    yellow: "bg-yellow-100 text-yellow-900",
    red: "bg-red-100 text-red-900",
  };

  return (
    <div className={`${styles[color]} p-4 rounded-lg text-center shadow-sm min-h-[96px] flex flex-col justify-center`}>
      <p className="text-sm opacity-80 mb-2">{title}</p>

      {loading ? (
        <div className="flex justify-center">
          <div className="w-6 h-6 border-4 border-current border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <p className="text-2xl font-bold">{value}</p>
      )}
    </div>
  );
};

export default Reports;
