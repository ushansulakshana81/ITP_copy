import { Badge } from "../ui/badge.jsx";
import { Button } from "../ui/button.jsx";
import { Card, CardContent } from "../ui/card.jsx";
import { Skeleton } from "../ui/skeleton.jsx";
import { Input } from "../ui/input.jsx";
import { Edit, Trash2, Search } from "lucide-react";
import { useState, useMemo } from "react";



export default function PartsTable({ parts, isLoading, onEdit, onDelete }) {
  const [searchTerm, setSearchTerm] = useState("");

 const filteredParts = useMemo(() => {
    if (!parts || !Array.isArray(parts)) return [];
    if (!searchTerm) return parts;
    
    const search = searchTerm.toLowerCase();
    return parts.filter(part => {
     try {
        // Safely check each field with null/undefined protection
        const partNumber = (part.partNumber || '').toLowerCase();
        const name = (part.name || '').toLowerCase();
        const id = (part.id || part._id || '').toString().toLowerCase();
        const description = (part.description || '').toLowerCase();
        const categoryName = (part.category?.name || '').toLowerCase();
        const supplierName = (part.supplier?.name || '').toLowerCase();
        const location = (part.location || '').toLowerCase();
        const stockStatus = (part.stockStatus || '').toLowerCase();

        return partNumber.includes(search) ||
               name.includes(search) ||
               id.includes(search) ||
               description.includes(search) ||
               categoryName.includes(search) ||
               supplierName.includes(search) ||
               location.includes(search) ||
               stockStatus.includes(search);
      } catch (error) {
        console.error('Error filtering part:', part, error);
        return false;
      }
    });
  }, [parts, searchTerm]);

  const getStockBadgeVariant = (stockStatus) => {
    switch (stockStatus) {
      case 'in-stock':
        return 'default';
      case 'low-stock':
        return 'secondary';
      case 'out-of-stock':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getStockBadgeText = (stockStatus) => {
    switch (stockStatus) {
      case 'in-stock':
        return 'In Stock';
      case 'low-stock':
        return 'Low Stock';
      case 'out-of-stock':
        return 'Out of Stock';
      default:
        return 'Unknown';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-6 font-medium text-slate-600">Part Number</th>
                  <th className="text-left py-3 px-6 font-medium text-slate-600">Part Name</th>
                  <th className="text-left py-3 px-6 font-medium text-slate-600">Category</th>
                  <th className="text-left py-3 px-6 font-medium text-slate-600">Stock</th>
                  <th className="text-left py-3 px-6 font-medium text-slate-600">Location</th>
                  <th className="text-left py-3 px-6 font-medium text-slate-600">Supplier</th>
                  <th className="text-left py-3 px-6 font-medium text-slate-600">Status</th>
                  <th className="text-left py-3 px-6 font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="border-b border-slate-100">
                    <td className="py-4 px-6">
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-24" />
                    </td>
                    <td className="py-4 px-6">
                      <Skeleton className="h-6 w-20" />
                    </td>
                    <td className="py-4 px-6">
                      <Skeleton className="h-4 w-16 mb-2" />
                      <Skeleton className="h-3 w-12" />
                    </td>
                    <td className="py-4 px-6">
                      <Skeleton className="h-4 w-16" />
                    </td>
                    <td className="py-4 px-6">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="py-4 px-6">
                      <Skeleton className="h-6 w-20" />
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-8" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (parts.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <h4 className="text-lg font-semibold text-slate-900 mb-2">No Parts Found</h4>
          <p className="text-slate-600">Try adjusting your search criteria or add some parts to get started</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        {/* Search Filter */}
        <div className="p-4 border-b border-slate-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by any field: part number, name, category, supplier, location, status..."
              className="pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              data-testid="input-search-parts"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-6 font-medium text-slate-600">Part Number</th>
                <th className="text-left py-3 px-6 font-medium text-slate-600">Part Name</th>
                <th className="text-left py-3 px-6 font-medium text-slate-600">Category</th>
                <th className="text-left py-3 px-6 font-medium text-slate-600">Stock</th>
                <th className="text-left py-3 px-6 font-medium text-slate-600">Location</th>
                <th className="text-left py-3 px-6 font-medium text-slate-600">Supplier</th>
                <th className="text-left py-3 px-6 font-medium text-slate-600">Status</th>
                <th className="text-left py-3 px-6 font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredParts.map((part) => (
                <tr key={part._id} className="border-b border-slate-100 table-row" data-testid={`row-part-${part._id}`}>
                  <td className="py-4 px-6">
                    <p className="font-mono text-slate-900 font-medium" data-testid={`text-part-number-${part._id}`}>
                      {part.partNumber}
                    </p>
                  </td>
                  <td className="py-4 px-6">
                    <p className="font-medium text-slate-900" data-testid={`text-part-name-${part._id}`}>
                      {part.name}
                    </p>
                  </td>
                  <td className="py-4 px-6">
                    <Badge variant="secondary" data-testid={`badge-category-${part._id}`}>
                      {part.category?.name || 'Uncategorized'}
                    </Badge>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-medium text-slate-900" data-testid={`text-quantity-${part._id}`}>
                        {part.quantity} units
                      </p>
                      <p className="text-sm text-slate-600">Min: {part.minimumStock}</p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-slate-900" data-testid={`text-location-${part._id}`}>
                      {part.location || 'Not set'}
                    </p>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-slate-900" data-testid={`text-supplier-${part._id}`}>
                      {part.supplier?.name || 'Not assigned'}
                    </p>
                  </td>
                  <td className="py-4 px-6">
                    <Badge variant={getStockBadgeVariant(part.stockStatus)} data-testid={`badge-status-${part._id}`}>
                      {getStockBadgeText(part.stockStatus)}
                    </Badge>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => onEdit(part)}
                        className="hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        data-testid={`button-edit-${part._id}`}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      {onDelete && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => onDelete(part)}
                          className="hover:bg-red-50 hover:text-red-600 transition-colors"
                          data-testid={`button-delete-${part._id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-6 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600" data-testid="text-table-pagination">
              Showing {filteredParts.length} of {parts.length} entries
              {searchTerm && <span className="ml-2 text-blue-600">filtered by "{searchTerm}"</span>}
            </p>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled data-testid="button-table-prev">
                Previous
              </Button>
              <Button variant="default" size="sm" data-testid="button-table-page-1">
                1
              </Button>
              <Button variant="outline" size="sm" data-testid="button-table-next">
                Next
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
