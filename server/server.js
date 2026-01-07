const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const fs = require("fs"); // <--- IMPORT THIS
require("dotenv").config();

const authRoutes = require("./routes/authRoutes.js");
const productRoutes = require("./routes/productRoutes.js");
const customerRoutes = require("./routes/customerRoutes.js");
const invoiceRoutes = require("./routes/invoiceRoutes.js");
const purchaseRoutes = require("./routes/purchaseRoutes.js"); // <--- IMPORT THIS
const chatRoutes = require("./routes/chatRoutes.js"); 
const analyticsRoutes = require("./routes/analyticsRoutes.js");

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected successfully."))
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });

// --- CRITICAL: Ensure 'uploads' folder exists for Multer ---
if (!fs.existsSync('./uploads')){
    fs.mkdirSync('./uploads');
    console.log("✅ Created 'uploads' directory for temporary files.");
}
// -----------------------------------------------------------

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/purchases", purchaseRoutes); // <--- REGISTER THIS
app.use("/api/chat", chatRoutes);
app.use("/api/analytics", analyticsRoutes);

app.get("/", (req, res) => {
  res.send("🚀 Billing & Inventory API is running!");
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});