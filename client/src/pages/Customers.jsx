import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  UserPlus,
  Edit,
  Trash2,
  Eye,
  Loader2,
  Users,
  CheckCircle2,
  XCircle,
  Mail,
  User,
  Building2,
  FileText
} from "lucide-react";
import {
  PieChart,
  Pie,
  Tooltip,
  ResponsiveContainer,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";
import api from "../lib/api";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "../components/ui/dialog";

const COLORS = ["#3b82f6", "#ef4444", "#8b5cf6", "#10b981"]; 
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl backdrop-blur-md z-50">
        <p className="text-slate-400 text-sm mb-1">{label}</p>
        <p className="text-blue-400 font-bold text-lg">{payload[0].value}</p>
      </div>
    );
  }
  return null;
};

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Chart Data States
  const [barData, setBarData] = useState([]);
  const [pieData, setPieData] = useState([]); // FIX: Added state for Pie Data
  
  // --- MODAL STATES ---
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  
  const [newCustomer, setNewCustomer] = useState({ 
    name: "", email: "", type: "Individual", companyName: "", gstin: "", phone: "", address: "" 
  });
  
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [viewCustomer, setViewCustomer] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- FETCH CUSTOMERS ---
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/customers"); 
      const fetchedCustomers = res.data;
      setCustomers(fetchedCustomers);
      processChartData(fetchedCustomers); // Process data for charts
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const processChartData = (data) => {
    // 1. Process Bar Chart (Monthly Acquisition)
    const monthlyCounts = {};
    monthNames.forEach((m) => { monthlyCounts[m] = 0; });

    data.forEach((customer) => {
      if (customer.createdAt) {
        const date = new Date(customer.createdAt);
        const monthName = monthNames[date.getMonth()];
        if (monthlyCounts[monthName] !== undefined) monthlyCounts[monthName]++;
      }
    });

    const formattedBarData = monthNames.map((month) => ({
      month: month,
      customers: monthlyCounts[month] || 0,
    }));
    setBarData(formattedBarData);

    // 2. Process Pie Chart (Active vs Inactive)
    // Assuming 'status' field exists. If not, we default to 'Active' for now or check logic
    // You might need to add a 'status' field to your backend model if you want this real
    const activeCount = data.filter(c => c.status === 'Active' || !c.status).length; // Defaulting to Active if undefined
    const inactiveCount = data.filter(c => c.status === 'Inactive').length;

    setPieData([
      { name: "Active", value: activeCount },
      { name: "Inactive", value: inactiveCount },
    ]);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // --- HANDLERS ---

  const handleAddInputChange = (e) => {
    const { name, value } = e.target;
    setNewCustomer((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const payload = {
        email: newCustomer.email,
        type: newCustomer.type,
        phone: newCustomer.phone,
        address: newCustomer.address,
        gstin: newCustomer.type === "Business" ? newCustomer.gstin : "",
        name: newCustomer.type === "Business" ? newCustomer.companyName : newCustomer.name,
        status: "Active" // Default new customers to Active
    };

    try {
        await api.post("/customers", payload); 
        await fetchCustomers(); 
        setIsAddModalOpen(false);
        setNewCustomer({ name: "", email: "", type: "Individual", companyName: "", gstin: "", phone: "", address: "" });
    } catch (error) {
        console.error("Failed to add customer:", error);
        alert("Failed to add customer. Please try again.");
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleEditClick = (customer) => {
    setCurrentCustomer({
        ...customer,
        type: customer.type || "Individual", 
        companyName: customer.type === "Business" ? customer.name : "",
        name: customer.type === "Individual" ? customer.name : "",
        gstin: customer.gstin || "",
        phone: customer.phone || "",
        address: customer.address || ""
    });
    setIsEditModalOpen(true);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentCustomer((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
        email: currentCustomer.email,
        type: currentCustomer.type,
        phone: currentCustomer.phone,
        address: currentCustomer.address,
        gstin: currentCustomer.type === "Business" ? currentCustomer.gstin : "",
        name: currentCustomer.type === "Business" ? currentCustomer.companyName : currentCustomer.name
    };

    try {
         await api.put(`/customers/${currentCustomer._id}`, payload); 
         await fetchCustomers();
         setIsEditModalOpen(false);
         setCurrentCustomer(null);
    } catch (error) {
         console.error("Failed to update customer:", error);
         alert("Failed to update customer.");
    } finally {
         setIsSubmitting(false);
    }
  };

  const handleDelete = async (customer) => {
    if (window.confirm(`Delete ${customer.name}?`)) {
      try {
        await api.delete(`/customers/${customer._id}`); 
        // Refresh list from server to ensure charts update correctly
        await fetchCustomers(); 
      } catch (error) {
        console.error("Failed to delete customer:", error);
      }
    }
  };

  const handleViewClick = (customer) => {
      setViewCustomer(customer);
      setIsViewModalOpen(true);
  };

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  const total = customers.length;
  // Recalculate stats for cards based on current state
  const active = customers.filter(c => c.status !== 'Inactive').length; 
  const inactive = total - active;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full text-blue-400">
        <Loader2 className="w-12 h-12 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
           <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">Customer Management</h1>
           <p className="text-slate-400 mt-1 text-sm">View, manage and analyze your client base.</p>
        </div>

        {/* --- ADD CUSTOMER MODAL --- */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <button className="btn-primary flex items-center gap-2 shadow-lg shadow-blue-500/20">
                 <UserPlus size={18} /> Add Customer
              </button>
            </DialogTrigger>
            
            <DialogContent className="bg-slate-900 border border-slate-800 shadow-2xl shadow-black/50 text-slate-100 max-w-md p-0 overflow-hidden rounded-2xl">
              {/* ... (Modal Content same as before) ... */}
              <div className="px-6 py-5 bg-slate-900/50 border-b border-slate-800">
                 <DialogHeader>
                   <DialogTitle className="text-xl font-bold text-slate-100 flex items-center gap-2">
                      <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/10">
                        <UserPlus className="w-5 h-5 text-blue-500"/>
                      </div>
                      Add New Customer
                   </DialogTitle>
                 </DialogHeader>
              </div>
              
              <form onSubmit={handleAddSubmit} className="p-6 space-y-5">
                <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button type="button" onClick={() => setNewCustomer(prev => ({ ...prev, type: "Individual" }))} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${newCustomer.type === "Individual" ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"}`}><User size={16} /> Individual</button>
                  <button type="button" onClick={() => setNewCustomer(prev => ({ ...prev, type: "Business" }))} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${newCustomer.type === "Business" ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20" : "text-slate-400 hover:text-slate-200"}`}><Building2 size={16} /> Business</button>
                </div>

                <div className="space-y-4">
                  {newCustomer.type === "Individual" ? (
                    <div className="space-y-2"><label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Name</label><input name="name" value={newCustomer.name} onChange={handleAddInputChange} required={newCustomer.type === "Individual"} className="glass-input w-full bg-slate-950 border-slate-800" placeholder="e.g. John Doe"/></div>
                  ) : (
                    <div className="space-y-2"><label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Company Name</label><input name="companyName" value={newCustomer.companyName} onChange={handleAddInputChange} required={newCustomer.type === "Business"} className="glass-input w-full bg-slate-950 border-slate-800" placeholder="e.g. Tech Solutions"/></div>
                  )}

                  <div className="space-y-2"><label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</label><input name="email" type="email" value={newCustomer.email} onChange={handleAddInputChange} required className="glass-input w-full bg-slate-950 border-slate-800" placeholder="email@example.com"/></div>

                  <AnimatePresence>
                    {newCustomer.type === "Business" && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-4 overflow-hidden">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2"><label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">GSTIN</label><input name="gstin" value={newCustomer.gstin} onChange={handleAddInputChange} className="glass-input w-full bg-slate-950 border-slate-800" placeholder="GSTIN"/></div>
                          <div className="space-y-2"><label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Phone</label><input name="phone" value={newCustomer.phone} onChange={handleAddInputChange} className="glass-input w-full bg-slate-950 border-slate-800" placeholder="Phone"/></div>
                        </div>
                        <div className="space-y-2"><label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Business Address</label><input name="address" value={newCustomer.address} onChange={handleAddInputChange} className="glass-input w-full bg-slate-950 border-slate-800" placeholder="Address"/></div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                <div className="pt-4 flex justify-end gap-3">
                   <DialogClose asChild><button type="button" className="px-4 py-2 text-slate-400 hover:text-white">Cancel</button></DialogClose>
                   <button type="submit" disabled={isSubmitting} className="btn-primary">{isSubmitting ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Create Customer'}</button>
                </div>
              </form>
            </DialogContent>
        </Dialog>
      </motion.div>

      {/* --- STATS & CHARTS --- */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {[{ label: "Total Customers", value: total, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" }, { label: "Active Users", value: active, icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10" }, { label: "Inactive Users", value: inactive, icon: XCircle, color: "text-rose-400", bg: "bg-rose-500/10" }].map((stat, index) => (
           <div key={index} className="glass-panel p-6 rounded-2xl flex items-center justify-between group border-slate-700 bg-slate-800/40 hover:border-slate-600 transition-all">
              <div><p className="text-sm text-slate-400 font-medium">{stat.label}</p><h2 className="text-3xl font-bold text-slate-100 mt-1">{stat.value}</h2></div>
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}><stat.icon size={24} /></div>
           </div>
         ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-panel p-6 rounded-2xl border-slate-700 bg-slate-800/40">
            <h3 className="text-lg font-semibold text-slate-100 mb-6">Customer Status</h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                    {pieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#f43f5e'} />))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
               <div className="flex items-center gap-2 text-sm text-slate-300"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Active</div>
               <div className="flex items-center gap-2 text-sm text-slate-300"><div className="w-2 h-2 rounded-full bg-rose-500"></div> Inactive</div>
            </div>
         </motion.div>
         <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-panel p-6 rounded-2xl border-slate-700 bg-slate-800/40">
            <h3 className="text-lg font-semibold text-slate-100 mb-6">Acquisition Trend</h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="month" stroke="#64748b" tick={{fontSize: 12, fill: "#94a3b8"}} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" tick={{fontSize: 12, fill: "#94a3b8"}} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="customers" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
         </motion.div>
      </div>

      {/* --- TABLE --- */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-2xl overflow-hidden flex flex-col border-slate-700 bg-slate-800/40">
         <div className="p-6 border-b border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h3 className="text-lg font-semibold text-slate-100">All Customers</h3>
            <div className="relative w-full sm:w-64">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
               <input type="text" placeholder="Search customers..." value={search} onChange={(e) => setSearch(e.target.value)} className="glass-input w-full pl-10 bg-slate-900 border-slate-700 focus:border-blue-500"/>
            </div>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead className="bg-slate-900/50 text-slate-300 text-xs uppercase tracking-wider">
                  <tr><th className="p-4 font-medium">Customer</th><th className="p-4 font-medium">Type</th><th className="p-4 font-medium">Contact</th><th className="p-4 font-medium">Status</th><th className="p-4 font-medium text-right">Actions</th></tr>
               </thead>
               <tbody className="divide-y divide-slate-700">
                  {filtered.map((c) => (
                    <tr key={c._id} className="group hover:bg-slate-700/30 transition-colors">
                       <td className="p-4 font-medium text-slate-100">{c.name}</td>
                       <td className="p-4"><span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium border ${c.type === "Business" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-slate-700/50 text-slate-400 border-slate-600"}`}>{c.type === "Business" ? <Building2 size={10} /> : <User size={10} />}{c.type || "Individual"}</span></td>
                       <td className="p-4 text-sm text-slate-400">{c.email}</td>
                       <td className="p-4"><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${c.status === "Active" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20"}`}>{c.status || "Active"}</span></td>
                       <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button onClick={() => handleViewClick(c)} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-blue-400 transition-colors"><Eye size={16} /></button>
                             <button onClick={() => handleEditClick(c)} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-violet-400 transition-colors"><Edit size={16} /></button>
                             <button onClick={() => handleDelete(c)} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-red-400 transition-colors"><Trash2 size={16} /></button>
                          </div>
                       </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && <tr><td colSpan="5" className="p-10 text-center text-slate-500 italic">No customers found</td></tr>}
               </tbody>
            </table>
         </div>
      </motion.div>

      {/* --- EDIT MODAL --- */}
      {currentCustomer && (
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent className="bg-slate-900 border border-slate-800 shadow-2xl shadow-black/50 text-slate-100 max-w-md p-0 overflow-hidden rounded-2xl">
              {/* ... (Edit form logic - same as before, works because we handled the state in handleEditClick) ... */}
              <div className="px-6 py-5 bg-slate-900/50 border-b border-slate-800">
                 <DialogHeader><DialogTitle className="text-xl font-bold text-slate-100 flex items-center gap-2"><div className="p-2 bg-violet-500/10 rounded-lg border border-violet-500/10"><Edit className="w-5 h-5 text-violet-500"/></div>Edit Customer</DialogTitle></DialogHeader>
              </div>
              <form onSubmit={handleEditSubmit} className="p-6 space-y-5">
                 <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <button type="button" onClick={() => setCurrentCustomer(prev => ({ ...prev, type: "Individual" }))} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${currentCustomer.type === "Individual" ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"}`}><User size={16} /> Individual</button>
                    <button type="button" onClick={() => setCurrentCustomer(prev => ({ ...prev, type: "Business" }))} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${currentCustomer.type === "Business" ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20" : "text-slate-400 hover:text-slate-200"}`}><Building2 size={16} /> Business</button>
                 </div>
                 <div className="space-y-4">
                   {currentCustomer.type === "Individual" ? (
                       <div className="space-y-2"><label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1"><User size={12} /> Full Name</label><input name="name" value={currentCustomer.name} onChange={handleEditInputChange} required className="glass-input w-full bg-slate-950 border-slate-800"/></div>
                   ) : (
                       <div className="space-y-2"><label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1"><Building2 size={12} /> Company Name</label><input name="companyName" value={currentCustomer.companyName} onChange={handleEditInputChange} required className="glass-input w-full bg-slate-950 border-slate-800"/></div>
                   )}
                   <div className="space-y-2"><label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1"><Mail size={12} /> Email Address</label><input name="email" type="email" value={currentCustomer.email} onChange={handleEditInputChange} required className="glass-input w-full bg-slate-950 border-slate-800"/></div>
                   {currentCustomer.type === "Business" && (
                      <div className="space-y-4 pt-2 border-t border-slate-800">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2"><label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">GSTIN</label><input name="gstin" value={currentCustomer.gstin || ""} onChange={handleEditInputChange} className="glass-input w-full bg-slate-950 border-slate-800"/></div>
                          <div className="space-y-2"><label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Phone</label><input name="phone" value={currentCustomer.phone || ""} onChange={handleEditInputChange} className="glass-input w-full bg-slate-950 border-slate-800"/></div>
                        </div>
                        <div className="space-y-2"><label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Business Address</label><input name="address" value={currentCustomer.address || ""} onChange={handleEditInputChange} className="glass-input w-full bg-slate-950 border-slate-800"/></div>
                      </div>
                   )}
                 </div>
                <div className="pt-4 flex justify-end gap-3"><DialogClose asChild><button type="button" className="px-4 py-2 text-slate-400 hover:text-white">Cancel</button></DialogClose><button type="submit" disabled={isSubmitting} className="btn-primary">{isSubmitting ? 'Saving...' : 'Save Changes'}</button></div>
              </form>
            </DialogContent>
        </Dialog>
      )}
      
      {/* --- VIEW MODAL --- */}
      {viewCustomer && (
          <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
            <DialogContent className="bg-slate-900 border border-slate-800 shadow-2xl text-slate-100 max-w-md p-0 overflow-hidden rounded-2xl">
                <div className="px-6 py-5 bg-slate-900/50 border-b border-slate-800">
                    <DialogHeader><DialogTitle className="text-xl font-bold text-slate-100 flex items-center gap-2"><div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/10"><Eye className="w-5 h-5 text-cyan-500"/></div>Customer Details</DialogTitle></DialogHeader>
                </div>
                <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                        <span className="text-sm text-slate-400">Type</span>
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium border ${viewCustomer.type === "Business" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-slate-700/50 text-slate-400 border-slate-600"}`}>{viewCustomer.type === "Business" ? <Building2 size={10} /> : <User size={10} />}{viewCustomer.type || "Individual"}</span>
                    </div>
                    <div className="space-y-3">
                        <div><label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Name</label><p className="text-slate-200 font-medium text-lg">{viewCustomer.name}</p></div>
                        <div><label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Email</label><p className="text-slate-300">{viewCustomer.email}</p></div>
                        {viewCustomer.type === "Business" && (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="text-xs font-semibold text-slate-500 uppercase block mb-1">GSTIN</label><p className="text-slate-200 font-mono bg-slate-950 px-2 py-1 rounded border border-slate-800 text-sm">{viewCustomer.gstin || "N/A"}</p></div>
                                    <div><label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Phone</label><p className="text-slate-200">{viewCustomer.phone || "N/A"}</p></div>
                                </div>
                                <div><label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Address</label><p className="text-slate-300 text-sm">{viewCustomer.address || "N/A"}</p></div>
                            </>
                        )}
                    </div>
                    <div className="pt-4 flex justify-end"><DialogClose asChild><button type="button" className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors font-medium text-sm">Close</button></DialogClose></div>
                </div>
            </DialogContent>
          </Dialog>
      )}

    </div>
  );
};

export default Customers;