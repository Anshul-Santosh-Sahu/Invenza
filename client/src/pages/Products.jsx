import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Package,
  DollarSign,
  Layers,
  Edit,
  Trash2,
  Loader2,
  Plus,
  Search,
  Tag,
  Box,
  FileText,
  Truck
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "../components/ui/dialog";
import api from "../lib/api"; // Import your API helper

// --- THEME COLORS (Professional Palette) ---
const COLORS = ["#3b82f6", "#ef4444", "#8b5cf6", "#10b981", "#f59e0b", "#6366f1"];

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

export default function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Modal
  const [showModal, setShowModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  // Expanded form data to include quantity, description, supplier
  const [formData, setFormData] = useState({ 
    name: "", 
    sku: "", 
    price: "", 
    quantity: "", 
    category: "", 
    description: "", 
    supplier: "" 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- 1. FETCH REAL DATA ---
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/products");
      setProducts(res.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleEditClick = (p) => {
    setCurrentProduct(p);
    setFormData({ 
      name: p.name, 
      sku: p.sku, 
      price: p.price, 
      quantity: p.quantity, 
      category: p.category || "", 
      description: p.description || "", 
      supplier: p.supplier || "" 
    });
    setShowModal(true);
  };

  const handleCreateClick = () => {
    setCurrentProduct(null);
    setFormData({ name: "", sku: "", price: "", quantity: "", category: "", description: "", supplier: "" });
    setShowModal(true);
  };

  // --- 2. REAL SAVE (CREATE/UPDATE) ---
  const handleSave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (currentProduct) {
        // Update Logic
        await api.put(`/products/${currentProduct._id}`, formData);
      } else {
        // Create Logic
        await api.post("/products", formData);
      }
      await fetchProducts(); // Refresh data
      setShowModal(false);
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Failed to save product.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- 3. REAL DELETE ---
  const handleDelete = async (id) => {
    if(window.confirm("Delete this product?")) {
       try {
         await api.delete(`/products/${id}`);
         setProducts(prev => prev.filter(p => p._id !== id));
       } catch (error) {
         console.error("Error deleting product:", error);
         alert("Failed to delete product.");
       }
    }
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  
  // Stats
  const avgPrice = products.length ? products.reduce((a, b) => a + Number(b.price), 0) / products.length : 0;
  const categories = products.reduce((acc, p) => { 
    const cat = p.category || "Uncategorized";
    acc[cat] = (acc[cat] || 0) + 1; 
    return acc; 
  }, {});
  const pieData = Object.keys(categories).map(k => ({ name: k, value: categories[k] }));

  if (loading) return <div className="flex justify-center items-center h-full text-blue-400"><Loader2 className="animate-spin w-12 h-12"/></div>;

  return (
    <div className="space-y-8 pb-10">
      
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">Inventory</h1>
           <p className="text-slate-400 text-sm mt-1">Manage stock and pricing.</p>
        </div>
        <button onClick={handleCreateClick} className="btn-primary flex items-center gap-2 shadow-lg shadow-blue-500/20">
           <Plus size={18} /> Add Product
        </button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-5 rounded-2xl flex items-center justify-between group border-slate-700 bg-slate-800/40 hover:border-slate-600 transition-all">
           <div><p className="text-slate-400 text-sm">Total Items</p><h3 className="text-2xl font-bold text-slate-100 mt-1">{products.length}</h3></div>
           <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl group-hover:scale-110 transition-transform"><Package/></div>
        </div>
        <div className="glass-panel p-5 rounded-2xl flex items-center justify-between group border-slate-700 bg-slate-800/40 hover:border-slate-600 transition-all">
           <div><p className="text-slate-400 text-sm">Avg Price</p><h3 className="text-2xl font-bold text-slate-100 mt-1">₹{avgPrice.toFixed(0)}</h3></div>
           <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl group-hover:scale-110 transition-transform"><DollarSign/></div>
        </div>
        <div className="glass-panel p-5 rounded-2xl flex items-center justify-between group border-slate-700 bg-slate-800/40 hover:border-slate-600 transition-all">
           <div><p className="text-slate-400 text-sm">Categories</p><h3 className="text-2xl font-bold text-slate-100 mt-1">{Object.keys(categories).length}</h3></div>
           <div className="p-3 bg-violet-500/10 text-violet-400 rounded-xl group-hover:scale-110 transition-transform"><Layers/></div>
        </div>
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-panel p-6 rounded-2xl border-slate-700 bg-slate-800/40">
           <h3 className="text-lg font-semibold text-slate-100 mb-4">Price Distribution</h3>
           <div className="h-[250px] w-full">
             <ResponsiveContainer>
               <BarChart data={filtered.slice(0, 8)}>
                 <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                 <XAxis dataKey="name" stroke="#64748b" tick={{fontSize: 10, fill: "#94a3b8"}} interval={0} tickFormatter={(val) => val.slice(0, 10)} axisLine={false} tickLine={false} />
                 <YAxis stroke="#64748b" tick={{fontSize: 12, fill: "#94a3b8"}} axisLine={false} tickLine={false} />
                 <Tooltip content={<CustomTooltip />} />
                 <Bar dataKey="price" radius={[4, 4, 0, 0]}>
                   {filtered.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                 </Bar>
               </BarChart>
             </ResponsiveContainer>
           </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-panel p-6 rounded-2xl border-slate-700 bg-slate-800/40">
           <h3 className="text-lg font-semibold text-slate-100 mb-4">Category Breakdown</h3>
           <div className="h-[250px] w-full">
             <ResponsiveContainer>
               <PieChart>
                 <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} stroke="none">
                   {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                 </Pie>
                 <Tooltip content={<CustomTooltip />} />
                 <Legend wrapperStyle={{fontSize: '12px', color: '#94a3b8'}} />
               </PieChart>
             </ResponsiveContainer>
           </div>
        </motion.div>
      </div>

      {/* Products Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-2xl overflow-hidden border-slate-700 bg-slate-800/40">
        <div className="p-5 border-b border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4">
           <h3 className="text-lg font-semibold text-slate-100">Product List</h3>
           <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4"/>
              <input 
                type="text" 
                placeholder="Search..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)}
                className="glass-input w-full pl-9 bg-slate-900 border-slate-700 focus:border-blue-500"
              />
           </div>
        </div>
        <div className="overflow-x-auto">
           <table className="w-full text-left text-sm">
             <thead className="bg-slate-900/50 text-xs text-slate-300 uppercase tracking-wider">
               <tr>
                 <th className="p-4">Name</th>
                 <th className="p-4">SKU</th>
                 <th className="p-4">Price</th>
                 <th className="p-4">Stock</th>
                 <th className="p-4">Category</th>
                 <th className="p-4 text-right">Actions</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-700">
               {filtered.map(p => (
                 <tr key={p._id} className="hover:bg-slate-700/30 transition-colors group">
                    <td className="p-4 font-medium text-slate-100">{p.name}</td>
                    <td className="p-4 text-slate-400 font-mono text-xs">{p.sku}</td>
                    <td className="p-4 text-blue-400 font-bold">₹{Number(p.price).toLocaleString()}</td>
                    <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                            p.quantity > 10 ? 'bg-emerald-500/10 text-emerald-400' : 
                            p.quantity > 0 ? 'bg-amber-500/10 text-amber-400' : 
                            'bg-rose-500/10 text-rose-400'
                        }`}>
                            {p.quantity} Units
                        </span>
                    </td>
                    <td className="p-4"><span className="bg-slate-700/50 px-2 py-1 rounded text-xs text-slate-300">{p.category || "Uncategorized"}</span></td>
                    <td className="p-4 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button onClick={() => handleEditClick(p)} className="p-2 hover:bg-slate-700 rounded text-violet-400"><Edit size={16}/></button>
                       <button onClick={() => handleDelete(p._id)} className="p-2 hover:bg-slate-700 rounded text-red-400"><Trash2 size={16}/></button>
                    </td>
                 </tr>
               ))}
             </tbody>
           </table>
        </div>
      </motion.div>

      {/* --- PROFESSIONAL EDIT/CREATE MODAL --- */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
         <DialogContent className="bg-slate-900 border border-slate-800 shadow-2xl shadow-black/50 text-slate-100 max-w-2xl p-0 overflow-hidden rounded-2xl">
            <div className="px-6 py-5 bg-slate-900/50 border-b border-slate-800">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-slate-100 flex items-center gap-2">
                    <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/10">
                        {currentProduct ? <Edit className="w-5 h-5 text-blue-500"/> : <Plus className="w-5 h-5 text-blue-500"/>}
                    </div>
                    {currentProduct ? "Edit Product" : "Add New Product"}
                  </DialogTitle>
                </DialogHeader>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-6">
               {/* Product Basics */}
               <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2 col-span-2">
                     <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Package size={12} /> Product Name
                     </label>
                     <input 
                        className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-600" 
                        value={formData.name} 
                        onChange={(e) => setFormData({...formData, name: e.target.value})} 
                        placeholder="e.g. Wireless Headphones"
                        required 
                     />
                   </div>
                   
                   <div className="space-y-2">
                     <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Tag size={12} /> SKU
                     </label>
                     <input 
                        className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-600 font-mono" 
                        value={formData.sku} 
                        onChange={(e) => setFormData({...formData, sku: e.target.value})} 
                        placeholder="PROD-001"
                        required 
                     />
                   </div>

                   <div className="space-y-2">
                     <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Layers size={12} /> Category
                     </label>
                     <input 
                        className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-600" 
                        value={formData.category} 
                        onChange={(e) => setFormData({...formData, category: e.target.value})} 
                        placeholder="e.g. Electronics"
                     />
                   </div>
               </div>

               {/* Pricing & Stock */}
               <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <DollarSign size={12} /> Price (₹)
                    </label>
                    <input 
                        type="number" 
                        className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-600" 
                        value={formData.price} 
                        onChange={(e) => setFormData({...formData, price: e.target.value})} 
                        placeholder="0.00"
                        required 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Box size={12} /> Quantity
                    </label>
                    <input 
                        type="number" 
                        className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-600" 
                        value={formData.quantity} 
                        onChange={(e) => setFormData({...formData, quantity: e.target.value})} 
                        placeholder="0"
                        required 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Truck size={12} /> Supplier
                    </label>
                    <input 
                        className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-600" 
                        value={formData.supplier} 
                        onChange={(e) => setFormData({...formData, supplier: e.target.value})} 
                        placeholder="Vendor Name"
                    />
                  </div>
               </div>

               {/* Description */}
               <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <FileText size={12} /> Description
                    </label>
                    <textarea 
                        className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-600 resize-none h-24" 
                        value={formData.description} 
                        onChange={(e) => setFormData({...formData, description: e.target.value})} 
                        placeholder="Enter product details..."
                    />
               </div>

               <div className="pt-4 flex justify-end gap-3 border-t border-slate-800/50 mt-4">
                  <DialogClose asChild>
                      <button type="button" className="px-4 py-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors font-medium text-sm">Cancel</button>
                  </DialogClose>
                  <button type="submit" disabled={isSubmitting} className="btn-primary shadow-lg shadow-blue-500/25">
                    {isSubmitting ? <Loader2 className="animate-spin w-4 h-4"/> : "Save Product"}
                  </button>
               </div>
            </form>
         </DialogContent>
      </Dialog>
    </div>
  );
}