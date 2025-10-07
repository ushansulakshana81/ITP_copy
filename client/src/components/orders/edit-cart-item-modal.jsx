import { useState, useEffect } from "react";
import { Button } from "../ui/button.jsx";
import { Input } from "../ui/input.jsx";
import { Label } from "../ui/label.jsx";
import { Textarea } from "../ui/textarea.jsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog.jsx";
import { Edit, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "../ui/alert.jsx";

export default function EditCartItemModal({ 
  isOpen, 
  onClose, 
  item, 
  onUpdate 
}) {
  const [quantity, setQuantity] = useState(1);
  const [requestedBy, setRequestedBy] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form with item data
  useEffect(() => {
    if (item) {
      setQuantity(item.quantity || 1);
      setRequestedBy(item.requestedBy || "");
      setNotes(item.notes || "");
    }
  }, [item]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Validation
    if (!requestedBy.trim()) {
      setError("Requested by field is required");
      setIsLoading(false);
      return;
    }

    if (quantity < 1) {
      setError("Quantity must be at least 1");
      setIsLoading(false);
      return;
    }

    if (quantity > (item.part?.quantity || 0)) {
      setError(`Quantity cannot exceed available stock (${item.part?.quantity || 0})`);
      setIsLoading(false);
      return;
    }

    try {
      const updatedItem = {
        ...item,
        quantity: parseInt(quantity),
        requestedBy: requestedBy.trim(),
        notes: notes.trim()
      };

      await onUpdate(updatedItem);
    } catch (error) {
      setError(error.message || "Failed to update item");
    } finally {
      setIsLoading(false);
    }
  };

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5" />
            Edit Cart Item
          </DialogTitle>
          <DialogDescription>
            Update the details for this cart item.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Part Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-sm text-gray-900 mb-2">Part Details</h4>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">Name:</span> {item.part?.name || 'N/A'}</p>
              <p><span className="font-medium">Part Number:</span> {item.part?.partNumber || 'N/A'}</p>
              <p><span className="font-medium">Available Stock:</span> {item.part?.quantity || 0} units</p>
              <p><span className="font-medium">Unit Price:</span> ${item.part?.unitPrice || 0}</p>
            </div>
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity *</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max={item.part?.quantity || 0}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              required
            />
            <p className="text-xs text-gray-500">
              Available stock: {item.part?.quantity || 0} units
            </p>
          </div>

          {/* Requested By */}
          <div className="space-y-2">
            <Label htmlFor="requestedBy">Requested By *</Label>
            <Input
              id="requestedBy"
              value={requestedBy}
              onChange={(e) => setRequestedBy(e.target.value)}
              placeholder="Enter requester name"
              required
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes for this request"
              rows={3}
            />
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Total Value Display */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm font-medium text-blue-900">
              Total Value: ${((item.part?.unitPrice || 0) * quantity).toFixed(2)}
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
