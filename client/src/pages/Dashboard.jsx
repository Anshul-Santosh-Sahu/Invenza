import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api"; // <-- Import your API helper
import { motion } from "framer-motion";
import {
  FileText,
  Users,
  Package,
  IndianRupee,
  Loader2,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts";

// --- THEME COLORS ---
const COLORS = ["#3b82f6", "#ef4444", "#8b5cf6", "#10b981", "#f59e0b"];

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl backdrop-blur-md z-50">
        <p className="text-slate-400 text-sm mb-1">{label}</p>
        <p className="text-blue-400 font-bold text-lg">
          {payload[0].name === "revenue" ? "₹" : ""}
          {payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ invoices: 0, customers: 0, products: 0, revenue: 0 });
  const [invoices, setInvoices] = useState([]);
  const [revenueChartData, setRevenueChartData] = useState([]);
  const [productChartData, setProductChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1. Fetch Real Data in Parallel
        const [invoicesRes, productsRes, customersRes] = await Promise.all([
            api.get('/invoices'),
            api.get('/products'),
            api.get('/customers')
        ]);

        const allInvoices = invoicesRes.data;
        const allProducts = productsRes.data;
        const allCustomers = customersRes.data;

        // 2. Calculate Stats
        const calculatedRevenue = allInvoices
          .filter((inv) => inv.status === "Paid")
          .reduce((total, inv) => total + (parseFloat(inv.totalAmount) || 0), 0);

        setStats({
          invoices: allInvoices.length,
          customers: allCustomers.length,
          products: allProducts.length,
          revenue: calculatedRevenue,
        });

        // Recent Invoices (Top 5)
        setInvoices(allInvoices.slice(0, 5)); 

        // 3. Process Revenue Chart Data
        const monthlyRevenue = {};
        allInvoices.forEach((inv) => {
          if (inv.status === "Paid") {
            const date = new Date(inv.invoiceDate);
            const monthName = monthNames[date.getMonth()];
            const amount = parseFloat(inv.totalAmount) || 0;
            if (!monthlyRevenue[monthName]) monthlyRevenue[monthName] = 0;
            monthlyRevenue[monthName] += amount;
          }
        });

        // Map all months to ensure chart continuity
        const formattedRevenueData = monthNames.map((month) => ({
          month: month,
          revenue: monthlyRevenue[month] || 0,
        }));
        setRevenueChartData(formattedRevenueData);

        // 4. Process Product Data (Category Distribution)
        const categoryCounts = {};
        allProducts.forEach((product) => {
          const category = product.category || "Uncategorized";
          if (!categoryCounts[category]) categoryCounts[category] = 0;
          categoryCounts[category]++;
        });

        setProductChartData(
          Object.keys(categoryCounts).map((name) => ({
            name: name,
            value: categoryCounts[name],
          }))
        );

      } catch (error) {
        console.error("Dashboard Data Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const statCards = [
    { title: "Total Revenue", value: `₹${stats.revenue.toLocaleString("en-IN")}`, icon: IndianRupee, color: "text-blue-400", bg: "bg-blue-500/10" },
    { title: "Active Customers", value: stats.customers, icon: Users, color: "text-violet-400", bg: "bg-violet-500/10" },
    { title: "Products in Stock", value: stats.products, icon: Package, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { title: "Total Invoices", value: stats.invoices, icon: FileText, color: "text-amber-400", bg: "bg-amber-500/10" },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full text-blue-400">
        <Loader2 className="w-12 h-12 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* --- Header Section --- */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-end"
      >
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">
            Dashboard
          </h1>
          <p className="text-slate-400 mt-2 flex items-center gap-2">
            Welcome back,{" "}
            <span className="text-slate-100 font-semibold">
              {user?.name?.split(" ")[0] || "User"}
            </span>
          </p>
        </div>
        <div className="hidden md:block">
          <span className="glass-panel px-4 py-2 text-sm text-slate-300 bg-slate-800/50 border-slate-700 rounded-full flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            System Operational
          </span>
        </div>
      </motion.div>

      {/* --- Stats Grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:border-slate-600 transition-all duration-300 border-slate-700 bg-slate-800/40"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-400 text-sm font-medium">{card.title}</p>
                <h3 className="text-3xl font-bold text-slate-100 mt-2">{card.value}</h3>
              </div>
              <div className={`p-3 rounded-xl ${card.bg} ${card.color} group-hover:scale-110 transition-transform`}>
                <card.icon size={24} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* --- Charts Section --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="glass-panel p-6 rounded-2xl lg:col-span-2 flex flex-col border-slate-700 bg-slate-800/40"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <TrendingUp size={18} className="text-blue-400" /> Revenue Growth
            </h3>
            <select className="bg-slate-900 border border-slate-700 text-xs text-slate-300 rounded-lg px-3 py-1 outline-none">
              <option>This Year</option>
              <option>Last Year</option>
            </select>
          </div>

          <div className="flex-1 w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke="#64748b"
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#64748b"
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `₹${value / 1000}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Product Pie Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="glass-panel p-6 rounded-2xl border-slate-700 bg-slate-800/40"
        >
          <h3 className="text-lg font-semibold text-slate-100 mb-6">Inventory Distribution</h3>
          <div className="h-[300px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={productChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {productChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold text-slate-100">{stats.products}</span>
              <span className="text-xs text-slate-400 uppercase">Items</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 justify-center mt-4">
            {productChartData.slice(0, 4).map((entry, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-xs text-slate-300 bg-white/5 px-2 py-1 rounded-md"
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></div>
                {entry.name}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* --- Recent Invoices Table --- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-panel rounded-2xl overflow-hidden border-slate-700 bg-slate-800/40"
      >
        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-100">Recent Transactions</h3>
          <button className="text-xs text-blue-400 hover:text-white transition-colors flex items-center gap-1">
            View All <ArrowUpRight size={14} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-900/50 text-slate-300 text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {invoices.length > 0 ? (
                invoices.map((inv, i) => (
                  <tr key={i} className="hover:bg-slate-700/30 transition-colors group">
                    <td className="p-4 text-sm font-medium text-slate-100">{inv.customerName || "Unknown"}</td>
                    <td className="p-4 text-sm text-slate-400">
                      {new Date(inv.invoiceDate || Date.now()).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-sm font-mono text-slate-200 group-hover:text-blue-400 transition-colors">
                      ₹{parseFloat(inv.totalAmount || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                        ${
                          inv.status === "Paid"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : inv.status === "Pending"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        }`}
                      >
                        {inv.status || "Pending"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-slate-500">
                    No recent transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;