import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
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

/**
 * Utility: safeNumber - converts to number and returns fallback 0
 */
const safeNumber = (v) => {
    if (v === null || v === undefined || v === "") return 0;
    const n = Number(v);
    return Number.isNaN(n) ? 0 : n;
};

/**
 * Simple spinner
 */
const SmallSpinner = ({ size = 6 }) => (
    <div className="flex justify-center items-center py-6">
        <div
            className={`w-${size} h-${size} border-4 border-gray-300 border-t-transparent rounded-full animate-spin`}
            aria-hidden="true"
        />
    </div>
);

/**
 * Skeleton card (modern)
 */
const SkeletonCard = () => (
    <div className="animate-pulse bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl p-5 min-h-[110px] shadow">
        <div className="h-5 w-3/4 bg-gray-200 rounded mb-4" />
        <div className="h-10 w-1/3 bg-gray-200 rounded" />
    </div>
);

const formatStageLabel = (stage) => {
    if (!stage) return "";
    return stage.replace(/[_-]/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
};

const Dashboard = () => {
    // API states
    const [summary, setSummary] = useState([]);
    const [breakdown, setBreakdown] = useState([]);
    const [avgDeliveryData, setAvgDeliveryData] = useState([]);
    const [stageSummary, setStageSummary] = useState([]);

    // Loading states per block
    const [loadingSummary, setLoadingSummary] = useState(true);
    const [loadingBreakdown, setLoadingBreakdown] = useState(true);
    const [loadingAvg, setLoadingAvg] = useState(true);
    const [loadingStage, setLoadingStage] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");

        // --- Summary API
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
                    window.location.href = "/login";
                    return;
                }
                return res.json();
            })
            .then((result) => {
                // ensure loading flag always cleared even if result invalid
                try {
                    if (!result || !result.status) {
                        // push zeros (graceful fallback)
                        setSummary([
                            { title: "Total Orders", value: 0, colorClass: "from-blue-500 to-blue-400" },
                            { title: "Completed", value: 0, colorClass: "from-green-500 to-green-400" },
                            { title: "Avg Delivery Time", value: "0 mins", colorClass: "from-indigo-600 to-indigo-500" },
                            { title: "Active Pickups", value: 0, colorClass: "from-yellow-400 to-yellow-300" },
                        ]);
                        return;
                    }

                    const d = result.data || {};

                    // normalize numbers. IMPORTANT: do not rely on truthiness of 0
                    setSummary([
                        { title: "Total Orders", value: safeNumber(d.total_orders), colorClass: "from-blue-500 to-blue-400" },
                        { title: "Completed", value: safeNumber(d.completed_orders), colorClass: "from-green-500 to-green-400" },
                        { title: "Avg Delivery Time", value: `${safeNumber(d.avg_delivery_time)} mins`, colorClass: "from-indigo-600 to-indigo-500" },
                        { title: "Active Pickups", value: safeNumber(d.active_pickups), colorClass: "from-yellow-400 to-yellow-300" },
                    ]);
                } finally {
                    setLoadingSummary(false);
                }
            })
            .catch((err) => {
                console.error("Summary fetch error", err);
                setSummary([
                    { title: "Total Orders", value: 0, colorClass: "from-blue-500 to-blue-400" },
                    { title: "Completed", value: 0, colorClass: "from-green-500 to-green-400" },
                    { title: "Avg Delivery Time", value: `0 mins`, colorClass: "from-indigo-600 to-indigo-500" },
                    { title: "Active Pickups", value: 0, colorClass: "from-yellow-400 to-yellow-300" },
                ]);
                setLoadingSummary(false);
            });

        // --- Breakdown
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
                    window.location.href = "/login";
                    return;
                }
                return res.json();
            })
            .then((result) => {
                try {
                    if (!result || !result.status) {
                        setBreakdown([]);
                        return;
                    }
                    // Ensure numeric values
                    const normalized = (result.data || []).map((it) => ({
                        ...it,
                        value: safeNumber(it.value),
                    }));
                    setBreakdown(normalized);
                } finally {
                    setLoadingBreakdown(false);
                }
            })
            .catch((err) => {
                console.error("Breakdown fetch error", err);
                setBreakdown([]);
                setLoadingBreakdown(false);
            });

        // --- Avg Delivery
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
                    window.location.href = "/login";
                    return;
                }
                return res.json();
            })
            .then((data) => {
                try {
                    const arr = Array.isArray(data?.data) ? data.data : [];
                    // normalize keys expected by chart: { day, avgTime }
                    const normalized = arr.map((r) => ({
                        day: r.day ?? r.date ?? "",
                        avgTime: safeNumber(r.avgTime ?? r.avg_time ?? r.avg_delivery_time),
                    }));
                    setAvgDeliveryData(normalized);
                } finally {
                    setLoadingAvg(false);
                }
            })
            .catch((err) => {
                console.error("Avg Delivery fetch error", err);
                setAvgDeliveryData([]);
                setLoadingAvg(false);
            });

        // --- Stage Summary
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/crm/dashboard/stages`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
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
                try {
                    if (!data?.status || !Array.isArray(data.data)) {
                        setStageSummary([]);
                        return;
                    }
                    // keep percent as number, avg as number
                    const normalized = data.data.map((item) => ({
                        stage: item.status,
                        orders: safeNumber(item.orders),
                        percent: safeNumber(item.percent),
                        avg: Number(item.avg_time) ? Number(item.avg_time) : 0,
                    }));
                    setStageSummary(normalized);
                } finally {
                    setLoadingStage(false);
                }
            })
            .catch((err) => {
                console.error("Stage summary fetch error", err);
                setStageSummary([]);
                setLoadingStage(false);
            });
    }, []);

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">Dashboard Overview</h1>
                    <p className="text-sm text-gray-500">Snapshot of orders, hubs and pickup activity</p>
                </div>

                <div className="flex gap-2 items-center">
                    {/* Quick filters/time range would go here */}
                    <button
                        className="px-3 py-2 rounded-md bg-white shadow text-sm hover:shadow-lg transition"
                        onClick={() => {
                            // optional refresh: re-fetch by toggling state or calling APIs again
                            window.location.reload();
                        }}
                    >
                        Refresh
                    </button>
                </div>
            </div>

            {/* SUMMARY CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {loadingSummary
                    ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
                    : summary.map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className={`rounded-2xl shadow-lg p-5 min-h-[110px] relative overflow-hidden`}
                        >
                            <div className={`absolute -left-20 -top-10 w-48 h-48 rounded-full opacity-10 transform rotate-45`} style={{
                                background: `linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))`
                            }} />
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-200/90">{item.title}</h3>
                                    <div className="mt-3 flex items-baseline gap-3">
                                        <span className="text-3xl font-bold text-gray-900">{item.value}</span>

                                        {/* optional small delta or spark */}
                                        <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full">+3.2%</span>
                                    </div>
                                </div>

                                <div className="text-right">
                                    {/* small icon - replace with your icon set */}
                                    <div className={`p-2 rounded-lg bg-white/10 border border-white/6`}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
                                            <path d="M12 2v10l3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 text-xs text-gray-400">Compared to last 7 days</div>
                        </motion.div>
                    ))}
            </div>

            {/* ORDER BREAKDOWN PIE */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl p-6 shadow">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Order Breakdown by Stage</h2>
                </div>

                {loadingBreakdown ? (
                    <div className="h-72 flex items-center justify-center">
                        <SmallSpinner />
                    </div>
                ) : breakdown.length === 0 ? (
                    <div className="h-48 flex items-center justify-center text-gray-400">No data available</div>
                ) : (
                    <div className="w-full h-72">
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={breakdown}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    dataKey="value"
                                    labelLine={false}
                                    label={({ percent, name }) => `${formatStageLabel(name)} (${Math.round(percent * 100)}%)`}
                                >
                                    {breakdown.map((entry, index) => (
                                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>

                                <Tooltip formatter={(value, name) => [value, formatStageLabel(name)]} />
                                <Legend verticalAlign="bottom" align="center" height={36} formatter={(v) => formatStageLabel(v)} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </motion.div>

            {/* AVG DELIVERY CHART */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl p-6 shadow">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Average Delivery Time (Daily Trend)</h2>
                </div>

                {loadingAvg ? (
                    <div className="h-72 flex items-center justify-center">
                        <SmallSpinner />
                    </div>
                ) : avgDeliveryData.length === 0 ? (
                    <div className="h-48 flex items-center justify-center text-gray-400">No data to display</div>
                ) : (
                    <div className="w-full h-72">
                        <ResponsiveContainer>
                            <LineChart data={avgDeliveryData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="day" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="avgTime" stroke="#6366F1" strokeWidth={3} dot={{ r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </motion.div>

            {/* STAGE SUMMARY TABLE */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl p-6 shadow">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Stage-wise Summary</h2>
                </div>

                {loadingStage ? (
                    <div className="h-48 flex items-center justify-center">
                        <SmallSpinner />
                    </div>
                ) : stageSummary.length === 0 ? (
                    <div className="h-48 flex items-center justify-center text-gray-400">No stage data</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y">
                            <thead>
                                <tr className="text-left text-sm text-gray-500">
                                    <th className="py-3 px-4">Stage</th>
                                    <th className="py-3 px-4">Orders</th>
                                    <th className="py-3 px-4">Percentage</th>
                                    <th className="py-3 px-4">Avg Time (hrs)</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {stageSummary.map((row, idx) => (
                                    <tr key={idx} className={idx % 2 ? "bg-gray-50" : "bg-white"}>
                                        <td className="py-3 px-4">{formatStageLabel(row.stage)}</td>
                                        <td className="py-3 px-4">{row.orders}</td>
                                        <td className="py-3 px-4">{row.percent}%</td>
                                        <td className="py-3 px-4">{row.avg}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default Dashboard;
