import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Sale } from '../lib/database.types';

export function useSales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSales();
    
    // Subscribe to real-time updates
    const subscription = supabase
      .channel('sales-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sales' }, () => {
        loadSales();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadSales = async () => {
    try {
      const { data, error } = await supabase
        .from('sales')
        .select(`
          *,
          products (
            name,
            category,
            reference
          )
        `)
        .order('sale_date', { ascending: false });

      if (error) throw error;
      setSales(data || []);
    } catch (error) {
      console.error('Error loading sales:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    sales,
    loading,
    refresh: loadSales,
  };
}