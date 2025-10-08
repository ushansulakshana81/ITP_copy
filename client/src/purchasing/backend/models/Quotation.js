// Import mongoose to define the schema
const mongoose = require("mongoose");

// Define Quotation Schema
const quotationSchema = new mongoose.Schema(
    {
        quotationId: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        part: {
            partId: {
                type: String,
                required: true,
            },
            partNumber: {
                type: String,
                required: true,
            },
            name: {
                type: String,
                required: true,
            },
        },
        quantity: {
            type: Number,
            required: true,
            min: [1, 'Quantity must be at least 1'],
        },
        suppliers: [{
            supplierId: {
                type: String,
                required: true,
            },
            name: {
                type: String,
                required: true,
            },
            contactEmail: {
                type: String,
                required: true,
            },
            quotedPrice: {
                type: Number,
                default: 0,
            },
            deliveryTime: {
                type: String,
                default: '',
            },
            status: {
                type: String,
                enum: ['pending', 'received', 'declined'],
                default: 'pending',
            },
        }],
        status: {
            type: String,
            enum: ['draft', 'sent', 'comparing', 'completed', 'cancelled'],
            default: 'draft',
        },
        notes: {
            type: String,
            default: '',
        },
    },
    {
        timestamps: true,
    }
);

// Create Quotation model using the schema
const Quotation = mongoose.model("Quotation", quotationSchema);

module.exports = Quotation;
