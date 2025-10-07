import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog.jsx";
import { Button } from "../ui/button.jsx";
import { Input } from "../ui/input.jsx";
import { Label } from "../ui/label.jsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select.jsx";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "../../hooks/use-toast.js";
import { queryClient, apiRequest } from "../../lib/queryClient.js";
import { ArrowUp, ArrowDown } from "lucide-react";

export default function StockMovementModal({ open, onOpenChange, type }) {
  const [selectedPartId, setSelectedPartId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const { toast } = useToast();

  const { data: parts = [] } = useQuery({
    queryKey: ['/api/parts'],
    enabled: open,
  });

  const movementMutation = useMutation({
    mutationFn: async (movement) => {
      const response = await fetch('/api/movements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(movement),
      });
      
      if (!response.ok) {
        throw new Error('Failed to record movement');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: `Stock ${type === 'in' ? 'In' : 'Out'} Successful`,
        description: `Stock movement has been recorded successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/parts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/movements'] });
      onOpenChange(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to record stock movement",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setSelectedPartId("");
    setQuantity("");
    setReason("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedPartId || !quantity) {
      toast({
        title: "Validation Error",
        description: "Please select a part and enter quantity",
        variant: "destructive",
      });
      return;
    }

    const quantityNum = parseInt(quantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      toast({
        title: "Validation Error", 
        description: "Please enter a valid positive quantity",
        variant: "destructive",
      });
      return;
    }

    movementMutation.mutate({
      partId: selectedPartId,
      type,
      quantity: quantityNum,
      reason: reason || null,
    });
  };

  const selectedPart = parts.find(p => p._id === selectedPartId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {type === 'in' ? (
              <ArrowUp className="w-5 h-5 text-green-600" />
            ) : (
              <ArrowDown className="w-5 h-5 text-red-600" />
            )}
            <span>Stock {type === 'in' ? 'In' : 'Out'}</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="part-select">Select Part</Label>
            <Select value={selectedPartId} onValueChange={setSelectedPartId}>
              <SelectTrigger data-testid="select-part">
                <SelectValue placeholder="Choose a part" />
              </SelectTrigger>
              <SelectContent>
                {parts.map((part) => (
                  <SelectItem key={part._id} value={part._id}>
                    {part.name} - {part.partNumber} (Current: {part.quantity})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedPart && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Current Stock:</span> {selectedPart.quantity} units
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Minimum Stock:</span> {selectedPart.minimumStock} units
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              placeholder="Enter quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              data-testid="input-quantity"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason (Optional)</Label>
            <Input
              id="reason"
              placeholder="e.g., Maintenance, Sale, Damaged"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              data-testid="input-reason"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={movementMutation.isPending}
              className={type === 'in' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              data-testid="button-submit"
            >
              {movementMutation.isPending ? 'Processing...' : `Stock ${type === 'in' ? 'In' : 'Out'}`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}