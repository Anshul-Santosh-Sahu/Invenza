const nodeFetch = require('node-fetch'); // FIX: Use CJS import variable instead of 'fetch' global
const Product = require("../model/productModel");
const Invoice = require("../model/invoiceModel");
const Customer = require("../model/customerModel");
require("dotenv").config();

// Configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ""; // Ensure you set this in .env
const GEMINI_MODEL = "gemini-2.5-flash"; 
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;


const chatWithAI = async (req, res) => {
  const { message } = req.body;
  const userId = req.user.id; 

  if (!message) {
    return res.status(400).json({ message: "Message is required" });
  }

  try {
    // 1. Gather Context
    const lowStockProducts = await Product.find({ user_id: userId, quantity: { $lt: 10 } })
      .select("name quantity price")
      .limit(5);

    const recentInvoices = await Invoice.find({ user_id: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("customer", "name");

    const customerCount = await Customer.countDocuments({ user_id: userId });

    // 2. System Prompt
    const systemInstruction = `
      You are Invenza AI, a responsive chat assistant for a business owner.
      
      Context:
      - Total Customers: ${customerCount}
      - Low Stock Warning: ${JSON.stringify(lowStockProducts)}
      - Recent Invoices: ${JSON.stringify(recentInvoices)}
      
      Answer the user's question based strictly on this data. Be concise and friendly.
    `;

    // 3. CALL GEMINI API
    let aiResponseText = "I'm currently in mock mode.";

    if (GEMINI_API_KEY) {
        const payload = {
            contents: [{ parts: [{ text: message }] }],
            systemInstruction: { parts: [{ text: systemInstruction }] },
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 150,
            }
        };

        // FIX: Use nodeFetch variable instead of fetch
        const response = await nodeFetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            const result = await response.json();
            aiResponseText = result.candidates?.[0]?.content?.parts?.[0]?.text || "Gemini returned an empty response.";
        } else {
            console.error("Gemini API Error:", response.status);
            aiResponseText = `Chat failed (Error ${response.status}). Try setting your API key.`;
        }
    } else {
        aiResponseText += ` You have ${customerCount} customers.`;
    }

    res.status(200).json({ reply: aiResponseText });

  } catch (error) {
    console.error("Chat Error:", error);
    res.status(500).json({ reply: "I'm having trouble connecting to my brain right now." });
  }
};

module.exports = { chatWithAI };