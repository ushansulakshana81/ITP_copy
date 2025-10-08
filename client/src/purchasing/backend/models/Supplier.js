// Import mongoose to define the schema
const mongoose = require("mongoose");

// Define Supplier Schema
const supplierSchema = new mongoose.Schema(
    {
        supplierId: {
            type: String,
            required: true,
            unique: true,   // Ensure supplier ID is unique
            trim: true,
        },
        name: {
            type: String,
            required: true, // Name is mandatory
            trim: true,     // Remove extra spaces
        },
        contactEmail: {
            type: String,
            required: true,
            unique: true,   // No duplicate emails allowed
            trim: true,
            lowercase: true, // Store emails in lowercase
            match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
        },
        contactPhone: {
            type: String,
            required: true,
            trim: true,
            match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
        },
        address: {
            type: String,
            required: true,
            trim: true,
        },
        reportId: {
            type: String,
            required: false, // Optional field
            trim: true,
        },
    },
    {
        timestamps: true, // Automatically add createdAt and updatedAt
    }
);

// Create Supplier model using the schema
const Supplier = mongoose.model("Supplier", supplierSchema);

// Export the model for use in controllers
module.exports = Supplier;