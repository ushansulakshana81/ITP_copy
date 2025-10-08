// Import Supplier model
const Supplier = require("../models/Supplier");

// @desc    Create a new supplier
// @route   POST /api/suppliers
// @access  Public (can add auth later)
const createSupplier = async (req, res) => {
    try {
        const { supplierId, name, contactEmail, contactPhone, address, reportId } = req.body;

        // Validate required fields
        if (!supplierId || !name || !contactEmail || !contactPhone || !address) {
            return res.status(400).json({ 
                message: "All required fields must be provided (supplierId, name, contactEmail, contactPhone, address)" 
            });
        }

        // Validate email format
        const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (!contactEmail.includes('@')) {
            return res.status(400).json({ message: "Email must contain @" });
        }
        if (!emailRegex.test(contactEmail)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        // Validate phone number (10 digits and no digit repeated more than 4 times)
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(contactPhone)) {
            return res.status(400).json({ message: "Phone number must be exactly 10 digits" });
        }
        
        // Check if any digit appears more than 4 times
        const digitCount = {};
        for (let digit of contactPhone) {
            digitCount[digit] = (digitCount[digit] || 0) + 1;
            if (digitCount[digit] > 4) {
                return res.status(400).json({ message: "Invalid phone number pattern" });
            }
        }

        // Check if supplier with same supplierId already exists
        const existingSupplierById = await Supplier.findOne({ supplierId });
        if (existingSupplierById) {
            return res.status(400).json({ message: "Supplier ID already exists" });
        }

        // Check if supplier with same email already exists
        const existingSupplier = await Supplier.findOne({ contactEmail });
        if (existingSupplier) {
            return res.status(400).json({ message: "Supplier with this email already exists" });
        }

        const supplier = new Supplier({
            supplierId,
            name,
            contactEmail,
            contactPhone,
            address,
            reportId: reportId || null,
        });

        const savedSupplier = await supplier.save();
        res.status(201).json(savedSupplier);
    } catch (error) {
        // Handle mongoose validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc    Get all suppliers
// @route   GET /api/suppliers
// @access  Public
const getSuppliers = async (req, res) => {
    try {
        const suppliers = await Supplier.find();
        res.status(200).json(suppliers);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc    Get supplier by ID
// @route   GET /api/suppliers/:id
// @access  Public
const getSupplierById = async (req, res) => {
    try {
        const supplier = await Supplier.findById(req.params.id);
        if (!supplier) {
            return res.status(404).json({ message: "Supplier not found" });
        }
        res.status(200).json(supplier);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc    Update a supplier
// @route   PUT /api/suppliers/:id
// @access  Public
const updateSupplier = async (req, res) => {
    try {
        const { contactEmail, contactPhone } = req.body;

        // Validate email format if provided
        if (contactEmail) {
            const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            if (!contactEmail.includes('@')) {
                return res.status(400).json({ message: "Email must contain @" });
            }
            if (!emailRegex.test(contactEmail)) {
                return res.status(400).json({ message: "Invalid email format" });
            }

            // Check if email is already used by another supplier
            const existingSupplier = await Supplier.findOne({ 
                contactEmail, 
                _id: { $ne: req.params.id } 
            });
            if (existingSupplier) {
                return res.status(400).json({ message: "Email already in use by another supplier" });
            }
        }

        // Validate phone number if provided
        if (contactPhone) {
            const phoneRegex = /^[0-9]{10}$/;
            if (!phoneRegex.test(contactPhone)) {
                return res.status(400).json({ message: "Phone number must be exactly 10 digits" });
            }
            
            // Check if any digit appears more than 4 times
            const digitCount = {};
            for (let digit of contactPhone) {
                digitCount[digit] = (digitCount[digit] || 0) + 1;
                if (digitCount[digit] > 4) {
                    return res.status(400).json({ message: "Invalid phone number pattern" });
                }
            }
        }

        const updatedSupplier = await Supplier.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true } // Return the updated document and run validators
        );
        if (!updatedSupplier) {
            return res.status(404).json({ message: "Supplier not found" });
        }
        res.status(200).json(updatedSupplier);
    } catch (error) {
        // Handle mongoose validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc    Delete a supplier
// @route   DELETE /api/suppliers/:id
// @access  Public
const deleteSupplier = async (req, res) => {
    try {
        const deletedSupplier = await Supplier.findByIdAndDelete(req.params.id);
        if (!deletedSupplier) {
            return res.status(404).json({ message: "Supplier not found" });
        }
        res.status(200).json({ message: "Supplier deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

module.exports = {
    createSupplier,
    getSuppliers,
    getSupplierById,
    updateSupplier,
    deleteSupplier,
};