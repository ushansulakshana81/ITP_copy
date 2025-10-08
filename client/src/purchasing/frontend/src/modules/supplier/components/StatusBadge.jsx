// frontend/src/modules/supplier/components/StatusBadge.jsx

/**
 * StatusBadge Component
 * Displays colored status indicators for different states
 * Provides consistent styling across the application
 */

import React from 'react';
import { FiCheck, FiClock, FiX, FiAlertCircle, FiSend, FiFileText } from 'react-icons/fi';

/**
 * StatusBadge Component
 * @param {Object} props - Component props
 * @param {string} props.status - The status to display (e.g., "pending", "approved", "completed")
 * @param {string} props.className - Optional additional CSS classes
 * @param {boolean} props.showIcon - Whether to show an icon (default: true)
 */
const StatusBadge = ({ status, className = '', showIcon = true }) => {
  // Define color schemes for each status
  const statusStyles = {
    // Purchase Order Statuses
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    approved: 'bg-blue-100 text-blue-700 border-blue-300',
    received: 'bg-green-100 text-green-700 border-green-300',
    cancelled: 'bg-red-100 text-red-700 border-red-300',
    
    // Quotation Statuses
    draft: 'bg-gray-100 text-gray-700 border-gray-300',
    sent: 'bg-blue-100 text-blue-700 border-blue-300',
    comparing: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    completed: 'bg-green-100 text-green-700 border-green-300',
    
    // Stock Statuses
    'low-stock': 'bg-red-100 text-red-700 border-red-300',
    'in-stock': 'bg-green-100 text-green-700 border-green-300',
    
    // Generic Statuses
    active: 'bg-green-100 text-green-700 border-green-300',
    inactive: 'bg-gray-100 text-gray-700 border-gray-300',
    success: 'bg-green-100 text-green-700 border-green-300',
    warning: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    error: 'bg-red-100 text-red-700 border-red-300',
    info: 'bg-blue-100 text-blue-700 border-blue-300',
  };

  // Normalize status to lowercase for matching
  const normalizedStatus = status?.toLowerCase() || 'draft';
  
  // Get the style for this status (default to draft if not found)
  const style = statusStyles[normalizedStatus] || statusStyles.draft;

  // Map status to icons
  const statusIcons = {
    // Purchase Order Statuses
    pending: FiClock,
    approved: FiCheck,
    received: FiCheck,
    cancelled: FiX,
    
    // Quotation Statuses
    draft: FiFileText,
    sent: FiSend,
    comparing: FiClock,
    completed: FiCheck,
    
    // Stock Statuses
    'low-stock': FiAlertCircle,
    'in-stock': FiCheck,
    
    // Generic Statuses
    active: FiCheck,
    inactive: FiX,
    success: FiCheck,
    warning: FiAlertCircle,
    error: FiX,
    info: FiAlertCircle,
  };

  const IconComponent = statusIcons[normalizedStatus] || FiFileText;

  // Capitalize first letter for display
  const displayStatus = status?.charAt(0).toUpperCase() + status?.slice(1) || 'Draft';

  return (
    <span 
      className={`
        inline-flex items-center 
        px-3 py-1 
        rounded-full 
        text-xs font-semibold 
        border
        transition-all duration-200
        ${style}
        ${className}
      `}
    >
      {showIcon && <IconComponent className="w-3 h-3 mr-1.5" />}
      {displayStatus}
    </span>
  );
};

export default StatusBadge;
