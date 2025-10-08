// frontend/src/modules/supplier/pages/SupplierForm.jsx

/**
 * SupplierForm Page Component
 * Form for creating or editing a supplier
 * Handles form input and submission to the backend API
 */

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import supplierService from "../services/supplierService";

/**
 * Supplier Form Component
 * @param {Object} props - Component props
 * @param {Function} props.onSuccess - Optional callback function called after successful supplier creation/update
 * @returns {JSX.Element} Supplier creation/edit form
 */
const SupplierForm = ({ onSuccess }) => {
  const { id } = useParams(); // Get supplier ID from URL if editing
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  // State to manage form fields (matching backend schema)
  const [form, setForm] = useState({
    supplierId: "",
    name: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
    reportId: "",
  });

  // State to manage loading and error
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  /**
   * Load supplier data when editing
   */
  useEffect(() => {
    if (isEditMode) {
      setLoadingData(true);
      supplierService.getSupplierById(id)
        .then((data) => {
          setForm({
            supplierId: data.supplierId || "",
            name: data.name || "",
            contactEmail: data.contactEmail || "",
            contactPhone: data.contactPhone || "",
            address: data.address || "",
            reportId: data.reportId || "",
          });
        })
        .catch((err) => {
          console.error("Error loading supplier:", err);
          setError("Failed to load supplier data");
        })
        .finally(() => {
          setLoadingData(false);
        });
    }
  }, [id, isEditMode]);

  /**
   * Validate phone number (must be exactly 10 digits and no digit repeated more than 4 times)
   */
  const validatePhone = (phone) => {
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      return false;
    }
    
    // Check if any digit appears more than 4 times
    const digitCount = {};
    for (let digit of phone) {
      digitCount[digit] = (digitCount[digit] || 0) + 1;
      if (digitCount[digit] > 4) {
        return false;
      }
    }
    
    return true;
  };

  /**
   * Validate email format (must contain @)
   */
  const validateEmail = (email) => {
    // Must contain @ symbol
    if (!email.includes('@')) {
      return false;
    }
    const emailRegex = /^\w+([-.]?\w+)*@\w+([-.]?\w+)*(\.\w{2,3})+$/;
    return emailRegex.test(email);
  };

  /**
   * Handle input field changes
   * Updates the form state when user types in any input field
   * @param {Event} e - Input change event
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Clear validation error for this field
    setValidationErrors({ ...validationErrors, [name]: "" });
    
    // Special handling for phone number - only allow digits and validate
    if (name === 'contactPhone') {
      const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
      
      // Check if phone is valid (including digit repetition check)
      if (digitsOnly.length === 10 && !validatePhone(digitsOnly)) {
        // Phone has invalid pattern (same digit more than 4 times)
        // Don't update the value if it would make it invalid
        return;
      }
      
      setForm({ ...form, [name]: digitsOnly });
      
      // Validate phone in real-time
      if (digitsOnly && digitsOnly.length < 10) {
        setValidationErrors({ 
          ...validationErrors, 
          [name]: `${10 - digitsOnly.length} more digit(s) needed` 
        });
      }
    } else if (name === 'contactEmail') {
      setForm({ ...form, [name]: value });
      
      // Validate email in real-time
      if (value && !value.includes('@')) {
        setValidationErrors({ 
          ...validationErrors, 
          [name]: "Email must contain @" 
        });
      } else if (value && !validateEmail(value)) {
        setValidationErrors({ 
          ...validationErrors, 
          [name]: "Invalid email format" 
        });
      }
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  /**
   * Validate form before submission
   */
  const validateForm = () => {
    const errors = {};
    
    if (!form.supplierId.trim()) {
      errors.supplierId = "Supplier ID is required";
    }
    
    if (!form.name.trim()) {
      errors.name = "Supplier name is required";
    }
    
    if (!form.contactEmail.trim()) {
      errors.contactEmail = "Email is required";
    } else if (!form.contactEmail.includes('@')) {
      errors.contactEmail = "Email must contain @";
    } else if (!validateEmail(form.contactEmail)) {
      errors.contactEmail = "Invalid email format";
    }
    
    if (!form.contactPhone.trim()) {
      errors.contactPhone = "Phone number is required";
    } else if (!validatePhone(form.contactPhone)) {
      errors.contactPhone = "Phone number must be exactly 10 digits";
    }
    
    if (!form.address.trim()) {
      errors.address = "Address is required";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Handle form submission
   * Prevents default form behavior and calls the API to create or update supplier
   * @param {Event} e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload
    setError("");
    setSuccess("");

    // Validate form
    if (!validateForm()) {
      setError("Recheck entered details");
      return;
    }

    setLoading(true);

    try {
      if (isEditMode) {
        // Update existing supplier
        await supplierService.updateSupplier(id, form);
        setSuccess("Supplier updated successfully!");
      } else {
        // Create new supplier
        await supplierService.createSupplier(form);
        setSuccess("Supplier created successfully!");
        
        // Reset form after success (only for create mode)
        setForm({
          supplierId: "",
          name: "",
          contactEmail: "",
          contactPhone: "",
          address: "",
          reportId: "",
        });
        setValidationErrors({});
      }

      // Call optional success callback if provided
      onSuccess?.();
      
      // If editing, navigate back to supplier list after a delay
      if (isEditMode) {
        setTimeout(() => {
          navigate("/suppliers");
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} supplier. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex justify-center items-start">
        <div className="bg-white p-8 shadow-lg rounded-lg w-full max-w-2xl mt-12">
          <p className="text-center text-lg text-gray-600">Loading supplier data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 flex justify-center items-start">
      <form onSubmit={handleSubmit} className="bg-white p-8 shadow-lg rounded-lg w-full max-w-2xl mt-12">
        {/* Form Title */}
        <h2 className="text-3xl font-bold mb-8 text-gray-800">
          {isEditMode ? 'Edit Supplier' : 'Add New Supplier'}
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

        {/* Supplier ID */}
        <div className="mb-6">
        <label htmlFor="supplierId" className="block font-semibold mb-2 text-gray-700">
          Supplier ID <span className="text-red-500">*</span>
        </label>
        <input
          id="supplierId"
          name="supplierId"
          type="text"
          value={form.supplierId}
          onChange={handleChange}
          placeholder="Enter unique supplier ID"
          className={`w-full border p-2 rounded ${validationErrors.supplierId ? 'border-red-500' : ''}`}
          required
        />
        <p className="text-xs text-gray-500 mt-1">Must be unique (e.g., SUP001, SUP002)</p>
        {validationErrors.supplierId && (
          <p className="text-red-500 text-xs mt-1">{validationErrors.supplierId}</p>
        )}
      </div>

      {/* Supplier Name */}
      <div className="mb-3">
        <label htmlFor="name" className="block font-medium mb-1">
          Supplier Name <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          placeholder="Enter supplier name"
          className={`w-full border p-2 rounded ${validationErrors.name ? 'border-red-500' : ''}`}
          required
        />
        {validationErrors.name && (
          <p className="text-red-500 text-xs mt-1">{validationErrors.name}</p>
        )}
      </div>

      {/* Contact Email */}
      <div className="mb-3">
        <label htmlFor="contactEmail" className="block font-medium mb-1">
          Contact Email <span className="text-red-500">*</span>
        </label>
        <input
          id="contactEmail"
          name="contactEmail"
          type="email"
          value={form.contactEmail}
          onChange={handleChange}
          placeholder="email@example.com"
          className={`w-full border p-2 rounded ${validationErrors.contactEmail ? 'border-red-500' : ''}`}
          required
        />
        {validationErrors.contactEmail && (
          <p className="text-red-500 text-xs mt-1">{validationErrors.contactEmail}</p>
        )}
      </div>

      {/* Contact Phone */}
      <div className="mb-3">
        <label htmlFor="contactPhone" className="block font-medium mb-1">
          Contact Phone <span className="text-red-500">*</span>
        </label>
        <input
          id="contactPhone"
          name="contactPhone"
          type="tel"
          value={form.contactPhone}
          onChange={handleChange}
          placeholder="0712345678 (10 digits)"
          className={`w-full border p-2 rounded ${validationErrors.contactPhone ? 'border-red-500' : ''}`}
          required
          maxLength="10"
        />
        {validationErrors.contactPhone && (
          <p className="text-red-500 text-xs mt-1">{validationErrors.contactPhone}</p>
        )}
      </div>

      {/* Address */}
      <div className="mb-3">
        <label htmlFor="address" className="block font-medium mb-1">
          Address <span className="text-red-500">*</span>
        </label>
        <textarea
          id="address"
          name="address"
          value={form.address}
          onChange={handleChange}
          placeholder="Enter supplier address"
          className={`w-full border p-2 rounded ${validationErrors.address ? 'border-red-500' : ''}`}
          rows="3"
          required
        />
        {validationErrors.address && (
          <p className="text-red-500 text-xs mt-1">{validationErrors.address}</p>
        )}
      </div>

      {/* Report ID (Optional) */}
      <div className="mb-3">
        <label htmlFor="reportId" className="block font-medium mb-1">
          Report ID <span className="text-gray-500 text-sm">(Optional)</span>
        </label>
        <input
          id="reportId"
          name="reportId"
          type="text"
          value={form.reportId}
          onChange={handleChange}
          placeholder="Enter report ID if applicable"
          className="w-full border p-2 rounded"
        />
        </div>

        {/* Submit Button */}
        <div className="flex gap-2">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 flex-1"
            disabled={loading}
          >
            {loading ? "Saving..." : isEditMode ? "Update Supplier" : "Save Supplier"}
          </button>
          
          {isEditMode && (
            <button
              type="button"
              onClick={() => navigate("/suppliers")}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
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

export default SupplierForm;
