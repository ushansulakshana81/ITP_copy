// frontend/src/modules/supplier/components/QuotationTable.jsx

/**
 * QuotationTable Component
 * Displays a table of quotations for comparison
 * Used in the QuotationComparison page (placeholder for future feature)
 */

import React from "react";

/**
 * Quotation Table Component
 * @param {Object} props - Component props
 * @param {Array} props.quotations - Array of quotation objects
 * @param {string} props.quotations[].supplier - Supplier name
 * @param {number} props.quotations[].price - Quoted price
 * @param {number} props.quotations[].deliveryTime - Delivery time in days
 */
const QuotationTable = ({ quotations }) => (
  <table className="w-full border mt-4">
    {/* Table Header */}
    <thead>
      <tr className="bg-gray-100">
        {/* Supplier column */}
        <th className="p-2 border">Supplier</th>
        
        {/* Price column */}
        <th className="p-2 border">Price</th>
        
        {/* Delivery Time column */}
        <th className="p-2 border">Delivery Time</th>
      </tr>
    </thead>
    
    {/* Table Body - Maps through quotations array */}
    <tbody>
      {quotations.map((q, i) => (
        <tr key={i}>
          {/* Supplier Name cell */}
          <td className="p-2 border">{q.supplier}</td>
          
          {/* Price cell - Formatted with LKR */}
          <td className="p-2 border">LKR {q.price}</td>
          
          {/* Delivery Time cell - Shows days */}
          <td className="p-2 border">{q.deliveryTime} days</td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default QuotationTable;
