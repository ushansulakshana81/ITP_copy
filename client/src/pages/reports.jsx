import {useQuery, useMutation} from "@tanstack/react-query";
import {useState} from "react";
import {useToast} from "../hooks/use-toast.js";
import Header from "../components/layout/header.jsx";
import {Card, CardContent, CardHeader} from "../components/ui/card.jsx";
import {Button} from "../components/ui/button.jsx";
import {Input} from "../components/ui/input.jsx";
import {Label} from "../components/ui/label.jsx";
import {FileText, Download, Calendar, BarChart3, Clock} from "lucide-react";
import {apiRequest, queryClient} from "../lib/queryClient.js";
import {
    generatePDF,
    generateSupplierAnalysisPDF,
    generateStockMovementsPDF,
    generateLowStockPDF
} from "../lib/pdf-generator.js";
import {
    exportToCSV,
    exportSupplierAnalysisCSV,
    exportStockMovementsCSV,
    exportLowStockCSV
} from "../lib/csv-exporter.js";

export default function Reports() {
    const {toast} = useToast();
    const [dateFrom, setDateFrom] = useState(() => {
        const date = new Date();
        date.setMonth(date.getMonth() - 1);
        return date.toISOString().split('T')[0];
    });
    const [dateTo, setDateTo] = useState(() => new Date().toISOString().split('T')[0]);

    // Fetch data for reports
    const {data: parts} = useQuery({queryKey: ["/api/parts"]});
    const {data: lowStockParts} = useQuery({queryKey: ["/api/parts/low-stock"]});
    const {data: movements = []} = useQuery({queryKey: ["/api/movements"]});
    const {data: suppliers = []} = useQuery({queryKey: ["/api/suppliers"]});
    const {data: recentReports = []} = useQuery({queryKey: ["/api/reports"]});


    // Create report mutation
    const createReportMutation = useMutation({
        mutationFn: async (report) => {
            return await apiRequest("POST", "/api/reports", report);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["/api/reports"]});
        },
    });

    const createReport = async (type, name) => {
        const dateRange = JSON.stringify({from: dateFrom, to: dateTo});
        await createReportMutation.mutateAsync({
            name,
            type,
            dateRange,
        });
    };

    // Generate PDF report functions
    const generateInventoryPDF = async () => {
        if (!parts?.length) {
            toast({title: "No Data", description: "No parts data available for report generation."});
            return;
        }

        const stats = {
            totalParts: parts.length,
            lowStockCount: parts.filter(p => p.stockStatus === 'low-stock' || p.stockStatus === 'out-of-stock').length,
            totalValue: parts.reduce((sum, p) => sum + (p.quantity * parseFloat(p.unitPrice)), 0),
            activeSuppliers: new Set(parts.map(p => p.supplier?.id).filter(Boolean)).size
        };

        await generatePDF(parts, "Inventory Summary Report", stats);
        await createReport('inventory', `Inventory Summary Report - ${dateFrom} to ${dateTo}`);
        toast({title: "PDF Generated", description: "Inventory summary report has been downloaded."});
    };

    const generateLowStockReport = async () => {
        if (!lowStockParts?.length) {
            toast({title: "No Data", description: "No low stock parts found."});
            return;
        }

        await generateLowStockPDF(lowStockParts);
        await createReport('low-stock', `Low Stock Report - ${dateFrom} to ${dateTo}`);
        toast({title: "PDF Generated", description: "Low stock report has been downloaded."});
    };

    const generateMovementsReport = async () => {
        if (!movements?.length) {
            toast({title: "No Data", description: "No movement data available."});
            return;
        }

        await generateStockMovementsPDF(movements);
        await createReport('movements', `Stock Movements Report - ${dateFrom} to ${dateTo}`);
        toast({title: "PDF Generated", description: "Stock movements report has been downloaded."});
    };

    const generateSupplierReport = async () => {
        if (!suppliers?.length || !parts?.length) {
            toast({title: "No Data", description: "No supplier or parts data available."});
            return;
        }

        // Calculate supplier analysis data
        const supplierData = suppliers.map((supplier) => {
            const supplierParts = parts.filter(p => p.supplier?.id === supplier.id);
            return {
                name: supplier.name,
                totalStock: supplierParts.reduce((sum, p) => sum + p.quantity, 0),
                totalValue: supplierParts.reduce((sum, p) => sum + (p.quantity * parseFloat(p.unitPrice)), 0)
            };
        });

        await generateSupplierAnalysisPDF(supplierData);
        await createReport('supplier-analysis', `Supplier Analysis Report - ${dateFrom} to ${dateTo}`);
        toast({title: "PDF Generated", description: "Supplier analysis report has been downloaded."});
    };

    // Export CSV functions
    const exportInventoryCSVReport = async () => {
        if (!parts?.length) {
            toast({title: "No Data", description: "No parts data available for export."});
            return;
        }

        exportToCSV(parts, "inventory-summary");
        await createReport('inventory', `Inventory CSV Export - ${dateFrom} to ${dateTo}`);
        toast({title: "CSV Exported", description: "Inventory data has been exported to CSV."});
    };

    const exportLowStockCSVReport = async () => {
        if (!lowStockParts?.length) {
            toast({title: "No Data", description: "No low stock parts found."});
            return;
        }

        exportLowStockCSV(lowStockParts, "low-stock-report");
        await createReport('low-stock', `Low Stock CSV Export - ${dateFrom} to ${dateTo}`);
        toast({title: "CSV Exported", description: "Low stock data has been exported to CSV."});
    };

    const exportMovementsCSVReport = async () => {
        if (!movements?.length) {
            toast({title: "No Data", description: "No movement data available."});
            return;
        }

        exportStockMovementsCSV(movements);
        await createReport('movements', `Stock Movements CSV Export - ${dateFrom} to ${dateTo}`);
        toast({title: "CSV Exported", description: "Movements data has been exported to CSV."});
    };

    const exportSupplierCSVReport = async () => {
        if (!suppliers?.length || !parts?.length) {
            toast({title: "No Data", description: "No supplier or parts data available."});
            return;
        }

        const supplierData = suppliers.map((supplier) => {
            const supplierParts = parts.filter(p => p.supplier?.id === supplier.id);
            return {
                name: supplier.name,
                totalStock: supplierParts.reduce((sum, p) => sum + p.quantity, 0),
                totalValue: supplierParts.reduce((sum, p) => sum + (p.quantity * parseFloat(p.unitPrice)), 0)
            };
        });

        exportSupplierAnalysisCSV(supplierData);
        await createReport('supplier-analysis', `Supplier Analysis CSV Export - ${dateFrom} to ${dateTo}`);
        toast({title: "CSV Exported", description: "Supplier analysis has been exported to CSV."});
    };

    const reportTypes = [
        {
            id: "inventory-summary",
            title: "Inventory Summary Report",
            description: "Complete overview of all parts, stock levels, and values",
            icon: BarChart3,
            pdfAction: generateInventoryPDF,
            csvAction: exportInventoryCSVReport,
        },
        {
            id: "low-stock",
            title: "Low Stock Report",
            description: "Parts that are below minimum stock levels",
            icon: FileText,
            pdfAction: generateLowStockReport,
            csvAction: exportLowStockCSVReport,
        },
        {
            id: "movements",
            title: "Stock Movements Report",
            description: "History of all inventory movements and transactions",
            icon: Calendar,
            pdfAction: generateMovementsReport,
            csvAction: exportMovementsCSVReport,
        },
        {
            id: "supplier",
            title: "Supplier Analysis",
            description: "Supplier performance with stock and value metrics",
            icon: FileText,
            pdfAction: generateSupplierReport,
            csvAction: exportSupplierCSVReport,
        },
    ];

    return (
        <>
            <Header
                title="Reports"
                description="Generate and download inventory reports"
            />

            <div className="p-6 space-y-6">
                {/* Date Range Selection */}
                <Card>
                    <CardHeader>
                        <h3 className="text-lg font-semibold text-slate-900">Report Settings</h3>
                        <p className="text-sm text-slate-600">Select date range for report generation</p>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="date-from">From Date</Label>
                                <Input
                                    id="date-from"
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    data-testid="input-date-from"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="date-to">To Date</Label>
                                <Input
                                    id="date-to"
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    data-testid="input-date-to"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Recently Created Reports */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center space-x-3">
                            <Clock className="w-5 h-5 text-blue-600"/>
                            <h3 className="text-lg font-semibold text-slate-900">Recently Generated Reports</h3>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {recentReports.length === 0 ? (
                            <p className="text-slate-600 text-center py-4">No reports generated yet</p>
                        ) : (
                            <div className="space-y-2">
                                {recentReports.slice(0, 5).map((report) => (
                                    <div key={report.id}
                                         className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                                         data-testid={`report-item-${report.id}`}>
                                        <div>
                                            <p className="font-medium text-slate-900"
                                               data-testid={`report-name-${report.id}`}>
                                                {report.name}
                                            </p>
                                            <p className="text-sm text-slate-600"
                                               data-testid={`report-date-${report.id}`}>
                                                {new Date(report.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                            {report.type}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Report Types */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                    {reportTypes.map((report) => {
                        const Icon = report.icon;
                        return (
                            <Card key={report.id} className="hover:shadow-md transition-shadow">
                                <CardHeader>
                                    <div className="flex items-center space-x-3">
                                        <div
                                            className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <Icon className="w-5 h-5 text-blue-600"/>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-slate-900"
                                                data-testid={`text-report-title-${report.id}`}>
                                                {report.title}
                                            </h3>
                                            <p className="text-sm text-slate-600"
                                               data-testid={`text-report-desc-${report.id}`}>
                                                {report.description}
                                            </p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center space-x-3">
                                        <Button
                                            onClick={report.pdfAction}
                                            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                                            data-testid={`button-generate-pdf-${report.id}`}
                                        >
                                            <FileText className="w-4 h-4 mr-2"/>
                                            Generate PDF
                                        </Button>
                                        <Button
                                            onClick={report.csvAction}
                                            variant="outline"
                                            className="flex-1 border-green-500 text-green-700 hover:bg-green-50"
                                            data-testid={`button-export-csv-${report.id}`}
                                        >
                                            <Download className="w-4 h-4 mr-2"/>
                                            Export CSV
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </>
    );
}