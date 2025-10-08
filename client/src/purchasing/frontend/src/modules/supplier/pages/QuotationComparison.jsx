// frontend/src/modules/supplier/pages/QuotationComparison.jsx

import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import partService from "../services/partService";
import supplierService from "../services/supplierService";
import { 
    createQuotation, 
    getAllQuotations, 
    updateQuotationStatus,
    deleteQuotation 
} from "../services/quotationService";

const QuotationComparison = () => {
    const location = useLocation();
    
    // Get part data from navigation state (if coming from Dashboard reorder)
    const partFromDashboard = location.state?.part;
    
    // Track if we've already auto-selected suppliers to prevent multiple runs
    const hasAutoSelectedSuppliers = useRef(false);
    
    // State management
    const [showForm, setShowForm] = useState(false);
    const [parts, setParts] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [quotations, setQuotations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        partId: "",
        partNumber: "",
        partName: "",
        quantity: 1,
        supplierIds: [],
        notes: "",
    });

    // Selected part for auto-fill
    const [selectedPart, setSelectedPart] = useState(null);

    // Load initial data
    useEffect(() => {
        fetchParts();
        fetchSuppliers();
        fetchQuotations();
    }, []);

    /**
     * Auto-fill form when navigating from Dashboard's low stock alert
     * Automatically opens form, selects the part, and pre-selects all suppliers
     */
    useEffect(() => {
        if (partFromDashboard && !showForm) {
            // Auto-fill form data with the part from Dashboard
            setFormData({
                partId: partFromDashboard.partId, // Use partId (not _id) to match dropdown value
                partNumber: partFromDashboard.partNumber,
                partName: partFromDashboard.name,
                quantity: Math.max(partFromDashboard.minimumStock - partFromDashboard.quantity + 10, 10),
                supplierIds: [], // Will be filled after suppliers load
                notes: `Quotation request for low stock item. Current stock: ${partFromDashboard.quantity} units, Minimum required: ${partFromDashboard.minimumStock} units.`,
            });
            
            setSelectedPart(partFromDashboard);
            setShowForm(true);
            
            // Show success message
            setSuccess(`Auto-filled quotation request for low stock item: ${partFromDashboard.name}`);
            setTimeout(() => setSuccess(null), 8000);
        }
    }, [partFromDashboard, showForm]);

    /**
     * Pre-select all suppliers when form is auto-filled from Dashboard
     * Uses supplier.supplierId (not _id) to match the checkbox values
     * Only runs once when partFromDashboard exists and suppliers are loaded
     */
    useEffect(() => {
        if (partFromDashboard && suppliers.length > 0 && !hasAutoSelectedSuppliers.current) {
            // Auto-select all suppliers for comprehensive quotation
            // Use supplierId (not _id) to match the checkbox values
            const allSupplierIds = suppliers.map(s => s.supplierId);
            setFormData(prev => ({
                ...prev,
                supplierIds: allSupplierIds
            }));
            
            // Mark as auto-selected so this doesn't run again
            hasAutoSelectedSuppliers.current = true;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [partFromDashboard, suppliers.length]); // Only depend on suppliers.length to prevent infinite loops

    const fetchParts = async () => {
        try {
            const data = await partService.getParts();
            setParts(data);
        } catch (err) {
            console.error("Error fetching parts:", err);
        }
    };

    const fetchSuppliers = async () => {
        try {
            const data = await supplierService.getSuppliers();
            console.log("Fetched suppliers:", data);
            console.log("Supplier IDs:", data.map(s => s.supplierId));
            setSuppliers(data);
        } catch (err) {
            console.error("Error fetching suppliers:", err);
        }
    };

    const fetchQuotations = async () => {
        try {
            setLoading(true);
            const data = await getAllQuotations();
            setQuotations(data);
        } catch (err) {
            setError("Failed to load quotations");
        } finally {
            setLoading(false);
        }
    };

    // Handle part selection
    const handlePartSelect = (e) => {
        const partId = e.target.value;
        const part = parts.find(p => p.partId === partId);
        
        if (part) {
            setSelectedPart(part);
            setFormData({
                ...formData,
                partId: part.partId,
                partNumber: part.partNumber,
                partName: part.name,
            });
        } else {
            setSelectedPart(null);
            setFormData({
                ...formData,
                partId: "",
                partNumber: "",
                partName: "",
            });
        }
    };

    // Handle supplier selection
    const handleSupplierToggle = (supplierId) => {
        console.log("=== TOGGLE CLICKED ===");
        console.log("Supplier ID clicked:", supplierId);
        
        setFormData(prevData => {
            console.log("Previous supplierIds:", prevData.supplierIds);
            const isSelected = prevData.supplierIds.includes(supplierId);
            console.log("Is currently selected?:", isSelected);
            
            let newIds;
            if (isSelected) {
                newIds = prevData.supplierIds.filter(id => id !== supplierId);
                console.log("REMOVING - New IDs:", newIds);
            } else {
                newIds = [...prevData.supplierIds, supplierId];
                console.log("ADDING - New IDs:", newIds);
            }
            
            return {
                ...prevData,
                supplierIds: newIds,
            };
        });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!formData.partId || !formData.partNumber || !formData.partName) {
            setError("Please select a part");
            return;
        }

        if (formData.supplierIds.length === 0) {
            setError("Please select at least one supplier");
            return;
        }

        try {
            setLoading(true);
            await createQuotation(formData);
            setSuccess("Quotation request created successfully!");
            
            // Reset form
            setFormData({
                partId: "",
                partNumber: "",
                partName: "",
                quantity: 1,
                supplierIds: [],
                notes: "",
            });
            setSelectedPart(null);
            setShowForm(false);
            
            // Refresh quotations
            fetchQuotations();
        } catch (err) {
            console.error("Error creating quotation:", err);
            setError(err.message || "Failed to create quotation. Please check console for details.");
        } finally {
            setLoading(false);
        }
    };

    // Send email to selected suppliers
    const handleSendEmails = (quotation) => {
        const selectedSuppliers = quotation.suppliers;
        
        if (selectedSuppliers.length === 0) {
            toast.error("No suppliers selected for this quotation");
            return;
        }

        // Create email content
        const subject = `Quotation Request - ${quotation.part.name} (${quotation.quotationId})`;
        
        // Create formatted email body with proper line breaks for Gmail
        const body = `Dear Supplier,

We would like to request a quotation for the following:

Part Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Part ID: ${quotation.part.partId}
• Part Number: ${quotation.part.partNumber}
• Part Name: ${quotation.part.name}
• Quantity Required: ${quotation.quantity} units

Quotation Reference: ${quotation.quotationId}

${quotation.notes ? `Additional Notes:\n${quotation.notes}\n\n` : ''}Please provide:
1. Your best unit price (in LKR)
2. Estimated delivery time
3. Availability status
4. Any applicable terms and conditions

We look forward to receiving your competitive quotation at your earliest convenience.

Best regards,
HeavySync Procurement Team
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

        // Get all supplier emails
        const emails = selectedSuppliers.map(s => s.contactEmail).join(',');
        
        // Use Gmail compose URL instead of mailto (opens in browser)
        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(emails)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        
        // Open in new tab
        window.open(gmailUrl, '_blank');

        // Update status to 'sent'
        updateQuotationStatus(quotation._id, 'sent')
            .then(() => {
                fetchQuotations();
                setSuccess(`Email draft opened in Gmail for ${selectedSuppliers.length} supplier(s)`);
                setTimeout(() => setSuccess(null), 5000);
            })
            .catch(err => console.error("Failed to update status:", err));
    };

    // Handle quotation deletion
    const handleDeleteQuotation = async (id) => {
        if (!window.confirm("Are you sure you want to delete this quotation?")) {
            return;
        }

        try {
            await deleteQuotation(id);
            setSuccess("Quotation deleted successfully");
            fetchQuotations();
        } catch (err) {
            setError("Failed to delete quotation");
        }
    };

    // Get status badge color
    const getStatusColor = (status) => {
        const colors = {
            draft: "bg-gray-500",
            sent: "bg-blue-500",
            comparing: "bg-yellow-500",
            completed: "bg-green-500",
            cancelled: "bg-red-500",
        };
        return colors[status] || "bg-gray-500";
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Quotation Comparison</h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="btn-primary"
                >
                    {showForm ? "Cancel" : "Open Quotation"}
                </button>
            </div>

            {/* Success/Error Messages */}
            {success && (
                <div className="success mb-4">{success}</div>
            )}
            {error && (
                <div className="error mb-4">{error}</div>
            )}

            {/* Quotation Request Form */}
            {showForm && (
                <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                    <h3 className="text-xl font-semibold mb-4">Create Quotation Request</h3>
                    
                    <form onSubmit={handleSubmit}>
                        {/* Part Selection */}
                        <div className="mb-4">
                            <label className="form-label">Select Part</label>
                            <select
                                value={formData.partId}
                                onChange={handlePartSelect}
                                className="form-input"
                                required
                            >
                                <option value="">-- Select a Part --</option>
                                {parts.map(part => (
                                    <option key={part._id} value={part.partId}>
                                        {part.partId} - {part.partNumber} - {part.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Display selected part details */}
                        {selectedPart && (
                            <div className="bg-blue-50 p-4 rounded mb-4">
                                <h4 className="font-semibold mb-2">Selected Part Details:</h4>
                                <p><strong>Part ID:</strong> {selectedPart.partId}</p>
                                <p><strong>Part Number:</strong> {selectedPart.partNumber}</p>
                                <p><strong>Part Name:</strong> {selectedPart.name}</p>
                                <p><strong>Description:</strong> {selectedPart.description}</p>
                                <p><strong>Current Stock:</strong> {selectedPart.quantity}</p>
                            </div>
                        )}

                        {/* Quantity */}
                        <div className="mb-4">
                            <label className="form-label">Quantity</label>
                            <input
                                type="number"
                                min="1"
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                                className="form-input"
                                required
                            />
                        </div>

                        {/* Supplier Selection */}
                        <div className="mb-4">
                            <label className="form-label">Select Suppliers</label>
                            <div className="border rounded p-4 max-h-60 overflow-y-auto">
                                {suppliers.length === 0 ? (
                                    <p className="text-gray-500">No suppliers available</p>
                                ) : (
                                    suppliers.map(supplier => (
                                        <div 
                                            key={supplier._id} 
                                            className="mb-2 flex items-center hover:bg-gray-50 p-2 rounded cursor-pointer"
                                            onClick={() => handleSupplierToggle(supplier.supplierId)}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={formData.supplierIds.includes(supplier.supplierId)}
                                                onChange={() => {}} // Controlled by parent div click
                                                className="mr-3 pointer-events-none"
                                            />
                                            <div>
                                                <span className="font-medium">{supplier.name}</span>
                                                <span className="text-gray-600 ml-2">({supplier.supplierId})</span>
                                                <p className="text-sm text-gray-500">{supplier.contactEmail}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            <p className="text-sm text-gray-500 mt-2">
                                {formData.supplierIds.length} supplier(s) selected
                            </p>
                        </div>

                        {/* Notes */}
                        <div className="mb-4">
                            <label className="form-label">Notes (Optional)</label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                className="form-input"
                                rows="3"
                                placeholder="Any additional information for suppliers..."
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full"
                        >
                            {loading ? "Creating..." : "Create Quotation Request"}
                        </button>
                    </form>
                </div>
            )}

            {/* Quotations List */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4">Quotation Requests</h3>

                {loading && <p className="text-center py-4">Loading quotations...</p>}

                {!loading && quotations.length === 0 && (
                    <p className="text-gray-500 text-center py-8">
                        No quotation requests yet. Click "Open Quotation" to create one.
                    </p>
                )}

                {!loading && quotations.length > 0 && (
                    <div className="space-y-4">
                        {quotations.map(quotation => (
                            <div key={quotation._id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h4 className="text-lg font-semibold">{quotation.quotationId}</h4>
                                        <p className="text-gray-600">
                                            {quotation.part.name} ({quotation.part.partNumber})
                                        </p>
                                        <p className="text-sm text-gray-500">Quantity: {quotation.quantity}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded text-white text-sm ${getStatusColor(quotation.status)}`}>
                                        {quotation.status}
                                    </span>
                                </div>

                                {/* Suppliers */}
                                <div className="mb-3">
                                    <p className="font-medium mb-2">Suppliers ({quotation.suppliers.length}):</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {quotation.suppliers.map(supplier => (
                                            <div key={supplier.supplierId} className="bg-gray-50 p-2 rounded text-sm">
                                                <p className="font-medium">{supplier.name}</p>
                                                <p className="text-gray-600">{supplier.contactEmail}</p>
                                                <p className="text-xs text-gray-500">Status: {supplier.status}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 mt-3">
                                    <button
                                        onClick={() => handleSendEmails(quotation)}
                                        className="btn-primary text-sm"
                                    >
                                        📧 Send Email to Suppliers
                                    </button>
                                    <button
                                        onClick={() => handleDeleteQuotation(quotation._id)}
                                        className="btn-danger text-sm"
                                    >
                                        Delete
                                    </button>
                                </div>

                                {quotation.notes && (
                                    <div className="mt-3 p-2 bg-yellow-50 rounded">
                                        <p className="text-sm"><strong>Notes:</strong> {quotation.notes}</p>
                                    </div>
                                )}

                                <p className="text-xs text-gray-400 mt-2">
                                    Created: {new Date(quotation.createdAt).toLocaleString()}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuotationComparison;
