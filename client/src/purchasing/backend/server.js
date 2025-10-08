// Import required packages
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

// Import routes
const supplierRoutes = require("./routes/supplierRoutes");
const purchaseOrderRoutes = require("./routes/purchaseOrderRoutes");
const partRoutes = require("./routes/partRoutes");
const quotationRoutes = require("./routes/quotationRoutes");

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON requests

// Connect to MongoDB
connectDB();

// Routes
app.get("/", (req, res) => {
    res.send("HeavySync Backend Running!");
});

// Use routes
app.use("/api/suppliers", supplierRoutes);
app.use("/api/purchase-orders", purchaseOrderRoutes);
app.use("/api/parts", partRoutes);
app.use("/api/quotations", quotationRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));