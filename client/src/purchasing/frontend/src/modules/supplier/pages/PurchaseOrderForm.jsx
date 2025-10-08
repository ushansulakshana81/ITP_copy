// frontend/src/modules/supplier/pages/PurchaseOrderForm.jsx

/**
 * PurchaseOrderForm Page Component
 * Form for creating or editing a purchase order
 * Handles form input and submission to the backend API
 */

import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import purchaseOrderService from "../services/purchaseOrderService";
import supplierService from "../services/supplierService";

/**
 * Purchase Order Form Component
 * @param {Object} props - Component props
 * @param {Function} props.onSuccess - Optional callback function called after successful order creation/update
 * @returns {JSX.Element} Purchase order creation/edit form
 */
const PurchaseOrderForm = ({ onSuccess }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = Boolean(id);

  // Get part data from navigation state (if coming from Dashboard reorder)
  const partFromDashboard = location.state?.part;

  // State for suppliers list
  const [suppliers, setSuppliers] = useState([]);
  
  // State to manage form fields
  const [form, setForm] = useState({
    supplier: "",        // Supplier ID
    items: [
      {
        name: "",
        quantity: 1,
        unitPrice: 0,
        totalPrice: 0,
      }
    ],
  });

  // State for loading and messages
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load purchase order data when editing
  useEffect(() => {
    if (isEditMode) {
      setLoadingData(true);
      purchaseOrderService.getPurchaseOrderById(id)
        .then((data) => {
          setForm({
            supplier: data.supplier?._id || data.supplier,
            items: data.items && data.items.length > 0 ? data.items : [{
              name: "",
              quantity: 1,
              unitPrice: 0,
              totalPrice: 0,
            }],
          });
        })
        .catch((err) => {
          console.error("Error loading purchase order:", err);
          setError("Failed to load purchase order data");
        })
        .finally(() => {
          setLoadingData(false);
        });
    }
  }, [id, isEditMode]);

  // Fetch suppliers on component mount
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const data = await supplierService.getSuppliers();
        setSuppliers(data);
      } catch (err) {
        console.error("Failed to fetch suppliers:", err);
      }
    };
    fetchSuppliers();
  }, []);

  /**
   * Auto-fill form if part data is passed from Dashboard
   * This happens when user clicks "Create PO" from low stock alert
   */
  useEffect(() => {
    if (partFromDashboard && !isEditMode) {
      // Calculate recommended quantity (minimum stock - current quantity + buffer)
      const recommendedQty = Math.max(
        partFromDashboard.minimumStock - partFromDashboard.quantity + 10,
        10
      );

      // Auto-fill the first item with part details
      setForm(prev => ({
        ...prev,
        items: [
          {
            name: partFromDashboard.name,
            quantity: recommendedQty,
            unitPrice: partFromDashboard.unitPrice,
            totalPrice: recommendedQty * partFromDashboard.unitPrice
          }
        ]
      }));

      // Show info message to user
      setSuccess(`Auto-filled with low stock item: ${partFromDashboard.name}. Recommended quantity: ${recommendedQty} units.`);
      setTimeout(() => setSuccess(""), 8000);
    }
  }, [partFromDashboard, isEditMode]);

  /**
   * Handle supplier selection
   */
  const handleSupplierChange = (e) => {
    setForm({ ...form, supplier: e.target.value });
  };

  /**
   * Validate item name
   * - Only alphanumeric characters and spaces allowed
   * - No special characters
   * - No character repeated more than twice consecutively
   */
  const validateItemName = (name) => {
    // Check for special characters (only allow letters, numbers, and spaces)
    const hasSpecialChars = /[^a-zA-Z0-9\s]/.test(name);
    if (hasSpecialChars) {
      return false;
    }
    
    // Check for same character repeated more than twice
    const hasTripleRepeat = /(.)\1{2,}/.test(name);
    if (hasTripleRepeat) {
      return false;
    }
    
    return true;
  };

  /**
   * Handle item field changes
   */
  const handleItemChange = (index, field, value) => {
    const newItems = [...form.items];
    
    if (field === 'name') {
      // Validate item name before setting
      if (value === '' || validateItemName(value)) {
        newItems[index][field] = value;
      } else {
        // Don't update if validation fails (prevents typing invalid characters)
        return;
      }
    } else {
      // For quantity and unitPrice, parse and validate
      const numValue = parseFloat(value) || 0;
      newItems[index][field] = numValue;
    }
    
    // Auto-calculate totalPrice for the item
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].totalPrice = newItems[index].quantity * newItems[index].unitPrice;
    }
    
    setForm({ ...form, items: newItems });
  };

  /**
   * Add new item to the order
   */
  const addItem = () => {
    setForm({
      ...form,
      items: [...form.items, { name: "", quantity: 1, unitPrice: 0, totalPrice: 0 }]
    });
  };

  /**
   * Remove item from the order
   */
  const removeItem = (index) => {
    const newItems = form.items.filter((_, i) => i !== index);
    setForm({ ...form, items: newItems });
  };

  /**
   * Calculate total amount from all items
   */
  const calculateTotal = () => {
    return form.items.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  /**
   * Handle form submission
   * Prevents default form behavior and calls the API to create purchase order
   * @param {Event} e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Validate form
      if (!form.supplier) {
        throw new Error("Please select a supplier");
      }
      
      if (form.items.length === 0) {
        throw new Error("Please add at least one item");
      }
      
      // Validate items
      for (let i = 0; i < form.items.length; i++) {
        const item = form.items[i];
        if (!item.name || item.name.trim() === "") {
          throw new Error(`Item #${i + 1}: Please enter item name`);
        }
        if (item.quantity <= 0) {
          throw new Error(`Item #${i + 1}: Quantity must be greater than 0`);
        }
        if (item.unitPrice <= 0) {
          throw new Error(`Item #${i + 1}: Unit price must be greater than 0`);
        }
      }

      // Prepare data for backend
      const orderData = {
        supplier: form.supplier,
        items: form.items,
        totalAmount: calculateTotal(),
      };

      console.log('Submitting order data:', orderData);

      if (isEditMode) {
        // Update existing order
        const response = await purchaseOrderService.updateOrder(id, orderData);
        console.log('Order updated successfully:', response);
        setSuccess("Purchase order updated successfully!");
        
        // Navigate back after delay
        setTimeout(() => {
          navigate("/purchase-orders");
        }, 1500);
      } else {
        // Create new order
        const response = await purchaseOrderService.createOrder(orderData);
        console.log('Order created successfully:', response);
        setSuccess("Purchase order created successfully!");
        
        // Reset form after success (only for create mode)
        setForm({
          supplier: "",
          items: [{ name: "", quantity: 1, unitPrice: 0, totalPrice: 0 }],
        });
      }

      // Call optional success callback if provided
      onSuccess?.();
    } catch (err) {
      console.error('Error with purchase order:', err);
      setError(err.message || `Failed to ${isEditMode ? 'update' : 'create'} purchase order. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex justify-center items-start">
        <div className="bg-white p-8 shadow-lg rounded-lg w-full max-w-4xl mt-12">
          <p className="text-center text-lg text-gray-600">Loading purchase order data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 flex justify-center items-start">
      <form onSubmit={handleSubmit} className="bg-white p-8 shadow-lg rounded-lg w-full max-w-4xl mt-12">
        {/* Form Title */}
        <h2 className="text-3xl font-bold mb-8 text-gray-800">
          {isEditMode ? 'Edit Purchase Order' : 'Create Purchase Order'}
        </h2>

      {/* Display error if exists */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      {/* Display success message */}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-lg mb-6">
          {success}
        </div>
      )}
      
      {/* Supplier Selection */}
      <div className="mb-8">
        <label htmlFor="supplier" className="block font-semibold mb-2 text-gray-700">
          Select Supplier <span className="text-red-500">*</span>
        </label>
        <select
          id="supplier"
          value={form.supplier}
          onChange={handleSupplierChange}
          className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        >
          <option value="">-- Select Supplier --</option>
          {suppliers.map((supplier) => (
            <option key={supplier._id} value={supplier._id}>
              {supplier.name}
            </option>
          ))}
        </select>
      </div>

      {/* Items Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">Order Items</h3>
          <button
            type="button"
            onClick={addItem}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            + Add Item
          </button>
        </div>

        {form.items.map((item, index) => (
          <div key={index} className="border border-gray-300 p-6 rounded-lg mb-6 bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold text-lg text-gray-700">Item #{index + 1}</span>
              {form.items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="text-red-600 text-sm font-medium hover:text-red-700 transition-colors"
                >
                  Remove
                </button>
              )}
            </div>

            {/* Item Name */}
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2 text-gray-700">Item Name *</label>
              <input
                type="text"
                value={item.name}
                onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                placeholder="Enter item name (letters and numbers only)"
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                minLength="1"
              />
              {item.name.trim() === '' && (
                <p className="text-red-500 text-sm mt-2">Item name is required</p>
              )}
              <p className="text-gray-500 text-xs mt-2">
                Only letters, numbers, and spaces. No character more than twice in a row.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Quantity */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Quantity *</label>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                {item.quantity <= 0 && (
                  <p className="text-red-500 text-sm mt-2">Must be greater than 0</p>
                )}
              </div>

              {/* Unit Price */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Unit Price *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.unitPrice}
                  onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Total Price (Read-only) */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Total</label>
                <input
                  type="number"
                  value={item.totalPrice.toFixed(2)}
                  className="w-full border border-gray-300 p-3 rounded-lg bg-gray-100"
                  readOnly
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Total Amount Display */}
      <div className="mb-8 p-6 bg-blue-50 rounded-lg border-2 border-blue-200">
        <div className="flex justify-between items-center">
          <span className="font-bold text-xl text-gray-800">Total Amount:</span>
          <span className="font-bold text-2xl text-blue-600">
            LKR {calculateTotal().toFixed(2)}
          </span>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex gap-4">
        <button
          type="submit"
          className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 flex-1 transition-colors"
          disabled={loading}
        >
          {loading 
            ? (isEditMode ? "Updating..." : "Creating Order...") 
            : (isEditMode ? "Update Purchase Order" : "Create Purchase Order")
          }
        </button>
        
        {isEditMode && (
          <button
            type="button"
            onClick={() => navigate("/purchase-orders")}
            className="bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
        )}
      </div>
      </form>
    </div>
  );
};

export default PurchaseOrderForm;
