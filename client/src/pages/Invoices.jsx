import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusCircle,
  FileDown,
  Loader2,
  Edit,
  Trash2,
  Download,
  Plus,
  X,
  Search,
  CheckCircle2,
  Clock,
  AlertOctagon,
  User,
  ShoppingCart,
  Percent,
  FileText,
  ChevronDown
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useAuth } from "../context/AuthContext"; 
import api from "../lib/api"; 

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "../components/ui/dialog";

// --- Custom Tooltip ---
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl backdrop-blur-md z-50">
        <p className="text-slate-400 text-sm mb-1">{label}</p>
        <p className="text-blue-400 font-bold text-lg">₹{payload[0].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

const Invoices = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({ 
    customer: "", 
    status: "Paid", 
    items: [], 
    discount: 0, 
    tax: 0, 
    notes: "" 
  });
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedProductQuantity, setSelectedProductQuantity] = useState(1);

  // --- FETCH REAL DATA ---
  const fetchData = async () => {
    try {
      setLoading(true);
      const [invoicesRes, customersRes, productsRes] = await Promise.all([
        api.get("/invoices"),
        api.get("/customers"),
        api.get("/products")
      ]);
      setInvoices(invoicesRes.data);
      setCustomers(customersRes.data);
      setProducts(productsRes.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Stats & Charts
  const totalPaid = invoices.filter((i) => i.status === "Paid").reduce((a, i) => a + (i.totalAmount || 0), 0);
  const totalPending = invoices.filter((i) => i.status === "Pending").reduce((a, i) => a + (i.totalAmount || 0), 0);
  const totalOverdue = invoices.filter((i) => i.status === "Overdue").reduce((a, i) => a + (i.totalAmount || 0), 0);

  const chartData = useMemo(() => {
    const grouped = {};
    invoices.forEach((inv) => {
      const date = new Date(inv.invoiceDate);
      const month = date.toLocaleString('default', { month: 'short' });
      if (inv.status === "Paid") grouped[month] = (grouped[month] || 0) + (inv.totalAmount || 0);
    });
    return Object.keys(grouped).map((k) => ({ month: k, revenue: grouped[k] }));
  }, [invoices]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchSearch = (inv.customerName || "").toLowerCase().includes(search.toLowerCase()) || 
                          (inv.invoiceNumber || "").toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || inv.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [invoices, search, statusFilter]);

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((acc, it) => acc + (it.price * it.quantity), 0);
    const discountAmount = subtotal * (Number(formData.discount) / 100);
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxableAmount * (Number(formData.tax) / 100);
    const total = taxableAmount + taxAmount;
    return { subtotal, discountAmount, taxAmount, total };
  };

  const { subtotal, discountAmount, taxAmount, total } = calculateTotals();

  // --- HANDLERS ---
  const handleProductSelection = (e) => {
    const productId = e.target.value;
    if (!productId) return;

    const product = products.find((p) => p._id === productId);
    
    if (product && product.quantity <= 0) {
      alert(`⚠️ Stock Alert: "${product.name}" is out of stock!`);
      setSelectedProductId(""); 
      return;
    }

    setSelectedProductId(productId);
    setSelectedProductQuantity(1);
  };

  const handleAddItemToForm = () => {
    if (!selectedProductId) return;
    
    const product = products.find((p) => p._id === selectedProductId);
    if (!product) return;

    if (selectedProductQuantity > product.quantity) {
       alert(`⚠️ Insufficient Stock! Only ${product.quantity} units available.`);
       return; 
    }
    
    if (selectedProductQuantity <= 0) return;

    const newItem = { product: product._id, name: product.name, quantity: selectedProductQuantity, price: product.price };
    setFormData(prev => ({ ...prev, items: [...prev.items, newItem] }));
    
    setSelectedProductId("");
    setSelectedProductQuantity(1);
  };

  const handleEditClick = (invoice) => {
    setCurrentInvoice(invoice);
    setFormData({
      customer: invoice.customer._id || invoice.customer,
      status: invoice.status,
      items: invoice.items.map(item => ({
        product: item.product._id || item.product,
        name: item.name,
        quantity: item.quantity,
        price: item.price
      })),
      discount: invoice.discount || 0,
      tax: invoice.tax || 0,
      notes: invoice.notes || ""
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      try {
        await api.delete(`/invoices/${id}`);
        setInvoices(prev => prev.filter(inv => inv._id !== id));
      } catch (error) {
        console.error("Failed to delete invoice:", error);
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
      setInvoices(prev => prev.map(inv => inv._id === id ? { ...inv, status: newStatus } : inv));
      try {
          await api.put(`/invoices/${id}`, { status: newStatus });
      } catch (error) {
          console.error("Failed to update status:", error);
          await fetchData(); 
      }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const { total } = calculateTotals();
    const customerObj = customers.find(c => c._id === formData.customer);
    
    const payload = {
      ...formData,
      customerName: customerObj?.name || "Unknown Customer",
      totalAmount: total,
      invoiceDate: currentInvoice ? currentInvoice.invoiceDate : new Date().toISOString(),
      invoiceNumber: currentInvoice ? currentInvoice.invoiceNumber : `INV-${Date.now().toString().slice(-6)}`
    };

    try {
        if (currentInvoice) {
             await api.put(`/invoices/${currentInvoice._id}`, payload);
        } else {
             await api.post("/invoices", payload);
        }
        await fetchData();
        setIsModalOpen(false);
    } catch (error) {
        console.error("Failed to save invoice:", error);
        alert(error.response?.data?.message || "Failed to save invoice.");
    } finally {
        setIsSubmitting(false);
    }
  };

  // --- UPDATED PDF GENERATOR ---
  const downloadPDF = (invoice) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Brand Colors
    const primaryColor = [59, 130, 246]; // Blue
    const slateColor = [100, 116, 139];  // Slate Gray
    
    // --- HEADER ---
    // Left: Company Info
    doc.setFontSize(22);
    doc.setTextColor(30, 41, 59);
    doc.setFont("helvetica", "bold");
    doc.text(user?.businessName || "Your Company Name", 14, 20);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...slateColor);
    doc.text(user?.address || "123 Business Street, Tech City", 14, 26);
    doc.text(user?.email || "support@yourcompany.com", 14, 31);
    doc.text(user?.phone || "+91 98765 43210", 14, 36);

    // Right: Invoice Info
    const rightColX = pageWidth - 14;
    doc.setFontSize(32);
    doc.setTextColor(...primaryColor);
    doc.setFont("helvetica", "bold");
    doc.text("INVOICE", rightColX, 25, { align: "right" });

    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    doc.setFont("helvetica", "bold");
    doc.text(`#${invoice.invoiceNumber}`, rightColX, 32, { align: "right" });
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...slateColor);
    doc.text(`Date: ${new Date(invoice.invoiceDate).toLocaleDateString()}`, rightColX, 37, { align: "right" });

    // Status Badge on PDF
    doc.setFillColor(invoice.status === 'Paid' ? 220 : 255, 252, 231);
    doc.setDrawColor(invoice.status === 'Paid' ? 22 : 245, 197, 94);
    // You can add a visual rectangle for status here if desired

    // --- ACCENT LINE ---
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(1);
    doc.line(14, 45, pageWidth - 14, 45);

    // --- BILL TO ---
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(150, 150, 150);
    doc.text("BILL TO", 14, 55);

    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text(invoice.customerName, 14, 62);
    // If you had customer address/email in the invoice object, add it here
    
    // --- TABLE ---
    const tableColumn = ["Item Description", "Qty", "Unit Price", "Total"];
    const tableRows = [];

    invoice.items.forEach((item) => {
      const itemData = [
        item.name,
        item.quantity,
        `Rs. ${item.price.toLocaleString('en-IN')}`,
        `Rs. ${(item.quantity * item.price).toLocaleString('en-IN')}`,
      ];
      tableRows.push(itemData);
    });

    autoTable(doc, {
      startY: 75,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      headStyles: {
        fillColor: primaryColor,
        textColor: 255,
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'center'
      },
      columnStyles: {
        0: { cellWidth: 'auto', halign: 'left' },
        1: { cellWidth: 20, halign: 'center' },
        2: { cellWidth: 30, halign: 'right' },
        3: { cellWidth: 30, halign: 'right' },
      },
      styles: {
        fontSize: 9,
        cellPadding: 4,
        textColor: 50,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252] // Very light gray
      }
    });

    // --- SUMMARY SECTION (Bottom Right) ---
    const finalY = doc.lastAutoTable.finalY + 10;
    const summaryX = pageWidth - 50;
    
    // Helper for right aligned text
    const addSummaryRow = (label, value, isBold = false) => {
      doc.setFont("helvetica", isBold ? "bold" : "normal");
      doc.setTextColor(isBold ? 0 : 100);
      doc.setFontSize(isBold ? 11 : 10);
      
      doc.text(label, summaryX - 10, finalY + offset, { align: "right" });
      doc.text(value, pageWidth - 14, finalY + offset, { align: "right" });
    };

    let offset = 0;
    
    // Subtotal Calculation (re-calc just for PDF safety)
    const subtotal = invoice.items.reduce((acc, it) => acc + (it.price * it.quantity), 0);
    
    addSummaryRow("Subtotal:", `Rs. ${subtotal.toLocaleString()}`);
    offset += 6;

    if (invoice.discount > 0) {
      addSummaryRow(`Discount (${invoice.discount}%):`, `- Rs. ${(subtotal * (invoice.discount/100)).toLocaleString()}`);
      offset += 6;
    }

    if (invoice.tax > 0) {
      const taxable = subtotal - (subtotal * (invoice.discount/100));
      addSummaryRow(`Tax (${invoice.tax}%):`, `+ Rs. ${(taxable * (invoice.tax/100)).toLocaleString()}`);
      offset += 6;
    }

    // Divider line
    doc.setDrawColor(200);
    doc.line(summaryX - 20, finalY + offset - 4, pageWidth - 14, finalY + offset - 4);
    
    // Grand Total
    offset += 2;
    doc.setFontSize(12);
    doc.setTextColor(...primaryColor);
    doc.setFont("helvetica", "bold");
    doc.text("Total:", summaryX - 10, finalY + offset, { align: "right" });
    doc.text(`Rs. ${invoice.totalAmount.toLocaleString()}`, pageWidth - 14, finalY + offset, { align: "right" });

    // --- FOOTER & NOTES ---
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Notes Box
    if (invoice.notes) {
      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.setFont("helvetica", "bold");
      doc.text("Terms & Notes:", 14, finalY + offset + 15);
      
      doc.setFont("helvetica", "normal");
      doc.setTextColor(80);
      const splitNotes = doc.splitTextToSize(invoice.notes, 120);
      doc.text(splitNotes, 14, finalY + offset + 20);
    }

    // Bottom Line
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(2);
    doc.line(0, pageHeight - 5, pageWidth, pageHeight - 5);
    
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text("Thank you for your business!", pageWidth / 2, pageHeight - 10, { align: "center" });

    doc.save(`Invoice_${invoice.invoiceNumber}.pdf`);
  };

  if (loading) return <div className="flex justify-center items-center h-full text-blue-400"><Loader2 className="animate-spin w-12 h-12"/></div>;

  return (
    <div className="space-y-8 pb-10">
      {/* Header & Stats */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row justify-between gap-4">
        <div><h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">Invoice Console</h1><p className="text-slate-400 text-sm mt-1">Manage billing and track revenue.</p></div>
        <div className="flex gap-3"><button onClick={() => alert('Exporting CSV...')} className="glass-panel px-4 py-2 text-sm bg-slate-800/50 hover:bg-slate-700/50 border-slate-700 flex items-center gap-2 text-slate-200 transition-colors"><FileDown size={16}/> Export CSV</button><button onClick={() => { setCurrentInvoice(null); setFormData({ customer: "", status: "Paid", items: [], discount: 0, tax: 0, notes: "" }); setIsModalOpen(true); }} className="btn-primary flex items-center gap-2 shadow-lg shadow-blue-500/20"><PlusCircle size={18}/> Create Invoice</button></div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[{ label: "Total Invoices", value: invoices.length, icon: FileDown, color: "text-blue-400", bg: "bg-blue-500/10" }, { label: "Paid", value: `₹${totalPaid.toLocaleString()}`, icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10" }, { label: "Pending", value: `₹${totalPending.toLocaleString()}`, icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10" }, { label: "Overdue", value: `₹${totalOverdue.toLocaleString()}`, icon: AlertOctagon, color: "text-rose-400", bg: "bg-rose-500/10" }].map((stat, idx) => (<div key={idx} className="glass-panel p-5 rounded-2xl flex flex-col justify-between border-slate-700 bg-slate-800/40 hover:border-slate-600 transition-all"><div className="flex justify-between items-start"><span className="text-slate-400 text-sm font-medium">{stat.label}</span><div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}><stat.icon className="w-5 h-5" /></div></div><div className="text-2xl font-bold text-slate-100 mt-4">{stat.value}</div></div>))}
      </motion.div>

      {/* Charts Section */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel p-6 rounded-2xl border-slate-700 bg-slate-800/40">
         <h3 className="text-lg font-semibold text-slate-100 mb-4">Revenue Trend (Paid)</h3>
         <div className="h-[250px] w-full"><ResponsiveContainer width="100%" height="100%"><LineChart data={chartData}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} /><XAxis dataKey="month" stroke="#64748b" tick={{fontSize: 12, fill: "#94a3b8"}} axisLine={false} tickLine={false} /><YAxis stroke="#64748b" tick={{fontSize: 12, fill: "#94a3b8"}} axisLine={false} tickLine={false} /><Tooltip content={<CustomTooltip />} /><Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} dot={{r:4, fill:"#0f172a", stroke:"#3b82f6", strokeWidth:2}} /></LineChart></ResponsiveContainer></div>
      </motion.div>

      {/* Invoice List */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-2xl overflow-hidden border-slate-700 bg-slate-800/40">
        <div className="p-5 border-b border-slate-700 flex flex-wrap gap-4 justify-between items-center">
           <h3 className="text-lg font-semibold text-slate-100">Transactions</h3>
           <div className="flex gap-3"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4"/><input type="text" placeholder="Search ID or Name..." value={search} onChange={(e) => setSearch(e.target.value)} className="glass-input pl-9 w-64 text-sm bg-slate-900 border-slate-700 focus:border-blue-500"/></div><select className="glass-input text-sm w-32 bg-slate-900 border-slate-700 text-slate-300" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}><option value="all">All Status</option><option value="Paid">Paid</option><option value="Pending">Pending</option><option value="Overdue">Overdue</option></select></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left"><thead className="bg-slate-900/50 text-xs text-slate-300 uppercase tracking-wider"><tr><th className="p-4">Invoice ID</th><th className="p-4">Customer</th><th className="p-4">Date</th><th className="p-4">Amount</th><th className="p-4">Status</th><th className="p-4 text-right">Actions</th></tr></thead>
             <tbody className="divide-y divide-slate-700 text-sm">
               {filteredInvoices.map((inv) => (
                 <tr key={inv._id} className="hover:bg-slate-700/30 transition-colors group">
                    <td className="p-4 font-medium text-blue-400">{inv.invoiceNumber}</td>
                    <td className="p-4 text-slate-200">{inv.customerName}</td>
                    <td className="p-4 text-slate-400">{new Date(inv.invoiceDate).toLocaleDateString()}</td>
                    <td className="p-4 font-bold text-slate-200">₹{inv.totalAmount.toLocaleString()}</td>
                    
                    <td className="p-4">
                      <div className="relative group/status w-fit">
                          <select 
                              value={inv.status}
                              onChange={(e) => handleStatusChange(inv._id, e.target.value)}
                              className={`appearance-none cursor-pointer pl-3 pr-8 py-1 rounded-full text-xs font-medium border focus:outline-none focus:ring-1 focus:ring-offset-0 bg-transparent ${
                                  inv.status === "Paid" ? "border-emerald-500/20 text-emerald-400 bg-emerald-500/5" :
                                  inv.status === "Pending" ? "border-amber-500/20 text-amber-400 bg-amber-500/5" :
                                  "border-rose-500/20 text-rose-400 bg-rose-500/5"
                              }`}
                          >
                              <option value="Paid" className="bg-slate-900 text-emerald-400">Paid</option>
                              <option value="Pending" className="bg-slate-900 text-amber-400">Pending</option>
                              <option value="Overdue" className="bg-slate-900 text-rose-400">Overdue</option>
                          </select>
                          <ChevronDown size={12} className={`absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none ${
                              inv.status === "Paid" ? "text-emerald-400" :
                              inv.status === "Pending" ? "text-amber-400" :
                              "text-rose-400"
                          }`}/>
                      </div>
                    </td>

                    <td className="p-4 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => downloadPDF(inv)} className="p-2 hover:bg-slate-700 rounded text-blue-400" title="Download PDF"><Download size={16}/></button>
                        <button onClick={() => handleEditClick(inv)} className="p-2 hover:bg-slate-700 rounded text-violet-400"><Edit size={16}/></button>
                        <button onClick={() => handleDelete(inv._id)} className="p-2 hover:bg-slate-700 rounded text-rose-400"><Trash2 size={16}/></button>
                    </td>
                 </tr>
               ))}
             </tbody>
          </table>
        </div>
      </motion.div>

      {/* Invoice Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="bg-slate-900 border border-slate-800 shadow-2xl shadow-black/50 text-slate-100 max-w-3xl p-0 overflow-hidden rounded-2xl max-h-[85vh] flex flex-col">
            <div className="px-6 py-5 bg-slate-900/50 border-b border-slate-800 shrink-0">
                 <DialogHeader><DialogTitle className="text-xl font-bold text-slate-100 flex items-center gap-2"><div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/10">{currentInvoice ? <Edit className="w-5 h-5 text-blue-500"/> : <Plus className="w-5 h-5 text-blue-500"/>}</div>{currentInvoice ? "Edit Invoice" : "Create New Invoice"}</DialogTitle></DialogHeader>
            </div>
            
            <div className="overflow-y-auto">
              <form onSubmit={handleSave} className="p-6 space-y-6">
                 {/* ... Form content remains same as previous version but ensures logic consistency ... */}
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1"><User size={12} /> Customer</label>
                       <select className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all" value={formData.customer} onChange={(e) => setFormData({...formData, customer: e.target.value})} required><option value="">Select Customer</option>{customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}</select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1"><CheckCircle2 size={12} /> Status</label>
                       <select className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}><option value="Pending">Pending</option><option value="Paid">Paid</option><option value="Overdue">Overdue</option></select>
                    </div>
                 </div>

                 <div className="bg-slate-950/50 p-5 rounded-2xl border border-slate-800 space-y-4">
                    <div className="flex gap-3">
                       <div className="flex-1">
                           <select className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all" value={selectedProductId} onChange={handleProductSelection}>
                             <option value="">Add Product...</option>
                             {products.map(p => (
                                 <option key={p._id} value={p._id} className={p.quantity <= 0 ? "text-red-400" : "text-slate-200"}>{p.name} (Stock: {p.quantity})</option>
                             ))}
                           </select>
                       </div>
                       <div className="w-24"><input type="number" min="1" className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all text-center" value={selectedProductQuantity} onChange={(e) => setSelectedProductQuantity(Number(e.target.value))}/></div>
                       <button type="button" onClick={handleAddItemToForm} className="btn-primary px-4 shadow-lg shadow-blue-500/20"><Plus size={20}/></button>
                    </div>
                    
                    <div className="min-h-[100px] max-h-[200px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                       {formData.items.length === 0 ? (
                           <div className="flex flex-col items-center justify-center h-24 text-slate-500 border-2 border-dashed border-slate-800 rounded-xl"><ShoppingCart size={20} className="mb-2 opacity-50"/><p className="text-sm">No items added yet</p></div>
                       ) : (
                           formData.items.map((item, idx) => (
                             <div key={idx} className="flex justify-between items-center bg-slate-900 p-3 rounded-xl border border-slate-800">
                                <div className="flex flex-col"><span className="text-slate-200 text-sm font-medium">{item.name}</span><span className="text-slate-500 text-xs">Qty: {item.quantity} × ₹{item.price}</span></div>
                                <div className="flex items-center gap-4"><span className="text-slate-200 font-mono font-medium">₹{(item.price * item.quantity).toLocaleString()}</span><button type="button" onClick={() => setFormData(prev => ({...prev, items: prev.items.filter((_, i) => i !== idx)}))} className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 p-1.5 rounded-lg transition-colors"><X size={14}/></button></div>
                             </div>
                           ))
                       )}
                    </div>
                    
                    <div className="pt-3 border-t border-slate-800 space-y-3">
                       <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-1"><label className="text-xs font-semibold text-slate-400 flex items-center gap-1"><Percent size={10}/> Discount (%)</label><input type="number" min="0" max="100" className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500/50" value={formData.discount} onChange={(e) => setFormData({...formData, discount: e.target.value})}/></div>
                           <div className="space-y-1"><label className="text-xs font-semibold text-slate-400 flex items-center gap-1"><Percent size={10}/> Tax / GST (%)</label><input type="number" min="0" max="100" className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500/50" value={formData.tax} onChange={(e) => setFormData({...formData, tax: e.target.value})}/></div>
                       </div>
                       <div className="bg-slate-900 rounded-xl p-3 space-y-1">
                           <div className="flex justify-between text-xs text-slate-400"><span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
                           <div className="flex justify-between text-xs text-emerald-400"><span>Discount</span><span>- ₹{discountAmount.toLocaleString()}</span></div>
                           <div className="flex justify-between text-xs text-amber-400"><span>Tax</span><span>+ ₹{taxAmount.toLocaleString()}</span></div>
                           <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-slate-800 mt-2"><span>Grand Total</span><span className="text-blue-400">₹{total.toLocaleString()}</span></div>
                       </div>
                    </div>
                 </div>

                 <div className="space-y-2"><label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1"><FileText size={12} /> Notes / Terms</label><textarea className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-600 resize-none h-20" placeholder="Add payment terms or notes..." value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})}/></div>
                 <div className="pt-2 flex justify-end gap-3 border-t border-slate-800/50 mt-4"><DialogClose asChild><button type="button" className="px-4 py-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors font-medium text-sm">Cancel</button></DialogClose><button type="submit" disabled={isSubmitting} className="btn-primary shadow-lg shadow-blue-500/25">{isSubmitting ? <Loader2 className="animate-spin w-4 h-4"/> : "Save Invoice"}</button></div>
              </form>
            </div>
         </DialogContent>
      </Dialog>
    </div>
  );
};

export default Invoices;