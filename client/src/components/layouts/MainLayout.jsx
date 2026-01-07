import { Outlet } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import { motion } from "framer-motion";

export default function MainLayout() {
  return (
    // 1. Professional Background: Very dark slate (almost black), high contrast text
    <div className="relative h-screen flex bg-[#020617] text-slate-100 overflow-hidden transition-colors duration-500 selection:bg-indigo-500/30">
      
      {/* 🔮 Background Layer (Z-0) */}
      {/* Professional Update: Switched to Blue/Indigo/Violet for a 'Tech/Finance' vibe */}
      {/* Opacity reduced to 0.2 (20%) for subtlety */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/20 rounded-full mix-blend-screen filter blur-[120px] animate-blob" />
        <div className="absolute top-[10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full mix-blend-screen filter blur-[120px] animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-slate-800/20 rounded-full mix-blend-screen filter blur-[120px] animate-blob animation-delay-4000" />
      </div>

      {/* 🧭 Sidebar (Z-20) */}
      {/* Glass effect adjusted to be darker and cleaner */}
      <motion.div
        initial={{ x: -60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-20 h-full border-r border-slate-800 bg-[#020617]/80 backdrop-blur-xl" 
      >
        <Navbar />
      </motion.div>

      {/* 🚀 Main Content Area (Z-10) */}
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 flex-1 p-6 md:p-8 backdrop-blur-sm overflow-y-auto h-full scrollbar-thin scrollbar-thumb-slate-700/50 scrollbar-track-transparent" 
      >
        {/* Container to center content on huge screens */}
        <div className="max-w-[1600px] mx-auto min-h-full">
            <Outlet />
        </div>
      </motion.main>
      
    </div>
  );
}