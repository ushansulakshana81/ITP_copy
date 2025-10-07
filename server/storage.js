import {
    SupplierModel,
    CategoryModel,
    PartModel,
    MovementModel,
    ReportModel
} from "../shared/schema.js";

export class DatabaseStorage {
    // Suppliers
    async getSuppliers() {
        return await SupplierModel.find().sort({createdAt: -1}).lean();
    }

    async getSupplier(id) {
        const supplier = await SupplierModel.findById(id).lean();
        return supplier || undefined;
    }

    async createSupplier(insertSupplier) {
        const supplier = new SupplierModel(insertSupplier);
        return await supplier.save();
    }

    async updateSupplier(id, supplierData) {
        const updated = await SupplierModel.findByIdAndUpdate(
            id,
            supplierData,
            {new: true, runValidators: true}
        );
        if (!updated) throw new Error("Supplier not found");
        return updated;
    }

    async deleteSupplier(id) {
        const result = await SupplierModel.findByIdAndDelete(id);
        return !!result;
    }

    // Categories
    async getCategories() {
        return await CategoryModel.find().sort({createdAt: -1}).lean();
    }

    async getCategory(id) {
        const category = await CategoryModel.findById(id).lean();
        return category || undefined;
    }

    async createCategory(insertCategory) {
        const category = new CategoryModel(insertCategory);
        return await category.save();
    }

    async updateCategory(id, categoryData) {
        const updated = await CategoryModel.findByIdAndUpdate(
            id,
            categoryData,
            {new: true, runValidators: true}
        );
        if (!updated) throw new Error("Category not found");
        return updated;
    }

    async deleteCategory(id) {
        const result = await CategoryModel.findByIdAndDelete(id);
        return !!result;
    }

    // Parts
    async getParts() {
        const parts = await PartModel.find()
            .populate('categoryId', 'name description')
            .populate('supplierId', 'name contactEmail contactPhone')
            .sort({createdAt: -1})
            .lean();

        return parts.map(part => this.enrichPartWithDetails(part));
    }

    async getPart(id) {
        const part = await PartModel.findById(id)
            .populate('categoryId', 'name description')
            .populate('supplierId', 'name contactEmail contactPhone')
            .lean();

        return part ? this.enrichPartWithDetails(part) : undefined;
    }

    async getPartByPartNumber(partNumber) {
        const part = await PartModel.findOne({partNumber})
            .populate('categoryId', 'name description')
            .populate('supplierId', 'name contactEmail contactPhone')
            .lean();

        return part ? this.enrichPartWithDetails(part) : undefined;
    }

    async createPart(insertPart) {
        const part = new PartModel(insertPart);
        return await part.save();
    }

    async updatePart(id, partData) {
        const updated = await PartModel.findByIdAndUpdate(
            id,
            partData,
            {new: true, runValidators: true}
        );
        if (!updated) throw new Error("Part not found");
        return updated;
    }

    async deletePart(id) {
        const result = await PartModel.findByIdAndDelete(id);
        return !!result;
    }

    async searchParts(query) {
        const parts = await PartModel.find({
            $or: [
                {name: {$regex: query, $options: 'i'}},
                {partNumber: {$regex: query, $options: 'i'}},
                {description: {$regex: query, $options: 'i'}}
            ]
        })
            .populate('categoryId', 'name description')
            .populate('supplierId', 'name contactEmail contactPhone')
            .lean();

        return parts.map(part => this.enrichPartWithDetails(part));
    }

    async getLowStockParts() {
        const parts = await PartModel.find({
            $expr: {$lte: ['$quantity', '$minimumStock']}
        })
            .populate('categoryId', 'name description')
            .populate('supplierId', 'name contactEmail contactPhone')
            .lean();

        return parts.map(part => this.enrichPartWithDetails(part));
    }

    // Movements
    async getMovements() {
        const movements = await MovementModel.find()
            .populate({
                path: 'partId',
                populate: [
                    {path: 'categoryId', select: 'name description'},
                    {path: 'supplierId', select: 'name contactEmail contactPhone'}
                ]
            })
            .sort({createdAt: -1})
            .lean();

        return movements.map(movement => ({
            ...movement,
            part: movement.partId
        }));
    }

    async getMovement(id) {
        const movement = await MovementModel.findById(id)
            .populate({
                path: 'partId',
                populate: [
                    {path: 'categoryId', select: 'name description'},
                    {path: 'supplierId', select: 'name contactEmail contactPhone'}
                ]
            })
            .lean();

        if (!movement) return undefined;

        return {
            ...movement,
            part: movement.partId
        };
    }

    async getMovementsByPart(partId) {
        const movements = await MovementModel.find({partId})
            .populate({
                path: 'partId',
                populate: [
                    {path: 'categoryId', select: 'name description'},
                    {path: 'supplierId', select: 'name contactEmail contactPhone'}
                ]
            })
            .sort({createdAt: -1})
            .lean();

        return movements.map(movement => ({
            ...movement,
            part: movement.partId
        }));
    }

    async createMovement(insertMovement) {
        const movement = new MovementModel(insertMovement);
        const savedMovement = await movement.save();

        // Update part quantity
        const part = await PartModel.findById(insertMovement.partId);
        if (part) {
            const quantityChange = insertMovement.type === 'in' ? insertMovement.quantity : -insertMovement.quantity;
            part.quantity = Math.max(0, part.quantity + quantityChange);
            await part.save();
        }

           // Return the movement with populated part data
    return await MovementModel.findById(savedMovement._id)
        .populate({
            path: 'partId',
            populate: [
                {path: 'categoryId', select: 'name description'},
                {path: 'supplierId', select: 'name contactEmail contactPhone'}
            ]
        })
        .lean();
    }

    // Stats
    async getInventoryStats() {
        const [totalParts, lowStockParts, allParts, activeSuppliers] = await Promise.all([
            PartModel.countDocuments(),
            PartModel.countDocuments({$expr: {$lte: ['$quantity', '$minimumStock']}}),
            PartModel.find().lean(),
            SupplierModel.countDocuments()
        ]);

        const totalValue = allParts.reduce((sum, part) => sum + (part.quantity * part.unitPrice), 0);

        return {
            totalParts,
            lowStockCount: lowStockParts,
            totalValue,
            activeSuppliers
        };
    }

    // Reports
    async getReports() {
        return await ReportModel.find().sort({createdAt: -1}).lean();
    }

    async createReport(insertReport) {
        const report = new ReportModel(insertReport);
        return await report.save();
    }

    enrichPartWithDetails(part) {
        let stockStatus;
        if (part.quantity === 0) {
            stockStatus = 'out-of-stock';
        } else if (part.quantity <= part.minimumStock) {
            stockStatus = 'low-stock';
        } else {
            stockStatus = 'in-stock';
        }

        return {
            ...part,
            category: part.categoryId,
            supplier: part.supplierId,
            stockStatus
        };
    }
}

// Simple in-memory storage for fallback when MongoDB is not available
class MemoryStorage {
    constructor() {
        this.suppliers = new Map();
        this.categories = new Map();
        this.parts = new Map();
        this.movements = new Map();
        this.reports = new Map();

        this.initializeData();
    }

    initializeData() {
        // Sample data for testing
        const sampleSuppliers = [
            {_id: "1", name: "AutoParts Co.", contactEmail: "info@autoparts.com", contactPhone: "+1-555-0123"},
            {_id: "2", name: "EngineMax Ltd.", contactEmail: "sales@enginemax.com", contactPhone: "+1-555-0124"}
        ];

        const sampleCategories = [
            {_id: "1", name: "Engine Parts", description: "Engine components and accessories"},
            {_id: "2", name: "Braking System", description: "Brake pads, discs, and hydraulics"}
        ];

        const sampleParts = [
            {
                _id: "1",
                name: "Air Filter Heavy Duty",
                partNumber: "AF-HD-001",
                description: "High-performance air filter",
                categoryId: "1",
                supplierId: "1",
                quantity: 25,
                minimumStock: 10,
                unitPrice: 45.99,
                location: "A1-B2-C3"
            },
            {
                _id: "2",
                name: "Brake Pad Set Front",
                partNumber: "BP-F-002",
                description: "Front brake pad set",
                categoryId: "2",
                supplierId: "2",
                quantity: 8,
                minimumStock: 12,
                unitPrice: 89.50,
                location: "B2-C3-D4"
            }
        ];

        sampleSuppliers.forEach(s => this.suppliers.set(s._id, s));
        sampleCategories.forEach(c => this.categories.set(c._id, c));
        sampleParts.forEach(p => this.parts.set(p._id, p));
    }

    async getSuppliers() {
        return Array.from(this.suppliers.values());
    }

    async getSupplier(id) {
        return this.suppliers.get(id);
    }

    async createSupplier(supplier) {
        const newSupplier = {_id: Date.now().toString(), ...supplier};
        this.suppliers.set(newSupplier._id, newSupplier);
        return newSupplier;
    }

    async updateSupplier(id, supplier) {
        const existing = this.suppliers.get(id);
        if (!existing) throw new Error("Supplier not found");
        const updated = {...existing, ...supplier};
        this.suppliers.set(id, updated);
        return updated;
    }

    async deleteSupplier(id) {
        return this.suppliers.delete(id);
    }

    async getCategories() {
        return Array.from(this.categories.values());
    }

    async getCategory(id) {
        return this.categories.get(id);
    }

    async createCategory(category) {
        const newCategory = {_id: Date.now().toString(), ...category};
        this.categories.set(newCategory._id, newCategory);
        return newCategory;
    }

    async updateCategory(id, category) {
        const existing = this.categories.get(id);
        if (!existing) throw new Error("Category not found");
        const updated = {...existing, ...category};
        this.categories.set(id, updated);
        return updated;
    }

    async deleteCategory(id) {
        return this.categories.delete(id);
    }

    async getParts() {
        return Array.from(this.parts.values()).map(part => this.enrichPartWithDetails(part));
    }

    async getPart(id) {
        const part = this.parts.get(id);
        return part ? this.enrichPartWithDetails(part) : undefined;
    }

    async getPartByPartNumber(partNumber) {
        const part = Array.from(this.parts.values()).find(p => p.partNumber === partNumber);
        return part ? this.enrichPartWithDetails(part) : undefined;
    }

    async createPart(part) {
        const newPart = {_id: Date.now().toString(), ...part};
        this.parts.set(newPart._id, newPart);
        return newPart;
    }

    async updatePart(id, part) {
        const existing = this.parts.get(id);
        if (!existing) throw new Error("Part not found");
        const updated = {...existing, ...part};
        this.parts.set(id, updated);
        return updated;
    }

    async deletePart(id) {
        return this.parts.delete(id);
    }

    async searchParts(query) {
        return Array.from(this.parts.values())
            .filter(part =>
                part.name.toLowerCase().includes(query.toLowerCase()) ||
                part.partNumber.toLowerCase().includes(query.toLowerCase()) ||
                (part.description && part.description.toLowerCase().includes(query.toLowerCase()))
            )
            .map(part => this.enrichPartWithDetails(part));
    }

    async getLowStockParts() {
        return Array.from(this.parts.values())
            .filter(part => part.quantity <= part.minimumStock)
            .map(part => this.enrichPartWithDetails(part));
    }

    async getMovements() {
        return Array.from(this.movements.values()).map(movement => ({
            ...movement,
            part: this.parts.get(movement.partId.toString())
        })).filter(m => m.part);
    }

    async getMovement(id) {
        const movement = this.movements.get(id);
        if (!movement) return undefined;
        const part = this.parts.get(movement.partId.toString());
        return part ? {...movement, part} : undefined;
    }

    async getMovementsByPart(partId) {
        return Array.from(this.movements.values())
            .filter(m => m.partId.toString() === partId)
            .map(movement => ({
                ...movement,
                part: this.parts.get(movement.partId.toString())
            })).filter(m => m.part);
    }

    async createMovement(movement) {
        const newMovement = {_id: Date.now().toString(), ...movement, partId: movement.partId};
        this.movements.set(newMovement._id, newMovement);
         const part = this.parts.get(movement.partId.toString());
    if (part) {
        const quantityChange = movement.type === 'in' 
            ? movement.quantity 
            : -movement.quantity;
        
        part.quantity = Math.max(0, part.quantity + quantityChange);
        this.parts.set(part._id, part);
    }
        return newMovement;
    }

    async getInventoryStats() {
        const parts = Array.from(this.parts.values());
        return {
            totalParts: parts.length,
            lowStockCount: parts.filter(p => p.quantity <= p.minimumStock).length,
            totalValue: parts.reduce((sum, part) => sum + (part.quantity * part.unitPrice), 0),
            activeSuppliers: this.suppliers.size
        };
    }

    async getReports() {
        return Array.from(this.reports.values());
    }

    async createReport(report) {
        const newReport = {_id: Date.now().toString(), ...report};
        this.reports.set(newReport._id, newReport);
        return newReport;
    }

    enrichPartWithDetails(part) {
        const category = part.categoryId ? this.categories.get(part.categoryId.toString()) : undefined;
        const supplier = part.supplierId ? this.suppliers.get(part.supplierId.toString()) : undefined;

        let stockStatus;
        if (part.quantity === 0) {
            stockStatus = 'out-of-stock';
        } else if (part.quantity <= part.minimumStock) {
            stockStatus = 'low-stock';
        } else {
            stockStatus = 'in-stock';
        }

        return {
            ...part,
            category,
            supplier,
            stockStatus
        };
    }
}


export const storage = new DatabaseStorage();