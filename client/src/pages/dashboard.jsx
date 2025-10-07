import {useQuery, useMutation} from "@tanstack/react-query";
import {Card, CardContent, CardHeader} from "../components/ui/card.jsx";
import {Button} from "../components/ui/button.jsx";
import {Input} from "../components/ui/input.jsx";
import {Badge} from "../components/ui/badge.jsx";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "../components/ui/tooltip.jsx";
import Header from "../components/layout/header.jsx";
import AddPartModal from "../components/parts/add-part-modal.jsx";
import EditPartModal from "../components/parts/edit-part-modal.jsx";
import ReportSelectorModal from "../components/reports/report-selector-modal.jsx";
import StockMovementModal from "../components/inventory/stock-movement-modal.jsx";
import {useToast} from "../hooks/use-toast.js";
import {queryClient, apiRequest} from "../lib/queryClient.js";
import {
    Package,
    AlertTriangle,
    DollarSign,
    Building2,
    TrendingUp,
    TrendingDown,
    Plus,
    ArrowUp,
    ArrowDown,
    FileText,
    Download,
    Eye,
    Search,
    Filter,
    Edit,
    Trash2,
    Bell
} from "lucide-react";
import {useState, useMemo} from "react";

export default function Dashboard() {
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [showStockInModal, setShowStockInModal] = useState(false);
    const [showStockOutModal, setShowStockOutModal] = useState(false);
    const [selectedPart, setSelectedPart] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const {toast} = useToast();

    // Fetch inventory stats
    const {data: stats} = useQuery({
        queryKey: ["/api/stats"],
    });

    // Fetch low stock parts
    const {data: lowStockParts} = useQuery({
        queryKey: ["/api/parts/low-stock"],
    });

    // Fetch recent parts for the table
    const {data: parts} = useQuery({
        queryKey: ["/api/parts"],
    });

    // Filter parts based on search query
const filteredParts = useMemo(() => {
    if (!parts?.length) return [];
    if (!searchQuery) return parts;

    const search = searchQuery.toLowerCase().trim();
    
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
            console.error('Error filtering part in dashboard:', part, error);
            return false;
        }
    });
}, [parts, searchQuery]);

    const recentParts = filteredParts;

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

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

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: async (partId) => {
            const response = await apiRequest("DELETE", `/api/parts/${partId}`);
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["/api/parts"]});
            queryClient.invalidateQueries({queryKey: ["/api/stats"]});
            queryClient.invalidateQueries({queryKey: ["/api/parts/low-stock"]});
            toast({title: "Success", description: "Part deleted successfully"});
        },
        onError: () => {
            toast({title: "Error", description: "Failed to delete part", variant: "destructive"});
        },
    });

    const handleEdit = (part) => {
        setSelectedPart(part);
        setShowEditModal(true);
    };

    const handleDelete = (part) => {
        if (window.confirm(`Are you sure you want to delete "${part.name}"?`)) {
            deleteMutation.mutate(part._id);
        }
    };

    return (
        <>
            <Header
                title="Dashboard"
                description="Monitor your inventory performance and stock levels"
            />

            <div className="p-6 space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-600">Total Parts</p>
                                    <p className="text-3xl font-bold text-slate-900" data-testid="stat-total-parts">
                                        {(stats)?.totalParts?.toLocaleString() || '0'}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Package className="w-6 h-6 text-blue-600"/>
                                </div>
                            </div>
                            <div className="mt-4 flex items-center text-sm">
                                <TrendingUp className="w-4 h-4 text-green-600 mr-1"/>
                                <span className="text-green-600 font-medium">+12.5%</span>
                                <span className="text-slate-600 ml-1">from last month</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-600">Low Stock Items</p>
                                    <p className="text-3xl font-bold text-amber-600" data-testid="stat-low-stock">
                                        {(stats)?.lowStockCount || '0'}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                                    <AlertTriangle className="w-6 h-6 text-amber-600"/>
                                </div>
                            </div>
                            <div className="mt-4 flex items-center text-sm">
                                <TrendingDown className="w-4 h-4 text-red-600 mr-1"/>
                                <span className="text-red-600 font-medium">+3</span>
                                <span className="text-slate-600 ml-1">new alerts</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-600">Total Value</p>
                                    <p className="text-3xl font-bold text-slate-900" data-testid="stat-total-value">
                                        {(stats)?.totalValue ? formatCurrency((stats).totalValue) : '$0'}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                    <DollarSign className="w-6 h-6 text-green-600"/>
                                </div>
                            </div>
                            <div className="mt-4 flex items-center text-sm">
                                <TrendingUp className="w-4 h-4 text-green-600 mr-1"/>
                                <span className="text-green-600 font-medium">+8.2%</span>
                                <span className="text-slate-600 ml-1">from last month</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-600">Active Suppliers</p>
                                    <p className="text-3xl font-bold text-slate-900" data-testid="stat-suppliers">
                                        {(stats)?.activeSuppliers || '0'}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <Building2 className="w-6 h-6 text-purple-600"/>
                                </div>
                            </div>
                            <div className="mt-4 flex items-center text-sm">
                                <span className="text-slate-600">2 new this month</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Alerts and Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Low Stock Alerts */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <h3 className="text-lg font-semibold text-slate-900">Low Stock Alerts</h3>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div className="relative inline-flex">
                                                        <Bell
                                                            className="w-5 h-5 text-amber-600 hover:text-amber-800 hover:scale-110 transition-all duration-200 cursor-pointer"/>
                                                        {lowStockParts && lowStockParts.length > 0 && (
                                                            <div
                                                                className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                                <span className="text-[9px] text-white font-bold">
                                  {lowStockParts.length}
                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>
                                                        {lowStockParts && lowStockParts.length > 0
                                                            ? `${lowStockParts.length} parts need attention`
                                                            : "All parts are properly stocked"}
                                                    </p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                    <Button variant="outline" size="sm" data-testid="button-view-all-alerts">
                                        <Eye className="w-4 h-4 mr-2"/>
                                        View All
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {lowStockParts?.slice(0, 3).map((part) => (
                                        <div
                                            key={part.id}
                                            className={`flex items-center justify-between p-4 rounded-lg border ${
                                                part.stockStatus === 'out-of-stock'
                                                    ? 'bg-red-50 border-red-200'
                                                    : 'bg-amber-50 border-amber-200'
                                            }`}
                                            data-testid={`alert-part-${part._id}`}
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div
                                                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                                        part.stockStatus === 'out-of-stock'
                                                            ? 'bg-red-100'
                                                            : 'bg-amber-100'
                                                    }`}>
                                                    <Package className={`w-5 h-5 ${
                                                        part.stockStatus === 'out-of-stock'
                                                            ? 'text-red-600'
                                                            : 'text-amber-600'
                                                    }`}/>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900"
                                                       data-testid={`text-part-name-${part._id}`}>
                                                        {part.name}
                                                    </p>
                                                    <p className="text-sm text-slate-600"
                                                       data-testid={`text-part-number-${part._id}`}>
                                                        Part #{part.partNumber}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-sm font-medium ${
                                                    part.stockStatus === 'out-of-stock'
                                                        ? 'text-red-600'
                                                        : 'text-amber-600'
                                                }`} data-testid={`text-quantity-${part._id}`}>
                                                    {part.quantity} units left
                                                </p>
                                                <p className="text-xs text-slate-600">Min: {part.minimumStock} units</p>
                                            </div>
                                        </div>
                                    )) || (
                                        <p className="text-slate-500 text-center py-4">No low stock alerts</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Quick Actions */}
                    <div>
                        <Card>
                            <CardHeader>
                                <h3 className="text-lg font-semibold text-slate-900">Quick Actions</h3>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <Button
                                        className="w-full justify-start hover:bg-blue-600 transition-colors"
                                        onClick={() => setShowAddModal(true)}
                                        data-testid="button-add-part"
                                    >
                                        <Plus className="w-4 h-4 mr-2"/>
                                        Add New Part
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start button-hover-green transition-colors"
                                        onClick={() => setShowStockInModal(true)}
                                        data-testid="button-stock-in"
                                    >
                                        <ArrowUp className="w-4 h-4 mr-2"/>
                                        Stock In
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start button-hover-red transition-colors"
                                        onClick={() => setShowStockOutModal(true)}
                                        data-testid="button-stock-out"
                                    >
                                        <ArrowDown className="w-4 h-4 mr-2"/>
                                        Stock Out
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start button-hover-blue transition-colors"
                                        onClick={() => setShowReportModal(true)}
                                        data-testid="button-generate-report"
                                    >
                                        <FileText className="w-4 h-4 mr-2"/>
                                        Generate Report
                                    </Button>
                                    <Button variant="outline"
                                            className="w-full justify-start button-hover-blue transition-colors"
                                            data-testid="button-export-data">
                                        <Download className="w-4 h-4 mr-2"/>
                                        Export Data
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Recent Inventory Table */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-slate-900">Recent Inventory Items</h3>
                            <div className="relative">
                                <Search
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400"/>
                                <Input
                                    type="text"
                                    placeholder="Search by any field: part number, name, category, supplier, location, status..."
                                    className="pl-10 w-80"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    data-testid="input-search-dashboard"
                                />
                            </div>
                        </div>
                    </CardHeader>
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
                                {recentParts?.slice(0, 5).map((part) => (
                                    <tr key={part.id} className="border-b border-slate-100 table-row"
                                        data-testid={`row-part-${part._id}`}>
                                        <td className="py-4 px-6">
                                            <p className="font-mono text-slate-900 font-medium"
                                               data-testid={`text-part-number-${part._id}`}>
                                                {part.partNumber}
                                            </p>
                                        </td>
                                        <td className="py-4 px-6">
                                            <p className="font-medium text-slate-900"
                                               data-testid={`text-part-name-${part._id}`}>
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
                                                <p className="font-medium text-slate-900"
                                                   data-testid={`text-quantity-${part._id}`}>
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
                                            <Badge variant={getStockBadgeVariant(part.stockStatus)}
                                                   data-testid={`badge-status-${part._id}`}>
                                                {getStockBadgeText(part.stockStatus)}
                                            </Badge>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEdit(part)}
                                                    className="hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                                    data-testid={`button-edit-${part._id}`}
                                                >
                                                    <Edit className="w-4 h-4"/>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(part)}
                                                    className="hover:bg-red-50 hover:text-red-600 transition-colors"
                                                    disabled={deleteMutation.isPending}
                                                    data-testid={`button-delete-${part._id}`}
                                                >
                                                    <Trash2 className="w-4 h-4"/>
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                )) || (
                                    <tr>
                                        <td colSpan={7} className="py-8 text-center text-slate-500">
                                            No parts found
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-6 border-t border-slate-200">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-slate-600" data-testid="text-pagination-info">
                                    Showing 1
                                    to {Math.min(5, recentParts?.length || 0)} of {recentParts?.length || 0} entries
                                </p>
                                <div className="flex items-center space-x-2">
                                    <Button variant="outline" size="sm" disabled data-testid="button-prev">
                                        Previous
                                    </Button>
                                    <Button variant="default" size="sm" data-testid="button-page-1">
                                        1
                                    </Button>
                                    <Button variant="outline" size="sm" data-testid="button-next">
                                        Next
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <AddPartModal
                open={showAddModal}
                onOpenChange={setShowAddModal}
            />

            <EditPartModal
                open={showEditModal}
                onOpenChange={setShowEditModal}
                part={selectedPart}
            />

            <ReportSelectorModal
                open={showReportModal}
                onOpenChange={setShowReportModal}
            />

            <StockMovementModal
                open={showStockInModal}
                onOpenChange={setShowStockInModal}
                type="in"
            />

            <StockMovementModal
                open={showStockOutModal}
                onOpenChange={setShowStockOutModal}
                type="out"
            />
        </>
    );
}