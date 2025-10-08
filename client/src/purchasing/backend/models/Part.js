// Import mongoose to define the schema
const mongoose = require("mongoose");

// Define Part Schema
const partSchema = new mongoose.Schema(
    {
        partId: {
            type: String,
            required: true,
            unique: true,   // Ensure part ID is unique
            trim: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        partNumber: {
            type: String,
            required: true,
            unique: true,   // Part number should be unique
            trim: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: [0, 'Quantity cannot be negative'],
            default: 0,
        },
        minimumStock: {
            type: Number,
            required: true,
            min: [0, 'Minimum stock cannot be negative'],
            default: 0,
        },
        unitPrice: {
            type: Number,
            required: true,
            min: [0, 'Unit price cannot be negative'],
        },
        location: {
            type: String,
            required: true,
            trim: true,
        },
        categoryId: {
            type: String,
            required: true,
            trim: true,
        },
        reportId: {
            type: String,
            required: false,
            trim: true,
        },
    },
    {
        timestamps: true, // Automatically add createdAt and updatedAt
    }
);

// Add index for faster queries on categoryId only (partId and partNumber already have unique indexes)
partSchema.index({ categoryId: 1 });

// Virtual property to check if stock is low
partSchema.virtual('isLowStock').get(function() {
    return this.quantity <= this.minimumStock;
});

// Ensure virtuals are included when converting to JSON
partSchema.set('toJSON', { virtuals: true });
partSchema.set('toObject', { virtuals: true });

// Create Part model using the schema
const Part = mongoose.model("Part", partSchema);

// Export the model for use in controllers
module.exports = Part;
