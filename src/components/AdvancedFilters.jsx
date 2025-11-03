import React, { useState, useEffect } from "react";
import Select from "react-select";
import { CSVLink } from "react-csv";
import * as XLSX from "xlsx";

const AdvancedFilters = ({ data = [], onFilterChange }) => {
    // Filter options
    const statusOptions = [
        { value: "requested", label: "Requested" },
        { value: "picked-up", label: "Picked Up" },
        { value: "in-progress", label: "In Progress" },
        { value: "ready", label: "Ready for Delivery" },
        { value: "delivered", label: "Delivered" },
    ];

    const locationOptions = [
        { value: "Chennai", label: "Chennai" },
        { value: "Bangalore", label: "Bangalore" },
        { value: "Coimbatore", label: "Coimbatore" },
    ];

    const partnerOptions = [
        { value: "Partner A", label: "Partner A" },
        { value: "Partner B", label: "Partner B" },
        { value: "Partner C", label: "Partner C" },
    ];

    const shiftOptions = [
        { value: "morning", label: "Morning" },
        { value: "afternoon", label: "Afternoon" },
        { value: "evening", label: "Evening" },
    ];

    // Filter states
    const [selectedStatus, setSelectedStatus] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState([]);
    const [selectedPartner, setSelectedPartner] = useState([]);
    const [selectedShift, setSelectedShift] = useState([]);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [filteredData, setFilteredData] = useState(data);

    // Filter logic
    const applyFilters = () => {
        let filtered = data;

        if (selectedStatus.length > 0) {
            const statuses = selectedStatus.map((s) => s.value);
            filtered = filtered.filter((item) => statuses.includes(item.status));
        }

        if (selectedLocation.length > 0) {
            const locations = selectedLocation.map((l) => l.value);
            filtered = filtered.filter((item) => locations.includes(item.location));
        }

        if (selectedPartner.length > 0) {
            const partners = selectedPartner.map((p) => p.value);
            filtered = filtered.filter((item) => partners.includes(item.partner));
        }

        if (selectedShift.length > 0) {
            const shifts = selectedShift.map((s) => s.value);
            filtered = filtered.filter((item) => shifts.includes(item.shift));
        }

        if (startDate && endDate) {
            filtered = filtered.filter((item) => {
                const itemDate = new Date(item.date);
                return itemDate >= new Date(startDate) && itemDate <= new Date(endDate);
            });
        }

        setFilteredData(filtered);
        if (onFilterChange) onFilterChange(filtered);
    };

    const clearFilters = () => {
        setSelectedStatus([]);
        setSelectedLocation([]);
        setSelectedPartner([]);
        setSelectedShift([]);
        setStartDate("");
        setEndDate("");
        setFilteredData(data);
        if (onFilterChange) onFilterChange(data);
    };

    // Handle XLSX export
    const exportToXLS = () => {
        const ws = XLSX.utils.json_to_sheet(filteredData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "FilteredData");
        XLSX.writeFile(wb, "FilteredData.xlsx");
    };

    // Keep filteredData synced with data changes
    useEffect(() => {
        setFilteredData(data);
    }, [data]);

    // Mock example data if none passed
    const exampleData =
        data.length > 0
            ? data
            : [
                {
                    id: 1,
                    orderId: "ORD001",
                    status: "requested",
                    location: "Chennai",
                    partner: "Partner A",
                    shift: "morning",
                    date: "2025-10-27",
                },
                {
                    id: 2,
                    orderId: "ORD002",
                    status: "in-progress",
                    location: "Bangalore",
                    partner: "Partner B",
                    shift: "afternoon",
                    date: "2025-10-28",
                },
            ];

    return (
        <div className="bg-white shadow-md rounded-lg p-6 mt-4">
            <h2 className="text-xl font-semibold mb-4">Advanced Filters</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <Select
                    isMulti
                    options={statusOptions}
                    value={selectedStatus}
                    onChange={setSelectedStatus}
                    placeholder="Filter by Status"
                />

                <Select
                    isMulti
                    options={locationOptions}
                    value={selectedLocation}
                    onChange={setSelectedLocation}
                    placeholder="Filter by Location"
                />

                <Select
                    isMulti
                    options={partnerOptions}
                    value={selectedPartner}
                    onChange={setSelectedPartner}
                    placeholder="Filter by Partner"
                />

                <Select
                    isMulti
                    options={shiftOptions}
                    value={selectedShift}
                    onChange={setSelectedShift}
                    placeholder="Filter by Shift"
                />

                <input
                    type="date"
                    className="border rounded p-2"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                />

                <input
                    type="date"
                    className="border rounded p-2"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                />
            </div>

            <div className="flex flex-wrap gap-3">
                <button
                    onClick={applyFilters}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Apply Filters
                </button>

                <button
                    onClick={clearFilters}
                    className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                >
                    Clear Filters
                </button>

                <CSVLink
                    data={filteredData}
                    filename="FilteredData.csv"
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                    Export CSV
                </CSVLink>

                <button
                    onClick={exportToXLS}
                    className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                >
                    Export XLS
                </button>
            </div>

            <div className="mt-6">
                <h3 className="font-semibold text-gray-700 mb-2">
                    Filtered Results ({filteredData.length})
                </h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full border text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border p-2">Order ID</th>
                                <th className="border p-2">Status</th>
                                <th className="border p-2">Location</th>
                                <th className="border p-2">Partner</th>
                                <th className="border p-2">Shift</th>
                                <th className="border p-2">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="border p-2">{item.orderId}</td>
                                    <td className="border p-2 capitalize">{item.status}</td>
                                    <td className="border p-2">{item.location}</td>
                                    <td className="border p-2">{item.partner}</td>
                                    <td className="border p-2 capitalize">{item.shift}</td>
                                    <td className="border p-2">{item.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdvancedFilters;
