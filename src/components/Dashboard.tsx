import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFarmRecords } from '@/hooks/useFarmRecords';
import { RecordForm } from './RecordForm';
import { RecordsTable } from './RecordsTable';
import { Plus, Download, TrendingUp, TrendingDown, DollarSign, Building } from 'lucide-react';
import { format } from 'date-fns';

export function Dashboard() {
  const { records, loading, addRecord, updateRecord, deleteRecord, exportToCSV } = useFarmRecords();
  const [showForm, setShowForm] = useState(false);

  // Calculate totals by category
  const totals = records.reduce((acc, record) => {
    acc[record.category] = (acc[record.category] || 0) + record.total_amount;
    return acc;
  }, {} as Record<string, number>);

  const totalExpenses = totals.expense || 0;
  const totalCapital = totals.capital || 0;
  const totalSales = totals.sale || 0;
  const totalProfits = totals.profit || 0;

  const netProfit = totalSales + totalProfits - totalExpenses;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Farm Records Dashboard</h1>
          <p className="text-muted-foreground">Track your poultry farm expenses, capital, sales, and profits</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Record
          </Button>
          <Button variant="outline" onClick={exportToCSV} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              ${totalExpenses.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Capital Investment</CardTitle>
            <Building className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              ${totalCapital.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${totalSales.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <DollarSign className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-destructive'}`}>
              ${netProfit.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Records */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Records</CardTitle>
        </CardHeader>
        <CardContent>
          <RecordsTable 
            records={records} 
            onEdit={updateRecord}
            onDelete={deleteRecord}
          />
        </CardContent>
      </Card>

      {showForm && (
        <RecordForm
          onSubmit={addRecord}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}