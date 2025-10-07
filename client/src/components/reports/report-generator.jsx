import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog.jsx";
import { Button } from "../ui/button.jsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select.jsx";
import { Label } from "../ui/label.jsx";
import { Card, CardContent } from "../ui/card.jsx";
import { useToast } from "@/hooks/use-toast.js";
import { generatePDF } from "@/lib/pdf-generator.js";
import { exportToCSV } from "@/lib/csv-exporter.js";
import { FileText, Download, Calendar } from "lucide-react";

export default function ReportGenerator({ open, onOpenChange }) {
  const [reportType, setReportType] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const { data: parts } = useQuery({
    queryKey: ["/api/parts"],
    enabled: open,
  });

  const { data: lowStockParts } = useQuery({
    queryKey: ["/api/parts/low-stock"],
    enabled: open,
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
    enabled: open,
  });

  const reportTypes = [
    {
      value: "inventory-summary",
      label: "Inventory Summary Report",
      description: "Complete overview of all parts, stock levels, and values",
    },
    {
      value: "low-stock",
      label: "Low Stock Report",
      description: "Parts that are below minimum stock levels",
    },
    {
      value: "movements",
      label: "Stock Movements Report",
      description: "History of all inventory movements and transactions",
    },
  ];

  const handleGeneratePDF = async () => {
    if (!reportType) {
      toast({ title: "Error", description: "Please select a report type", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    try {
      let data, title;
      
      switch (reportType) {
        case "inventory-summary":
          data = parts;
          title = "Inventory Summary Report";
          break;
        case "low-stock":
          data = lowStockParts;
          title = "Low Stock Report";
          break;
        case "movements":
          data = []; // Would need movements data
          title = "Stock Movements Report";
          break;
        default:
          throw new Error("Invalid report type");
      }

      await generatePDF(data || [], title, stats);
      toast({ title: "Success", description: "PDF report generated successfully" });
      onOpenChange(false);
    } catch (error) {
      toast({ title: "Error", description: "Failed to generate PDF report", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportCSV = async () => {
    if (!reportType) {
      toast({ title: "Error", description: "Please select a report type", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    try {
      let data, filename;
      
      switch (reportType) {
        case "inventory-summary":
          data = parts;
          filename = "inventory-summary";
          break;
        case "low-stock":
          data = lowStockParts;
          filename = "low-stock-report";
          break;
        case "movements":
          data = []; // Would need movements data
          filename = "movements-report";
          break;
        default:
          throw new Error("Invalid report type");
      }

      await exportToCSV(data || [], filename);
      toast({ title: "Success", description: "CSV report exported successfully" });
      onOpenChange(false);
    } catch (error) {
      toast({ title: "Error", description: "Failed to export CSV report", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Generate Report</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="report-type">Report Type</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger data-testid="select-report-type">
                <SelectValue placeholder="Select a report type" />
              </SelectTrigger>
              <SelectContent>
                {reportTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {reportType && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mt-1">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900 mb-1">
                      {reportTypes.find(t => t.value === reportType)?.label}
                    </h4>
                    <p className="text-sm text-slate-600">
                      {reportTypes.find(t => t.value === reportType)?.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isGenerating}
              data-testid="button-cancel-report"
            >
              Cancel
            </Button>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={handleExportCSV}
                disabled={!reportType || isGenerating}
                data-testid="button-export-csv"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button
                onClick={handleGeneratePDF}
                disabled={!reportType || isGenerating}
                data-testid="button-generate-pdf"
              >
                <FileText className="w-4 h-4 mr-2" />
                {isGenerating ? "Generating..." : "Generate PDF"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
