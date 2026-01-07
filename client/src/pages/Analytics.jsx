import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // <-- Import Axios
import {
  Brain,
  TrendingUp,
  Target,
  Zap,
  AlertTriangle,
  Calendar,
  Users // <-- FIXED: Added missing Users icon import
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
  Cell
} from "recharts";

// --- THEME & DATA ---
const COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b"]; // Blue, Violet, Emerald, Amber

// (Keeping mock charts for now as real chart data generation is complex)
const forecastData = [
  { month: "Jan", actual: 4000, forecast: 4000 },
  { month: "Feb", actual: 3000, forecast: 3200 },
  { month: "Mar", actual: 2000, forecast: 2500 },
  { month: "Apr", actual: 2780, forecast: 2800 },
  { month: "May", actual: 1890, forecast: 2000 },
  { month: "Jun", actual: 2390, forecast: 2400 },
  { month: "Jul", actual: 3490, forecast: 3500 },
  { month: "Aug", actual: null, forecast: 3800 },
  { month: "Sep", actual: null, forecast: 4100 },
  { month: "Oct", actual: null, forecast: 4500 },
];

const customerSegments = [
  { x: 100, y: 200, z: 200, name: "Customer A", type: "VIP" },
  { x: 120, y: 100, z: 260, name: "Customer B", type: "VIP" },
  { x: 170, y: 300, z: 400, name: "Customer C", type: "Whale" },
  { x: 140, y: 250, z: 280, name: "Customer D", type: "Regular" },
  { x: 150, y: 400, z: 500, name: "Customer E", type: "Whale" },
  { x: 110, y: 280, z: 200, name: "Customer F", type: "Regular" },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl backdrop-blur-md z-50">
        <p className="text-slate-400 text-sm mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p
            key={index}
            style={{ color: entry.color }}
            className="font-bold text-sm"
          >
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [aiInsight, setAiInsight] = useState("");
  const [realStats, setRealStats] = useState(null);
  const [apiError, setApiError] = useState(false); // New state for API error flag
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnalytics = async () => {
        try {
            const token = localStorage.getItem('token');
            // --- REAL BACKEND CALL ---
            const res = await axios.get('http://localhost:5000/api/analytics', {
                headers: { Authorization: `Bearer ${token}` }
            });

            setAiInsight(res.data.summary);
            setRealStats(res.data.stats);
            setApiError(false); // Clear error on success
        } catch (error) {
            console.error("Error fetching AI analytics:", error);
            // Check for known errors (like 429 quota exceeded)
            if (error.response && error.response.status === 500) {
                 setAiInsight("AI Service is temporarily offline. Please check your server console for details (API quota likely exceeded).");
                 setApiError(true);
            } else {
                 setAiInsight("Unable to connect to Invenza Brain. Please check your connection.");
                 setApiError(true);
            }
            
            // Set mock stats so charts still render (if we had complex mock logic)
            setRealStats({ revenue: 73050, lowStockCount: 3 }); 
        } finally {
            setLoading(false);
        }
    };

    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-end"
      >
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">
            AI Analytics
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Real-time intelligence from your data.
          </p>
        </div>
        <button className="glass-panel px-4 py-2 text-sm hover:bg-slate-800/50 border-slate-700 flex items-center gap-2 text-slate-200 transition-colors">
          <Calendar size={16} /> Live Data
        </button>
      </motion.div>

      {/* --- AI INSIGHT CARD --- */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className={`relative overflow-hidden rounded-2xl p-1 ${apiError ? 'border border-rose-500/50 bg-rose-900/30' : 'border border-indigo-500/30 bg-gradient-to-br from-slate-900 to-indigo-950/30'}`}
      >
        {/* Only show glow if no error */}
        {!apiError && <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>}

        <div className="relative bg-slate-900/80 backdrop-blur-xl rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl border shrink-0 ${apiError ? 'bg-rose-500/10 border-rose-500/20' : 'bg-indigo-500/10 border-indigo-500/20'}`}>
              <Brain className={`w-8 h-8 ${apiError ? 'text-rose-400' : 'text-indigo-400'}`} />
            </div>
            <div className="space-y-2 w-full">
              <h3 className="text-lg font-bold text-indigo-100 flex items-center gap-2">
                Invenza AI Executive Summary
                {loading && (
                  <span className="flex h-2 w-2 rounded-full bg-indigo-400 animate-ping" />
                )}
              </h3>

              {loading ? (
                <div className="space-y-2 animate-pulse max-w-2xl">
                  <div className="h-2 bg-slate-700 rounded w-3/4"></div>
                  <div className="h-2 bg-slate-700 rounded w-1/2"></div>
                </div>
              ) : (
                <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                  {aiInsight}
                </div>
              )}

              {!loading && realStats && (
                <div className="flex flex-wrap gap-3 pt-4 mt-2 border-t border-slate-800/50">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 text-xs font-medium border border-blue-500/20">
                    <TrendingUp size={12} /> Revenue: ₹{realStats.revenue.toLocaleString()}
                  </span>
                  {/* Show warning based on lowStockCount */}
                  {realStats.lowStockCount > 0 && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-400 text-xs font-medium border border-rose-500/20">
                        <AlertTriangle size={12} /> {realStats.lowStockCount} Low Stock Items
                      </span>
                  )}
                  {apiError && (
                     <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-400 text-xs font-medium border border-rose-500/20">
                        <Zap size={12} /> Check API Key
                     </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* --- Charts Grid --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Forecasting Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-panel p-6 rounded-2xl border-slate-700 bg-slate-800/40"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <Target size={18} className="text-blue-400" /> Revenue Forecast
            </h3>
            <span className="text-xs text-slate-500">
              Actual vs AI Prediction
            </span>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastData}>
                <defs>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  stroke="#64748b"
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="#64748b"
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="actual"
                  name="Actual Revenue"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorActual)"
                />
                <Area
                  type="monotone"
                  dataKey="forecast"
                  name="AI Forecast"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  fill="none"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Customer Segmentation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-panel p-6 rounded-2xl border-slate-700 bg-slate-800/40"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <Users size={18} className="text-emerald-400" /> Customer
              Segmentation
            </h3>
            <span className="text-xs text-slate-500">Value vs. Frequency</span>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                />
                <XAxis
                  type="number"
                  dataKey="x"
                  name="Frequency"
                  stroke="#64748b"
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="Value"
                  stroke="#64748b"
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <ZAxis
                  type="number"
                  dataKey="z"
                  range={[60, 400]}
                  name="Score"
                />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  content={<CustomTooltip />}
                />
                <Scatter
                  name="Customers"
                  data={customerSegments}
                  fill="#10b981"
                >
                  {customerSegments.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.type === "Whale"
                          ? "#f59e0b"
                          : entry.type === "VIP"
                          ? "#8b5cf6"
                          : "#10b981"
                      }
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 text-xs text-slate-400 mt-2">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-amber-500"></div> Whales
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-violet-500"></div> VIPs
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>{" "}
              Regulars
            </div>
          </div>
        </motion.div>
      </div>

      {/* --- Actionable Suggestions --- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-panel p-6 rounded-2xl border-slate-700 bg-slate-800/40"
      >
        <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
          <Zap size={18} className="text-amber-400" /> Recommended Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div 
            onClick={() => navigate('/products')}
            className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-800 transition-all cursor-pointer group"
          >
            <h4 className="text-sm font-bold text-slate-200 mb-1 group-hover:text-blue-400 transition-colors">
              Restock Alert
            </h4>
            <p className="text-xs text-slate-400">
              View your inventory to manage low stock items.
            </p>
            <div className="mt-3 text-xs text-blue-400 font-medium flex items-center gap-1">
              View Inventory <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>

          <div 
            onClick={() => navigate('/customers')}
            className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-rose-500/50 hover:bg-slate-800 transition-all cursor-pointer group"
          >
            <h4 className="text-sm font-bold text-slate-200 mb-1 group-hover:text-rose-400 transition-colors">
              Churn Risk
            </h4>
            <p className="text-xs text-slate-400">
              Check customer engagement and follow up with inactive users.
            </p>
            <div className="mt-3 text-xs text-rose-400 font-medium flex items-center gap-1">
              View Customer <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>

          <div 
            onClick={() => navigate('/products')}
            className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800 transition-all cursor-pointer group"
          >
            <h4 className="text-sm font-bold text-slate-200 mb-1 group-hover:text-emerald-400 transition-colors">
              Pricing Opportunity
            </h4>
            <p className="text-xs text-slate-400">
              Review product pricing to optimize margins based on demand.
            </p>
            <div className="mt-3 text-xs text-emerald-400 font-medium flex items-center gap-1">
              Update Pricing <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Analytics;