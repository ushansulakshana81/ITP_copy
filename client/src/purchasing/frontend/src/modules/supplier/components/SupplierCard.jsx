// frontend/src/modules/supplier/components/SupplierCard.jsx

/**
 * SupplierCard Component
 * Displays individual supplier information in a card layout
 * Used in the SupplierList page to show supplier details
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FiEdit, FiTrash2 } from "react-icons/fi"; // Feather Icons - Edit, Trash
import supplierService from "../services/supplierService";

/**
 * Supplier Card Component
 * @param {Object} props - Component props
 * @param {Object} props.supplier - Supplier object containing supplier details
 * @param {string} props.supplier._id - Unique identifier
 * @param {string} props.supplier.supplierId - Supplier ID
 * @param {string} props.supplier.name - Supplier name
 * @param {string} props.supplier.contactEmail - Supplier email
 * @param {string} props.supplier.contactPhone - Supplier phone number
 * @param {string} props.supplier.address - Supplier address
 * @param {string} props.supplier.reportId - Report ID (optional)
 * @param {Function} props.onDelete - Callback function after successful deletion
 */
const SupplierCard = ({ supplier, onDelete }) => {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = () => {
    navigate(`/suppliers/edit/${supplier._id}`);
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${supplier.name}"?\n\nThis action cannot be undone.`
    );
    
    if (!confirmDelete) return;

    setIsDeleting(true);
    try {
      await supplierService.deleteSupplier(supplier._id);
      toast.success(`Supplier "${supplier.name}" deleted successfully`);
      if (onDelete) {
        onDelete(supplier._id);
      }
    } catch (error) {
      toast.error(`Failed to delete supplier: ${error.response?.data?.message || error.message}`);
      setIsDeleting(false);
    }
  };

  return (
    <div className="card cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
      {/* Supplier Name - Main heading with fixed height to prevent layout shifts */}
      <h3 className="text-xl font-bold mb-4 text-gray-800 min-h-[3.5rem] line-clamp-2">
        {supplier.name}
      </h3>
      
      {/* Supplier Information Grid - Flex grow to push buttons to bottom */}
      <div className="space-y-3 mb-6 flex-grow">
        {/* Supplier ID */}
        <p className="text-sm">
          <strong className="text-gray-700">Supplier ID:</strong>{" "}
          <span className="text-gray-600">{supplier.supplierId}</span>
        </p>
        
        {/* Supplier Email */}
        <p className="text-sm">
          <strong className="text-gray-700">Email:</strong>{" "}
          <span className="text-gray-600 break-all">{supplier.contactEmail}</span>
        </p>
        
        {/* Supplier Phone */}
        <p className="text-sm">
          <strong className="text-gray-700">Phone:</strong>{" "}
          <span className="text-gray-600">{supplier.contactPhone}</span>
        </p>
        
        {/* Supplier Address */}
        <p className="text-sm">
          <strong className="text-gray-700">Address:</strong>{" "}
          <span className="text-gray-600">{supplier.address}</span>
        </p>
        
        {/* Report ID - Only show if exists */}
        {supplier.reportId && (
          <p className="text-sm">
            <strong className="text-gray-700">Report ID:</strong>{" "}
            <span className="text-gray-600">{supplier.reportId}</span>
          </p>
        )}
      </div>

      {/* Action Buttons - Always at bottom */}
      <div className="mt-auto pt-4 border-t border-gray-200">
        <div className="flex gap-3">
          <button 
            onClick={handleEdit}
            className="btn-primary text-sm flex items-center justify-center gap-2 flex-1"
          >
            <FiEdit className="w-4 h-4" />
            Edit
          </button>
          <button 
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm flex items-center justify-center gap-2 flex-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FiTrash2 className="w-4 h-4" />
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupplierCard;
