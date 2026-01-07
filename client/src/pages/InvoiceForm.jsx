import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Trash2, FileText, Loader2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

function InvoiceForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [items, setItems] = useState([{ productId: "", quantity: 1, price: 0 }]);
  const [status, setStatus] = useState("Pending");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customerRes, productRes] = await Promise.all([
          api.get("/customers"),
          api.get("/products"),
        ]);
        setCustomers(customerRes.data);
        setProducts(productRes.data);

        if (isEditing) {
          const invoiceRes = await api.get(`/invoices/${id}`);
          const invoice = invoiceRes.data;
          setSelectedCustomer(invoice.customer._id);
          setStatus(invoice.status);
          setItems(
            invoice.items.map((item) => ({
              productId: item.product._id,
              quantity: item.quantity,
              price: item.price,
            }))
          );
        }
      } catch (err) {
        console.error("Failed to load invoice form data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, isEditing]);

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    if (field === "productId") {
      const product = products.find((p) => p._id === value);
      updated[index].price = product ? product.price : 0;
    }
    setItems(updated);
  };

  const addItem = () =>
    setItems([...items, { productId: "", quantity: 1, price: 0 }]);
  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

  const calculateTotal = () =>
    items.reduce((total, item) => total + item.quantity * item.price, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const invoiceData = {
      customer: selectedCustomer,
      items: items.map((item) => ({ 
        product: item.productId, // Ensure the key is 'product' for the backend
        quantity: item.quantity,
        price: item.price,
      })),
      status,
      totalAmount: calculateTotal(),
    };

    try {
      if (isEditing) {
        // In edit mode, you might only want to update status, or the full invoice.
        // The first example only updates status, which is simpler.
        // Let's assume for now we just update status. If full update is needed, use the same payload as create.
        await api.put(`/invoices/${id}`, { status });
      } else {
        await api.post("/invoices", invoiceData);
      }
      navigate("/invoices");
    } catch (err) {
      console.error("Failed to save invoice", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64 text-cyan-400">
        <Loader2 className="animate-spin mr-2" /> Loading invoice form...
      </div>
    );

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-5xl mx-auto p-4 md:p-0 space-y-8 text-white relative"
    >
      {/* Background Blur */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/10 via-fuchsia-900/10 to-transparent blur-3xl -z-10"></div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="text-cyan-400" size={30} />
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
            {isEditing ? "Edit Invoice" : "Create New Invoice"}
          </h1>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/invoices")}
          className="border border-white/20 hover:border-fuchsia-400/40 transition-all"
        >
          Back
        </Button>
      </div>

      {/* Customer & Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/10 backdrop-blur-2xl p-6 rounded-xl border border-white/20 shadow-lg">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Customer
          </label>
          <select
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
            disabled={isEditing}
            className="w-full bg-transparent border border-white/20 rounded-md p-2 text-white focus:ring-2 focus:ring-cyan-400 focus:outline-none"
            required
          >
            <option value="" disabled className="bg-gray-900">
              Select a customer
            </option>
            {customers.map((c) => (
              <option key={c._id} value={c._id} className="bg-gray-900">
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full bg-transparent border border-white/20 rounded-md p-2 text-white focus:ring-2 focus:ring-fuchsia-400 focus:outline-none"
          >
            <option className="bg-gray-900">Pending</option>
            <option className="bg-gray-900">Paid</option>
            <option className="bg-gray-900">Overdue</option>
          </select>
        </div>
      </div>

      {/* Items */}
      <div className="bg-white/10 backdrop-blur-2xl p-6 rounded-xl border border-white/20 shadow-lg">
        <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-cyan-400 to-fuchsia-400 bg-clip-text text-transparent">
          Line Items
        </h2>
        {items.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="grid grid-cols-12 gap-4 mb-3 items-center"
          >
            <div className="col-span-5">
              <select
                value={item.productId}
                onChange={(e) =>
                  handleItemChange(index, "productId", e.target.value)
                }
                disabled={isEditing}
                className="w-full bg-transparent border border-white/20 p-2 rounded-md text-white focus:ring-2 focus:ring-cyan-400 focus:outline-none"
                required
              >
                <option value="" disabled className="bg-gray-900">
                  Select product
                </option>
                {products.map((p) => (
                  <option key={p._id} value={p._id} className="bg-gray-900">
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <Input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) =>
                  handleItemChange(index, "quantity", e.target.value)
                }
                disabled={isEditing}
                className="bg-transparent border-white/20 text-white focus:ring-2 focus:ring-cyan-400"
                required
              />
            </div>
            <div className="col-span-2">
              <Input
                type="number"
                step="0.01"
                min="0"
                value={item.price}
                onChange={(e) =>
                  handleItemChange(index, "price", e.target.value)
                }
                disabled={isEditing}
                className="bg-transparent border-white/20 text-white focus:ring-2 focus:ring-fuchsia-400"
                required
              />
            </div>
            <div className="col-span-2 text-right font-semibold text-cyan-300">
              {formatCurrency(item.quantity * item.price)}
            </div>
            <div className="col-span-1 text-center">
              {!isEditing && items.length > 1 && (
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => removeItem(index)}
                  className="p-2 hover:bg-red-600/30"
                >
                  <Trash2 size={16} />
                </Button>
              )}
            </div>
          </motion.div>
        ))}
        {!isEditing && (
          <Button
            type="button"
            onClick={addItem}
            variant="secondary"
            className="mt-3 flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white hover:shadow-[0_0_15px_rgba(168,85,247,0.5)]"
          >
            <Plus size={16} /> Add Item
          </Button>
        )}
      </div>

      {/* Total */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-2xl p-6 rounded-xl border border-white/20 shadow-lg flex justify-between items-center"
      >
        <div className="text-xl font-semibold">
          Total:{" "}
          <motion.span
            key={calculateTotal()}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="ml-2 text-3xl font-bold bg-gradient-to-r from-cyan-400 to-fuchsia-400 bg-clip-text text-transparent"
          >
            {formatCurrency(calculateTotal())}
          </motion.span>
        </div>
        <Button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-fuchsia-500 hover:shadow-[0_0_20px_rgba(168,85,247,0.6)] text-white px-6 py-2 rounded-lg transition-all"
        >
          {saving ? (
            <>
              <Loader2 className="animate-spin" size={18} /> Saving...
            </>
          ) : isEditing ? (
            "Save Changes"
          ) : (
            "Create Invoice"
          )}
        </Button>
      </motion.div>
    </motion.form>
  );
}

export default InvoiceForm;