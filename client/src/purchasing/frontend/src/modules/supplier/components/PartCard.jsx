// frontend/src/modules/supplier/components/PartCard.jsx

/**
 * PartCard Component
 * Displays individual part information in a card layout
 * Shows stock status with color coding
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import { FiEdit } from "react-icons/fi"; // Feather Icons - Edit

/**
 * Part Card Component
 * @param {Object} props - Component props
 * @param {Object} props.part - Part object containing part details
 */
const PartCard = ({ part }) => {
  const navigate = useNavigate();
  
  // Determine if stock is low
  const isLowStock = part.quantity <= part.minimumStock;
  
  const handleEdit = () => {
    navigate(`/parts/edit/${part._id}`);
  };
  
  return (
    <div className={`card cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${isLowStock ? 'border-l-4 border-red-500' : 'border-l-4 border-green-500'}`}>
      {/* Part Name - Main heading */}
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-bold">{part.name}</h3>
        {isLowStock && (
          <StatusBadge status="low-stock" />
        )}
      </div>
      
      {/* Part ID and Number */}
      <div className="grid grid-cols-2 gap-2 mb-2">
        <p className="text-sm">
          <strong>Part ID:</strong> {part.partId}
        </p>
        <p className="text-sm">
          <strong>Part #:</strong> {part.partNumber}
        </p>
      </div>
      
      {/* Description */}
      <p className="mb-2 text-sm text-gray-600">
        {part.description}
      </p>
      
      {/* Stock Information */}
      <div className="grid grid-cols-2 gap-2 mb-2">
        <p className="text-sm">
          <strong>Quantity:</strong> {part.quantity}
        </p>
        <p className="text-sm">
          <strong>Min Stock:</strong> {part.minimumStock}
        </p>
      </div>
      
      {/* Price and Location */}
      <div className="grid grid-cols-2 gap-2 mb-2">
        <p className="text-sm">
          <strong>Unit Price:</strong> LKR {part.unitPrice?.toFixed(2)}
        </p>
        <p className="text-sm">
          <strong>Location:</strong> {part.location}
        </p>
      </div>
      
      {/* Category */}
      <p className="mb-2 text-sm">
        <strong>Category:</strong> {part.categoryId}
      </p>
      
      {/* Report ID - Only show if exists */}
      {part.reportId && (
        <p className="text-sm text-gray-500">
          <strong>Report ID:</strong> {part.reportId}
        </p>
      )}
      
      {/* Edit Button */}
      <div className="mt-4">
        <button 
          onClick={handleEdit}
          className="btn-primary text-sm flex items-center gap-2"
        >
          <FiEdit className="w-4 h-4" />
          Edit Part
        </button>
      </div>
    </div>
  );
};

export default PartCard;
