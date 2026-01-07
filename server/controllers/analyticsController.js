// FIX: Removed 'node-fetch' import to use Node.js v18+ native global fetch
const Invoice = require("../model/invoiceModel");
const Product = require("../model/productModel");
const Customer = require("../model/customerModel");
require("dotenv").config();

// Configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_MODEL = "gemini-2.5-flash"; 
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

const getAnalyticsOverview = async (req, res) => {
  const userId = req.user.id;

  try {
    // 1. GATHER REAL DATA
    const products = await Product.find({ user_id: userId });
    const lowStockItems = products.filter(p => p.quantity < 10).map(p => p.name);
    const totalStockValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    
    const invoices = await Invoice.find({ user_id: userId });
    const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
    const unpaidInvoices = invoices.filter(inv => inv.status !== 'Paid').length;
    
    const customerCount = await Customer.countDocuments({ user_id: userId });

    // 2. CONSTRUCT PROMPT
    const systemInstruction = `
      You are Invenza AI, a Senior Business Analyst. Analyze the following live data for my store.
      
      Rules for Output:
      1. Provide a concise "Executive Summary" (max 3 sentences) identifying the biggest risk (low stock, unpaid bills) and the biggest win.
      2. Use simple, direct business language.
    `;

    const userPrompt = `
      Analyze this live data:
      - Total Revenue: ${totalRevenue.toFixed(0)}
      - Total Customers: ${customerCount}
      - Total Inventory Value: ${totalStockValue.toFixed(0)}
      - Unpaid Invoices: ${unpaidInvoices}
      - Low Stock Items (${lowStockItems.length}): ${lowStockItems.join(", ") || "None"}
    `;

    // 3. CALL GEMINI API (Using Native Global fetch)
    let aiResponseText = "AI Service is currently unavailable.";
    
    if (GEMINI_API_KEY) {
        const payload = {
            contents: [{ parts: [{ text: userPrompt }] }],
            systemInstruction: { parts: [{ text: systemInstruction }] },
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 200,
            }
        };

        // Using global fetch (No import needed for Node v18+)
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            const result = await response.json();
            aiResponseText = result.candidates?.[0]?.content?.parts?.[0]?.text || "Gemini returned an empty response.";
        } else {
            const errorBody = await response.json();
            console.error("Gemini API Error:", response.status, errorBody);
            aiResponseText = `AI Service failed (Error ${response.status}). Check server logs.`;
        }
    } else {
        aiResponseText = "Gemini API Key is missing in server configuration.";
    }

    // 4. SEND RESPONSE
    res.status(200).json({
      summary: aiResponseText,
      stats: {
        revenue: totalRevenue,
        customers: customerCount,
        products: products.length,
        lowStockCount: lowStockItems.length
      }
    });

  } catch (error) {
    console.error("Analytics Error:", error);
    res.status(500).json({ message: "Failed to process analytics request" });
  }
};

module.exports = { getAnalyticsOverview };