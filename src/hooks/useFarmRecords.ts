import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface FarmRecord {
  id: string;
  record_date: string;
  category: 'expense' | 'capital' | 'sale' | 'profit';
  subcategory?: string;
  description: string;
  quantity?: number;
  unit?: string;
  unit_price?: number;
  total_amount: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface NewFarmRecord {
  record_date: string;
  category: 'expense' | 'capital' | 'sale' | 'profit';
  subcategory?: string;
  description: string;
  quantity?: number;
  unit?: string;
  unit_price?: number;
  total_amount: number;
  notes?: string;
}

export function useFarmRecords() {
  const [records, setRecords] = useState<FarmRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchRecords = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('farm_records')
      .select('*')
      .order('record_date', { ascending: false });
    
    if (error) {
      console.error('Error fetching records:', error);
    } else {
      setRecords((data as FarmRecord[]) || []);
    }
    setLoading(false);
  };

  const addRecord = async (record: NewFarmRecord) => {
    if (!user) return { error: new Error('User not authenticated') };
    
    const { data, error } = await supabase
      .from('farm_records')
      .insert([{ ...record, user_id: user.id }])
      .select()
      .single();
    
    if (!error && data) {
      setRecords(prev => [data as FarmRecord, ...prev]);
    }
    
    return { data, error };
  };

  const updateRecord = async (id: string, updates: Partial<NewFarmRecord>) => {
    const { data, error } = await supabase
      .from('farm_records')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (!error && data) {
      setRecords(prev => prev.map(r => r.id === id ? data as FarmRecord : r));
    }
    
    return { data, error };
  };

  const deleteRecord = async (id: string) => {
    const { error } = await supabase
      .from('farm_records')
      .delete()
      .eq('id', id);
    
    if (!error) {
      setRecords(prev => prev.filter(r => r.id !== id));
    }
    
    return { error };
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Category', 'Subcategory', 'Description', 'Quantity', 'Unit', 'Unit Price', 'Total Amount', 'Notes'];
    const csvContent = [
      headers.join(','),
      ...records.map(record => [
        record.record_date,
        record.category,
        record.subcategory || '',
        `"${record.description}"`,
        record.quantity || '',
        record.unit || '',
        record.unit_price || '',
        record.total_amount,
        `"${record.notes || ''}"`
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `kasafarm-records-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    fetchRecords();
  }, [user]);

  return {
    records,
    loading,
    addRecord,
    updateRecord,
    deleteRecord,
    exportToCSV,
    refetch: fetchRecords
  };
}