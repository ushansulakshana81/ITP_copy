// Import express
const express = require("express");

// Import controller functions
const {
    createSupplier,
    getSuppliers,
    getSupplierById,
    updateSupplier,
    deleteSupplier,
} = require("../controllers/supplierController");

// Create a router
const router = express.Router();

// Routes mapping

// Create a new supplier
router.post("/", createSupplier);

// Get all suppliers
router.get("/", getSuppliers);

// Get a supplier by ID
router.get("/:id", getSupplierById);

// Update a supplier by ID
router.put("/:id", updateSupplier);

// Delete a supplier by ID
router.delete("/:id", deleteSupplier);

// Export router to use in server.js
module.exports = router;