import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { NewFarmRecord } from '@/hooks/useFarmRecords';

interface RecordFormProps {
  onSubmit: (record: NewFarmRecord) => Promise<{ error: any }>;
  onClose: () => void;
  initialData?: Partial<NewFarmRecord>;
}

export function RecordForm({ onSubmit, onClose, initialData }: RecordFormProps) {
  const [formData, setFormData] = useState<NewFarmRecord>({
    record_date: initialData?.record_date || new Date().toISOString().split('T')[0],
    category: initialData?.category || 'expense',
    subcategory: initialData?.subcategory || '',
    description: initialData?.description || '',
    quantity: initialData?.quantity || undefined,
    unit: initialData?.unit || '',
    unit_price: initialData?.unit_price || undefined,
    total_amount: initialData?.total_amount || 0,
    notes: initialData?.notes || '',
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description || formData.total_amount <= 0) {
      toast({
        title: "Error",
        description: "Please fill in required fields (description and total amount)",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    const { error } = await onSubmit(formData);
    
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Record saved successfully!"
      });
      onClose();
    }
    setLoading(false);
  };

  const updateField = (field: keyof NewFarmRecord, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-calculate total amount if quantity and unit_price are provided
    if (field === 'quantity' || field === 'unit_price') {
      const quantity = field === 'quantity' ? value : formData.quantity;
      const unitPrice = field === 'unit_price' ? value : formData.unit_price;
      
      if (quantity && unitPrice) {
        setFormData(prev => ({ ...prev, total_amount: quantity * unitPrice }));
      }
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Record' : 'Add New Record'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.record_date}
                onChange={(e) => updateField('record_date', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={formData.category} onValueChange={(value) => updateField('category', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="capital">Capital</SelectItem>
                  <SelectItem value="sale">Sale</SelectItem>
                  <SelectItem value="profit">Profit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subcategory">Subcategory</Label>
            <Input
              id="subcategory"
              placeholder="e.g., Feed, Equipment, Eggs, etc."
              value={formData.subcategory}
              onChange={(e) => updateField('subcategory', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Input
              id="description"
              placeholder="Brief description of the record"
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                step="0.01"
                placeholder="0"
                value={formData.quantity || ''}
                onChange={(e) => updateField('quantity', e.target.value ? parseFloat(e.target.value) : undefined)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Input
                id="unit"
                placeholder="kg, pcs, etc."
                value={formData.unit}
                onChange={(e) => updateField('unit', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="unit_price">Unit Price</Label>
              <Input
                id="unit_price"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.unit_price || ''}
                onChange={(e) => updateField('unit_price', e.target.value ? parseFloat(e.target.value) : undefined)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="total">Total Amount *</Label>
            <Input
              id="total"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.total_amount}
              onChange={(e) => updateField('total_amount', parseFloat(e.target.value) || 0)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes..."
              value={formData.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              rows={2}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Saving...' : (initialData ? 'Update' : 'Save')}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}