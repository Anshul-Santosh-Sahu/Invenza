import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api"; 
import { motion } from "framer-motion";
import { Loader2, Save, Building2, MapPin, Wallet } from "lucide-react";

const Settings = () => {
  // 1. Get setUser from AuthContext to update the app state
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    businessName: "",
    gstin: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    upiId: "",
    businessType: "Retail"
  });

  useEffect(() => {
    if (user) {
      setFormData({
        businessName: user.businessName || "",
        gstin: user.gstin || "",
        phone: user.phone || "",
        address: user.address || "",
        city: user.city || "",
        state: user.state || "",
        upiId: user.upiId || "",
        businessType: user.businessType || "Retail"
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 2. Send Update to Backend
      const response = await api.put("/auth/profile", formData);
      const updatedUser = response.data;

      // 3. Update Frontend State & Local Storage immediately
      if (setUser) {
        setUser(updatedUser);
      }
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      alert("Settings saved and profile updated!"); 
    } catch (err) {
      console.error("Settings Save Error:", err);
      alert(err.response?.data?.message || "Failed to save settings.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">
          Settings
        </h1>
        <p className="text-slate-400 text-sm mt-1">Manage your business profile and preferences.</p>
      </motion.div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* --- Business Profile --- */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ delay: 0.1 }}
          className="glass-panel p-6 rounded-2xl space-y-6 border-slate-700 bg-slate-800/40"
        >
          <div className="flex items-center gap-3 border-b border-slate-700 pb-4">
             <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
               <Building2 size={20} />
             </div>
             <div>
               <h3 className="text-lg font-semibold text-slate-100">Business Profile</h3>
               <p className="text-xs text-slate-400">This information will appear on your invoices.</p>
             </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Business Name</label>
              <input 
                name="businessName" 
                value={formData.businessName} 
                onChange={handleChange} 
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-600"
                placeholder="Invenza Store" 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                 <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Type</label>
                 <select 
                   name="businessType" 
                   value={formData.businessType} 
                   onChange={handleChange}
                   className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                 >
                   <option value="Retail">Retail</option>
                   <option value="Wholesale">Wholesale</option>
                   <option value="Services">Services</option>
                 </select>
               </div>
               <div className="space-y-2">
                 <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">GSTIN</label>
                 <input 
                   name="gstin" 
                   value={formData.gstin} 
                   onChange={handleChange} 
                   className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-600"
                   placeholder="22ABCDE..." 
                 />
               </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Phone Number</label>
              <input 
                name="phone" 
                value={formData.phone} 
                onChange={handleChange} 
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-600"
                placeholder="+91 90000 00000" 
              />
            </div>
          </div>
        </motion.div>

        {/* --- Location & Payment --- */}
        <div className="space-y-8">
           <motion.div 
             initial={{ opacity: 0, x: 20 }} 
             animate={{ opacity: 1, x: 0 }} 
             transition={{ delay: 0.2 }}
             className="glass-panel p-6 rounded-2xl space-y-6 border-slate-700 bg-slate-800/40"
           >
              <div className="flex items-center gap-3 border-b border-slate-700 pb-4">
                 <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                   <MapPin size={20} />
                 </div>
                 <div>
                   <h3 className="text-lg font-semibold text-slate-100">Location</h3>
                   <p className="text-xs text-slate-400">Where is your business located?</p>
                 </div>
              </div>

              <div className="space-y-4">
                 <div className="space-y-2">
                   <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Street Address</label>
                   <input 
                     name="address" 
                     value={formData.address} 
                     onChange={handleChange} 
                     className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-600"
                     placeholder="123 Tech Park" 
                   />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">City</label>
                     <input 
                        name="city" 
                        value={formData.city} 
                        onChange={handleChange} 
                        className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all" 
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">State</label>
                     <input 
                        name="state" 
                        value={formData.state} 
                        onChange={handleChange} 
                        className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all" 
                     />
                   </div>
                 </div>
              </div>
           </motion.div>

           <motion.div 
             initial={{ opacity: 0, x: 20 }} 
             animate={{ opacity: 1, x: 0 }} 
             transition={{ delay: 0.3 }}
             className="glass-panel p-6 rounded-2xl space-y-6 border-slate-700 bg-slate-800/40"
           >
              <div className="flex items-center gap-3 border-b border-slate-700 pb-4">
                 <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                   <Wallet size={20} />
                 </div>
                 <div>
                   <h3 className="text-lg font-semibold text-slate-100">Payment</h3>
                   <p className="text-xs text-slate-400">Setup UPI for QR code generation.</p>
                 </div>
              </div>
              <div className="space-y-2">
                 <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">UPI ID (VPA)</label>
                 <input 
                   name="upiId" 
                   value={formData.upiId} 
                   onChange={handleChange} 
                   className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-slate-600"
                   placeholder="username@okicici" 
                 />
              </div>
           </motion.div>
        </div>
      </form>
      
      <div className="flex justify-end pt-4">
         <button 
           onClick={handleSubmit} 
           disabled={loading}
           className="btn-primary flex items-center gap-2 px-8 py-3 text-sm shadow-xl hover:shadow-blue-500/20"
         >
           {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
           Save All Changes
         </button>
      </div>

    </div>
  );
};

export default Settings;