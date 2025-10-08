// Import Part model
const Part = require("../models/Part");

// @desc    Create a new part
// @route   POST /api/parts
// @access  Public (can add auth later)
const createPart = async (req, res) => {
    try {
        const { partId, name, description, partNumber, quantity, minimumStock, unitPrice, location, categoryId, reportId } = req.body;

        // Validate required fields
        if (!partId || !name || !description || !partNumber || quantity === undefined || minimumStock === undefined || !unitPrice || !location || !categoryId) {
            return res.status(400).json({ 
                message: "All required fields must be provided (partId, name, description, partNumber, quantity, minimumStock, unitPrice, location, categoryId)" 
            });
        }

        // Validate numeric fields
        if (quantity < 0) {
            return res.status(400).json({ message: "Quantity cannot be negative" });
        }
        if (minimumStock < 0) {
            return res.status(400).json({ message: "Minimum stock cannot be negative" });
        }
        if (unitPrice < 0) {
            return res.status(400).json({ message: "Unit price cannot be negative" });
        }

        // Check if part with same partId already exists
        const existingPartById = await Part.findOne({ partId });
        if (existingPartById) {
            return res.status(400).json({ message: "Part ID already exists" });
        }

        // Check if part with same partNumber already exists
        const existingPartByNumber = await Part.findOne({ partNumber });
        if (existingPartByNumber) {
            return res.status(400).json({ message: "Part number already exists" });
        }

        const part = new Part({
            partId,
            name,
            description,
            partNumber,
            quantity,
            minimumStock,
            unitPrice,
            location,
            categoryId,
            reportId: reportId || null,
        });

        const savedPart = await part.save();
        res.status(201).json(savedPart);
    } catch (error) {
        // Handle mongoose validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc    Get all parts
// @route   GET /api/parts
// @access  Public
const getParts = async (req, res) => {
    try {
        const parts = await Part.find().sort({ name: 1 });
        res.status(200).json(parts);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc    Get part by ID
// @route   GET /api/parts/:id
// @access  Public
const getPartById = async (req, res) => {
    try {
        const part = await Part.findById(req.params.id);
        if (!part) {
            return res.status(404).json({ message: "Part not found" });
        }
        res.status(200).json(part);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc    Get parts by category
// @route   GET /api/parts/category/:categoryId
// @access  Public
const getPartsByCategory = async (req, res) => {
    try {
        const parts = await Part.find({ categoryId: req.params.categoryId }).sort({ name: 1 });
        res.status(200).json(parts);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc    Get low stock parts
// @route   GET /api/parts/low-stock
// @access  Public
const getLowStockParts = async (req, res) => {
    try {
        const parts = await Part.find({ $expr: { $lte: ['$quantity', '$minimumStock'] } }).sort({ quantity: 1 });
        res.status(200).json(parts);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc    Update a part
// @route   PUT /api/parts/:id
// @access  Public
const updatePart = async (req, res) => {
    try {
        const { quantity, minimumStock, unitPrice, partNumber } = req.body;

        // Validate numeric fields if provided
        if (quantity !== undefined && quantity < 0) {
            return res.status(400).json({ message: "Quantity cannot be negative" });
        }
        if (minimumStock !== undefined && minimumStock < 0) {
            return res.status(400).json({ message: "Minimum stock cannot be negative" });
        }
        if (unitPrice !== undefined && unitPrice < 0) {
            return res.status(400).json({ message: "Unit price cannot be negative" });
        }

        // Check if partNumber is being changed and if it already exists
        if (partNumber) {
            const existingPart = await Part.findOne({ 
                partNumber, 
                _id: { $ne: req.params.id } 
            });
            if (existingPart) {
                return res.status(400).json({ message: "Part number already in use by another part" });
            }
        }

        const updatedPart = await Part.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true } // Return the updated document and run validators
        );
        if (!updatedPart) {
            return res.status(404).json({ message: "Part not found" });
        }
        res.status(200).json(updatedPart);
    } catch (error) {
        // Handle mongoose validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc    Update part quantity (for stock management)
// @route   PATCH /api/parts/:id/quantity
// @access  Public
const updatePartQuantity = async (req, res) => {
    try {
        const { quantity } = req.body;

        if (quantity === undefined) {
            return res.status(400).json({ message: "Quantity is required" });
        }

        if (quantity < 0) {
            return res.status(400).json({ message: "Quantity cannot be negative" });
        }

        const updatedPart = await Part.findByIdAndUpdate(
            req.params.id,
            { quantity },
            { new: true, runValidators: true }
        );

        if (!updatedPart) {
            return res.status(404).json({ message: "Part not found" });
        }

        res.status(200).json(updatedPart);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc    Delete a part
// @route   DELETE /api/parts/:id
// @access  Public
const deletePart = async (req, res) => {
    try {
        const deletedPart = await Part.findByIdAndDelete(req.params.id);
        if (!deletedPart) {
            return res.status(404).json({ message: "Part not found" });
        }
        res.status(200).json({ message: "Part deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

module.exports = {
    createPart,
    getParts,
    getPartById,
    getPartsByCategory,
    getLowStockParts,
    updatePart,
    updatePartQuantity,
    deletePart,
};
