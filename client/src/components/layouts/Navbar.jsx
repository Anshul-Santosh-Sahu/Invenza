import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext.jsx";
import { 
  LogOut, 
  LayoutDashboard, 
  Users, 
  Package, 
  FileText, 
  ScanLine,
  Settings,
  CreditCard,
  Brain,
  Database // Added Database icon for storage
} from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import api from "../../lib/api"; // Import API helper

export default function Navbar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // State for dynamic storage
  const [usage, setUsage] = useState(0);
  const [loadingUsage, setLoadingUsage] = useState(true);
  const LIMIT = 500; // Free tier limit (e.g., 500 records)

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Fetch usage stats on mount
  useEffect(() => {
    const fetchUsage = async () => {
      try {
        // We can re-use the analytics endpoint to get counts
        const res = await api.get("/analytics");
        const stats = res.data.stats;
        // Calculate total records used
        const totalRecords = (stats.invoices || 0) + (stats.products || 0) + (stats.customers || 0);
        setUsage(totalRecords);
      } catch (error) {
        console.error("Failed to fetch usage stats", error);
      } finally {
        setLoadingUsage(false);
      }
    };
    fetchUsage();
  }, []);

  // Calculate percentage
  const percentage = Math.min((usage / LIMIT) * 100, 100).toFixed(0);

  const navLinks = [
    { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={18} /> },
    { name: "AI Analytics", path: "/analytics", icon: <Brain size={18} /> },
    { name: "Customers", path: "/customers", icon: <Users size={18} /> },
    { name: "Inventory", path: "/products", icon: <Package size={18} /> },
    { name: "Invoices", path: "/invoices", icon: <FileText size={18} /> },
    { name: "Purchase", path: "/purchase", icon: <ScanLine size={18} /> }, 
    { name: "Settings", path: "/settings", icon: <Settings size={18} /> },
  ];

  return (
    <motion.nav
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="h-full w-64 flex flex-col justify-between
                 bg-[#020617]/95 backdrop-blur-xl border-r border-slate-800"
    >
      {/* 🌟 Brand */}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
           <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <CreditCard className="text-white w-5 h-5" />
           </div>
           <h1 className="text-2xl font-extrabold tracking-wide text-slate-100">
             Invenza
           </h1>
        </div>

        {/* 🔗 Navigation Links */}
        <ul className="flex flex-col space-y-2">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <li key={link.name}>
                <Link
                  to={link.path}
                  className={`relative flex items-center gap-3 text-sm font-medium px-4 py-3 rounded-xl transition-all duration-300 group overflow-hidden ${
                    isActive
                      ? "text-white bg-indigo-500/10 shadow-sm shadow-indigo-500/10 border border-indigo-500/20"
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50" 
                  }`}
                >
                  <span className={`relative z-10 transition-colors ${isActive ? "text-indigo-400" : "text-slate-400 group-hover:text-indigo-300"}`}>
                    {link.icon}
                  </span>
                  <span className="relative z-10">{link.name}</span>
                  {isActive && (
                     <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* ⚙️ Bottom Section (Dynamic Storage) */}
      <div className="p-6 border-t border-slate-800">
        <div className="bg-slate-900/50 rounded-xl p-4 mb-4 border border-slate-800">
           <div className="flex items-center justify-between mb-2">
             <p className="text-xs text-slate-100 font-semibold tracking-wide flex items-center gap-2">
               <Database size={10} className="text-indigo-400"/> Database
             </p>
             <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
               {loadingUsage ? "..." : `${percentage}%`}
             </span>
           </div>
           
           {/* Progress Bar */}
           <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full bg-gradient-to-r ${
                  percentage > 90 ? "from-red-500 to-orange-500" : "from-indigo-500 to-blue-500"
                }`} 
              />
           </div>
           
           <p className="text-[10px] text-slate-400 mt-2 text-right">
             {loadingUsage ? "Calculating..." : `${usage} / ${LIMIT} Records`}
           </p>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full text-sm font-medium text-slate-400 hover:text-red-400 transition-colors px-2"
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </motion.nav>
  );
}