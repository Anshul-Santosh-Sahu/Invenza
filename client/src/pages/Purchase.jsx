import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { UploadCloud, ScanLine, Save, Trash2, Plus, AlertCircle, CheckCircle2 } from 'lucide-react';

const Purchase = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scannedItems, setScannedItems] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 1. Handle File Selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setError('');
      setSuccess('');
    }
  };

  // 2. Upload Image & Run OCR
  const handleScan = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a bill image first.');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('billImage', file);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/purchases/scan', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}` 
        }
      });

      // Enrich scanned items with empty fields for the new data points
      const enrichedItems = res.data.detectedItems.map(item => ({
        ...item,
        category: '',
        supplier: '',
        description: ''
      }));

      setScannedItems(enrichedItems);
      setSuccess('Scan complete! Please review and fill in missing details.');
    } catch (err) {
      console.error(err);
      setError('Failed to scan image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Handle Input Changes in the Table
  const handleItemChange = (index, field, value) => {
    const newItems = [...scannedItems];
    newItems[index][field] = value;
    setScannedItems(newItems);
  };

  // 4. Remove an item
  const removeItem = (index) => {
    const newItems = scannedItems.filter((_, i) => i !== index);
    setScannedItems(newItems);
  };

  // 5. Save Items to Database
  const saveToInventory = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    let savedCount = 0;
    let failCount = 0;

    for (const item of scannedItems) {
      try {
        await axios.post('http://localhost:5000/api/products', {
          name: item.name,
          sku: item.sku,
          price: parseFloat(item.price),
          quantity: parseInt(item.quantity) || 1,
          category: item.category,
          supplier: item.supplier,
          description: item.description
        }, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        savedCount++;
      } catch (err) {
        console.error(`Failed to save ${item.name}`, err);
        failCount++;
      }
    }

    setLoading(false);
    if (failCount === 0) {
      setSuccess(`Successfully added ${savedCount} products to inventory!`);
      setScannedItems([]);
      setFile(null);
      setPreview(null);
    } else {
      setError(`Saved ${savedCount} products, but failed ${failCount}. Check for duplicate SKUs.`);
    }
  };

  // Add a manual empty row with all fields
  const addEmptyRow = () => {
    setScannedItems([
      ...scannedItems, 
      { name: '', sku: '', price: 0, quantity: 1, category: '', supplier: '', description: '' }
    ]);
  };

  return (
    <div className="min-h-screen text-slate-100 p-2">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
             <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">
              Purchase Entry
            </h1>
            <p className="text-slate-400 mt-1 text-sm">Scan bills to auto-fill inventory or add stock manually.</p>
          </div>
          <div className="p-3 bg-blue-500/10 rounded-full border border-blue-500/20 shadow-lg shadow-blue-500/10">
            <ScanLine className="text-blue-400 w-6 h-6" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- LEFT: Upload Section --- */}
          <motion.div 
             initial={{ x: -20, opacity: 0 }}
             animate={{ x: 0, opacity: 1 }}
             transition={{ delay: 0.2 }}
             className="glass-panel p-6 rounded-2xl shadow-xl lg:col-span-1 h-fit border-slate-700 bg-slate-800/40"
          >
            <h2 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-indigo-400" /> Upload Bill
            </h2>

            <div className="relative group border-2 border-dashed border-slate-600 hover:border-blue-500 rounded-xl transition-all duration-300 bg-slate-900/50 overflow-hidden">
              <input 
                type="file" 
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="p-8 text-center flex flex-col items-center justify-center min-h-[200px]">
                {preview ? (
                   <img src={preview} alt="Preview" className="max-h-64 rounded-lg shadow-lg object-contain" />
                ) : (
                  <>
                    <UploadCloud className="w-12 h-12 text-slate-500 mb-3 group-hover:text-blue-400 transition-colors" />
                    <p className="text-sm text-slate-400 font-medium group-hover:text-slate-200">Click to upload or drag image</p>
                    <p className="text-xs text-slate-500 mt-1">PNG, JPG supported</p>
                  </>
                )}
              </div>
            </div>

            <button 
              onClick={handleScan} 
              disabled={loading || !file}
              className={`w-full mt-6 py-3 rounded-xl font-bold text-sm tracking-wide shadow-lg transition-all duration-300 flex items-center justify-center gap-2
                ${loading || !file 
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed border border-slate-600' 
                  : 'btn-primary'
                }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"/> 
                  Processing...
                </>
              ) : (
                <> <ScanLine className="w-4 h-4" /> SCAN NOW </>
              )}
            </button>

            {/* Alerts */}
            {error && (
              <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center gap-3 text-rose-400 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}
            {success && (
              <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-3 text-emerald-400 text-sm">
                <CheckCircle2 className="w-4 h-4 shrink-0" /> {success}
              </div>
            )}
          </motion.div>

          {/* --- RIGHT: Results Table --- */}
          <motion.div 
             initial={{ x: 20, opacity: 0 }}
             animate={{ x: 0, opacity: 1 }}
             transition={{ delay: 0.3 }}
             className="glass-panel p-6 rounded-2xl shadow-xl lg:col-span-2 flex flex-col min-h-[500px] border-slate-700 bg-slate-800/40"
          >
             <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                  <ScanLine className="w-5 h-5 text-blue-400" /> 
                  Extracted Items
                </h2>
                <button 
                  onClick={addEmptyRow}
                  className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-600 transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add Manual
                </button>
             </div>

             <div className="flex-1 overflow-x-auto rounded-xl border border-slate-700 bg-slate-900/50">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-slate-800/50 border-b border-slate-700 text-slate-400 text-xs uppercase tracking-wider">
                    <th className="p-4 font-semibold w-1/4">Product Name</th>
                    <th className="p-4 font-semibold w-24">SKU</th>
                    <th className="p-4 font-semibold w-24">Category</th>
                    <th className="p-4 font-semibold w-24">Supplier</th>
                    <th className="p-4 font-semibold w-20">Price</th>
                    <th className="p-4 font-semibold w-16">Qty</th>
                    <th className="p-4 font-semibold w-16 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {scannedItems.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-slate-500 italic">
                        No items scanned yet. Upload a bill to begin.
                      </td>
                    </tr>
                  ) : (
                    scannedItems.map((item, index) => (
                      <tr key={index} className="hover:bg-slate-800/30 transition-colors group">
                        <td className="p-2">
                          <input 
                            type="text" 
                            value={item.name} 
                            onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                            className="w-full bg-transparent border-none text-slate-200 focus:ring-1 focus:ring-blue-500 rounded px-2 py-1 text-sm placeholder-slate-600"
                            placeholder="Product Name"
                          />
                        </td>
                        <td className="p-2">
                          <input 
                            type="text" 
                            value={item.sku} 
                            onChange={(e) => handleItemChange(index, 'sku', e.target.value)}
                            className="w-full bg-transparent border-none text-slate-400 focus:ring-1 focus:ring-blue-500 rounded px-2 py-1 text-sm font-mono placeholder-slate-600"
                            placeholder="SKU"
                          />
                        </td>
                        <td className="p-2">
                          <input 
                            type="text" 
                            value={item.category} 
                            onChange={(e) => handleItemChange(index, 'category', e.target.value)}
                            className="w-full bg-transparent border-none text-slate-300 focus:ring-1 focus:ring-blue-500 rounded px-2 py-1 text-sm placeholder-slate-600"
                            placeholder="Category"
                          />
                        </td>
                        <td className="p-2">
                          <input 
                            type="text" 
                            value={item.supplier} 
                            onChange={(e) => handleItemChange(index, 'supplier', e.target.value)}
                            className="w-full bg-transparent border-none text-slate-300 focus:ring-1 focus:ring-blue-500 rounded px-2 py-1 text-sm placeholder-slate-600"
                            placeholder="Supplier"
                          />
                        </td>
                        <td className="p-2">
                          <input 
                            type="number" 
                            value={item.price} 
                            onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                            className="w-20 bg-transparent border-none text-blue-300 font-bold focus:ring-1 focus:ring-blue-500 rounded px-2 py-1 text-sm"
                          />
                        </td>
                        <td className="p-2">
                          <input 
                            type="number" 
                            value={item.quantity} 
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                            className="w-16 bg-slate-800 border border-slate-600 text-center text-slate-200 focus:border-blue-500 rounded-md py-1 text-sm outline-none"
                          />
                        </td>
                        <td className="p-2 text-center">
                          <button 
                            onClick={() => removeItem(index)}
                            className="p-1.5 hover:bg-rose-500/20 rounded text-slate-500 hover:text-rose-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-end border-t border-slate-700 pt-6">
               <button 
                onClick={saveToInventory}
                disabled={loading || scannedItems.length === 0}
                className={`px-8 py-3 rounded-xl font-bold text-sm tracking-wide shadow-lg transition-all duration-300 flex items-center gap-2
                  ${loading || scannedItems.length === 0
                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white hover:shadow-emerald-500/20 hover:-translate-y-1'
                  }`}
              >
                {loading ? 'Saving...' : <> <Save className="w-4 h-4" /> ADD TO STOCK </>}
              </button>
            </div>

          </motion.div>

        </div>
      </motion.div>
    </div>
  );
};

export default Purchase;