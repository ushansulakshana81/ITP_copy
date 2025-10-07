import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog.jsx";
import { Button } from "../ui/button.jsx";
import { Card, CardContent, CardHeader } from "../ui/card.jsx";
import { Badge } from "../ui/badge.jsx";
import { FileText, Download, Calendar, BarChart3 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { generateInventoryPDF } from "@/lib/pdf-generator.js";
import { exportToCSV } from "@/lib/csv-exporter.js";


export default function ReportSelectorModal({ open, onOpenChange }) {
  const [selectedReportType, setSelectedReportType] = useState(null);

  const { data: parts = [] } = useQuery({
    queryKey: ['/api/parts'],
    enabled: open,
  });

  const reportTypes = [
    {
      id: "inventory-summary",
      title: "Inventory Summary Report",
      description: "Complete overview of all parts, stock levels, and values",
      icon: BarChart3,
      count: parts.length,
    },
    {
      id: "low-stock",
      title: "Low Stock Report", 
      description: "Parts that are below minimum stock levels",
      icon: FileText,
      count: parts.filter(p => p.stockStatus === 'low-stock' || p.stockStatus === 'out-of-stock').length,
    },
    {
      id: "movements",
      title: "Stock Movements Report",
      description: "History of all inventory movements and transactions",
      icon: Calendar,
      count: 0, // We'll update this when we have movements
    },
    {
      id: "supplier",
      title: "Supplier Analysis",
      description: "Parts breakdown by supplier with performance metrics",
      icon: FileText,
      count: parts.filter(p => p.supplier).length,
    },
  ];

  const handleGeneratePDF = (reportType) => {
    try {
      let reportData = parts;
      let reportTitle = "Inventory Report";

      switch (reportType) {
        case "low-stock":
          reportData = parts.filter(p => p.stockStatus === 'low-stock' || p.stockStatus === 'out-of-stock');
          reportTitle = "Low Stock Report";
          break;
        case "supplier":
          reportData = parts.filter(p => p.supplier);
          reportTitle = "Supplier Analysis Report";
          break;
        case "inventory-summary":
        default:
          reportTitle = "Inventory Summary Report";
          break;
      }

      generateInventoryPDF(reportData, reportTitle);
      onOpenChange(false);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const handleGenerateCSV = (reportType) => {
    try {
      let reportData = parts;
      let filename = "inventory-report";

      switch (reportType) {
        case "low-stock":
          reportData = parts.filter(p => p.stockStatus === 'low-stock' || p.stockStatus === 'out-of-stock');
          filename = "low-stock-report";
          break;
        case "supplier":
          reportData = parts.filter(p => p.supplier);
          filename = "supplier-analysis-report";
          break;
        case "inventory-summary":
        default:
          filename = "inventory-summary-report";
          break;
      }

      exportToCSV(reportData, filename);
      onOpenChange(false);
    } catch (error) {
      console.error('Error generating CSV:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate Reports</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Report Type Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reportTypes.map((report) => {
              const Icon = report.icon;
              const isSelected = selectedReportType === report.id;
              
              return (
                <Card 
                  key={report.id} 
                  className={`cursor-pointer transition-all ${
                    isSelected 
                      ? 'ring-2 ring-blue-500 bg-blue-50' 
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => setSelectedReportType(report.id)}
                  data-testid={`card-report-${report.id}`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          isSelected ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                          <Icon className={`w-5 h-5 ${
                            isSelected ? 'text-blue-600' : 'text-gray-600'
                          }`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">
                            {report.title}
                          </h3>
                        </div>
                      </div>
                      <Badge variant="secondary">
                        {report.count} items
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-slate-600">
                      {report.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Export Options */}
          {selectedReportType && (
            <div className="p-6 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-slate-900 mb-4">Export Options</h4>
              <div className="flex items-center space-x-4">
                <Button 
                  onClick={() => handleGeneratePDF(selectedReportType)}
                  className="flex items-center space-x-2"
                  data-testid="button-export-pdf"
                >
                  <FileText className="w-4 h-4" />
                  <span>Generate PDF</span>
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleGenerateCSV(selectedReportType)}
                  className="flex items-center space-x-2"
                  data-testid="button-export-csv"
                >
                  <Download className="w-4 h-4" />
                  <span>Export CSV</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}