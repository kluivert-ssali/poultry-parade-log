import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { FarmRecord, NewFarmRecord } from '@/hooks/useFarmRecords';
import { RecordForm } from './RecordForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface RecordsTableProps {
  records: FarmRecord[];
  onEdit: (id: string, updates: Partial<NewFarmRecord>) => Promise<{ error: any }>;
  onDelete: (id: string) => Promise<{ error: any }>;
}

export function RecordsTable({ records, onEdit, onDelete }: RecordsTableProps) {
  const [editingRecord, setEditingRecord] = useState<FarmRecord | null>(null);
  const [deletingRecord, setDeletingRecord] = useState<FarmRecord | null>(null);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'expense': return 'destructive';
      case 'capital': return 'default';
      case 'sale': return 'secondary';
      case 'profit': return 'outline';
      default: return 'default';
    }
  };

  const handleEdit = async (updates: NewFarmRecord) => {
    if (!editingRecord) return { error: new Error('No record selected') };
    
    const { error } = await onEdit(editingRecord.id, updates);
    if (!error) {
      setEditingRecord(null);
    }
    return { error };
  };

  const handleDelete = async () => {
    if (!deletingRecord) return;
    
    await onDelete(deletingRecord.id);
    setDeletingRecord(null);
  };

  if (records.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No records found. Add your first farm record to get started.
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => (
            <TableRow key={record.id}>
              <TableCell>
                {format(new Date(record.record_date), 'MMM dd, yyyy')}
              </TableCell>
              <TableCell>
                <Badge variant={getCategoryColor(record.category)}>
                  {record.category}
                </Badge>
                {record.subcategory && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {record.subcategory}
                  </div>
                )}
              </TableCell>
              <TableCell>
                <div>{record.description}</div>
                {record.notes && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {record.notes}
                  </div>
                )}
              </TableCell>
              <TableCell>
                {record.quantity && record.unit ? (
                  <div>
                    {record.quantity} {record.unit}
                    {record.unit_price && (
                      <div className="text-xs text-muted-foreground">
                        @ ${record.unit_price}
                      </div>
                    )}
                  </div>
                ) : '-'}
              </TableCell>
              <TableCell className="font-medium">
                ${record.total_amount.toLocaleString()}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingRecord(record)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeletingRecord(record)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {editingRecord && (
        <RecordForm
          onSubmit={handleEdit}
          onClose={() => setEditingRecord(null)}
          initialData={editingRecord}
        />
      )}

      <AlertDialog open={!!deletingRecord} onOpenChange={() => setDeletingRecord(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this record? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}