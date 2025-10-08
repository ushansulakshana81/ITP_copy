// frontend/src/modules/supplier/pages/PartForm.jsx

/**
 * PartForm Page Component
 * Form for creating or editing a part/item
 * Handles form input and submission to the backend API
 */

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import partService from "../services/partService";

/**
 * Part Form Component
 * @param {Object} props - Component props
 * @param {Function} props.onSuccess - Optional callback function called after successful part creation/update
 * @returns {JSX.Element} Part creation/edit form
 */
const PartForm = ({ onSuccess }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  // State to manage form fields
  const [form, setForm] = useState({
    partId: "",
    name: "",
    description: "",
    partNumber: "",
    quantity: 0,
    minimumStock: 0,
    unitPrice: 0,
    location: "",
    categoryId: "",
    reportId: "",
  });

  // State to manage loading and error
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  /**
   * Load part data when editing
   */
  useEffect(() => {
    if (isEditMode) {
      setLoadingData(true);
      partService.getPartById(id)
        .then((data) => {
          setForm({
            partId: data.partId || "",
            name: data.name || "",
            description: data.description || "",
            partNumber: data.partNumber || "",
            quantity: data.quantity || 0,
            minimumStock: data.minimumStock || 0,
            unitPrice: data.unitPrice || 0,
            location: data.location || "",
            categoryId: data.categoryId || "",
            reportId: data.reportId || "",
          });
        })
        .catch((err) => {
          console.error("Error loading part:", err);
          setError("Failed to load part data");
        })
        .finally(() => {
          setLoadingData(false);
        });
    }
  }, [id, isEditMode]);

  /**
   * Validate part name
   * - Only alphanumeric characters and spaces allowed
   * - No special characters
   * - No character repeated more than twice consecutively
   */
  const validatePartName = (name) => {
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
   * Handle input field changes
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Clear validation error for this field
    setValidationErrors({ ...validationErrors, [name]: "" });
    
    // Special handling for part name - validate before setting
    if (name === 'name') {
      if (value === '' || validatePartName(value)) {
        setForm({ ...form, [name]: value });
      } else {
        // Don't update if validation fails
        return;
      }
    } else if (name === 'quantity' || name === 'minimumStock' || name === 'unitPrice') {
      // For numeric fields, ensure non-negative
      const numValue = parseFloat(value) || 0;
      if (numValue < 0) {
        return; // Don't allow negative values
      }
      setForm({ ...form, [name]: numValue });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  /**
   * Validate form before submission
   */
  const validateForm = () => {
    const errors = {};
    
    if (!form.partId.trim()) {
      errors.partId = "Part ID is required";
    }
    
    if (!form.name.trim()) {
      errors.name = "Part name is required";
    }
    
    if (!form.description.trim()) {
      errors.description = "Description is required";
    }
    
    if (!form.partNumber.trim()) {
      errors.partNumber = "Part number is required";
    }
    
    if (form.quantity < 0) {
      errors.quantity = "Quantity cannot be negative";
    }
    
    if (form.minimumStock < 0) {
      errors.minimumStock = "Minimum stock cannot be negative";
    }
    
    if (!form.unitPrice || form.unitPrice <= 0) {
      errors.unitPrice = "Unit price must be greater than 0";
    }
    
    if (!form.location.trim()) {
      errors.location = "Location is required";
    }
    
    if (!form.categoryId.trim()) {
      errors.categoryId = "Category ID is required";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
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
        // Update existing part
        await partService.updatePart(id, form);
        setSuccess("Part updated successfully!");
      } else {
        // Create new part
        await partService.createPart(form);
        setSuccess("Part created successfully!");
        
        // Reset form after success (only for create mode)
        setForm({
          partId: "",
          name: "",
          description: "",
          partNumber: "",
          quantity: 0,
          minimumStock: 0,
          unitPrice: 0,
          location: "",
          categoryId: "",
          reportId: "",
        });
        setValidationErrors({});
      }

      // Call optional success callback if provided
      onSuccess?.();
      
      // If editing, navigate back to parts list after a delay
      if (isEditMode) {
        setTimeout(() => {
          navigate("/parts");
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} part. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex justify-center items-start">
        <div className="bg-white p-8 shadow-lg rounded-lg w-full max-w-4xl mt-12">
          <p className="text-center text-lg text-gray-600">Loading part data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 flex justify-center items-start">
      <form onSubmit={handleSubmit} className="bg-white p-8 shadow-lg rounded-lg w-full max-w-4xl mt-12">
        {/* Form Title */}
        <h2 className="text-3xl font-bold mb-8 text-gray-800">
          {isEditMode ? 'Edit Part' : 'Add New Part'}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Part ID */}
        <div className="mb-6">
          <label htmlFor="partId" className="block font-semibold mb-2 text-gray-700">
            Part ID <span className="text-red-500">*</span>
          </label>
          <input
            id="partId"
            name="partId"
            type="text"
            value={form.partId}
            onChange={handleChange}
            placeholder="Enter unique part ID"
            className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${validationErrors.partId ? 'border-red-500' : 'border-gray-300'}`}
            required
          />
          {validationErrors.partId && (
            <p className="text-red-500 text-sm mt-2">{validationErrors.partId}</p>
          )}
        </div>

        {/* Part Number */}
        <div className="mb-6">
          <label htmlFor="partNumber" className="block font-semibold mb-2 text-gray-700">
            Part Number <span className="text-red-500">*</span>
          </label>
          <input
            id="partNumber"
            name="partNumber"
            type="text"
            value={form.partNumber}
            onChange={handleChange}
            placeholder="Enter part number"
            className={`w-full border p-2 rounded ${validationErrors.partNumber ? 'border-red-500' : ''}`}
            required
          />
          {validationErrors.partNumber && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.partNumber}</p>
          )}
        </div>
      </div>

      {/* Part Name */}
      <div className="mb-6">
        <label htmlFor="name" className="block font-medium mb-1">
          Part Name <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          placeholder="Enter part name (letters and numbers only)"
          className={`w-full border p-2 rounded ${validationErrors.name ? 'border-red-500' : ''}`}
          required
        />
        {validationErrors.name && (
          <p className="text-red-500 text-xs mt-1">{validationErrors.name}</p>
        )}
        <p className="text-gray-500 text-xs mt-1">
          Only letters, numbers, and spaces. No character more than twice in a row.
        </p>
      </div>

      {/* Description */}
      <div className="mb-6">
        <label htmlFor="description" className="block font-medium mb-1">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Enter part description"
          className={`w-full border p-2 rounded ${validationErrors.description ? 'border-red-500' : ''}`}
          rows="3"
          required
        />
        {validationErrors.description && (
          <p className="text-red-500 text-xs mt-1">{validationErrors.description}</p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Quantity */}
        <div className="mb-6">
          <label htmlFor="quantity" className="block font-medium mb-1">
            Quantity <span className="text-red-500">*</span>
          </label>
          <input
            id="quantity"
            name="quantity"
            type="number"
            min="0"
            value={form.quantity}
            onChange={handleChange}
            className={`w-full border p-2 rounded ${validationErrors.quantity ? 'border-red-500' : ''}`}
            required
          />
          {validationErrors.quantity && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.quantity}</p>
          )}
        </div>

        {/* Minimum Stock */}
        <div className="mb-6">
          <label htmlFor="minimumStock" className="block font-medium mb-1">
            Minimum Stock <span className="text-red-500">*</span>
          </label>
          <input
            id="minimumStock"
            name="minimumStock"
            type="number"
            min="0"
            value={form.minimumStock}
            onChange={handleChange}
            className={`w-full border p-2 rounded ${validationErrors.minimumStock ? 'border-red-500' : ''}`}
            required
          />
          {validationErrors.minimumStock && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.minimumStock}</p>
          )}
        </div>

        {/* Unit Price */}
        <div className="mb-6">
          <label htmlFor="unitPrice" className="block font-medium mb-1">
            Unit Price (LKR) <span className="text-red-500">*</span>
          </label>
          <input
            id="unitPrice"
            name="unitPrice"
            type="number"
            min="0"
            step="0.01"
            value={form.unitPrice}
            onChange={handleChange}
            className={`w-full border p-2 rounded ${validationErrors.unitPrice ? 'border-red-500' : ''}`}
            required
          />
          {validationErrors.unitPrice && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.unitPrice}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Location */}
        <div className="mb-6">
          <label htmlFor="location" className="block font-medium mb-1">
            Location <span className="text-red-500">*</span>
          </label>
          <input
            id="location"
            name="location"
            type="text"
            value={form.location}
            onChange={handleChange}
            placeholder="Storage location"
            className={`w-full border p-2 rounded ${validationErrors.location ? 'border-red-500' : ''}`}
            required
          />
          {validationErrors.location && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.location}</p>
          )}
        </div>

        {/* Category ID */}
        <div className="mb-6">
          <label htmlFor="categoryId" className="block font-medium mb-1">
            Category ID <span className="text-red-500">*</span>
          </label>
          <input
            id="categoryId"
            name="categoryId"
            type="text"
            value={form.categoryId}
            onChange={handleChange}
            placeholder="Enter category ID"
            className={`w-full border p-2 rounded ${validationErrors.categoryId ? 'border-red-500' : ''}`}
            required
          />
          {validationErrors.categoryId && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.categoryId}</p>
          )}
        </div>
      </div>

      {/* Report ID (Optional) */}
      <div className="mb-6">
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
            {loading ? "Saving..." : isEditMode ? "Update Part" : "Add Part"}
          </button>
          
          {isEditMode && (
            <button
              type="button"
              onClick={() => navigate("/parts")}
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

export default PartForm;


