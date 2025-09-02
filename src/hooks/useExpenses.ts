import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Expense } from '../lib/database.types';
import toast from 'react-hot-toast';

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExpenses();
    
    // Subscribe to real-time updates
    const subscription = supabase
      .channel('expenses-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, () => {
        loadExpenses();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadExpenses = async () => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('expense_date', { ascending: false });

      if (error) throw error;
      setExpenses(data || []);
    } catch (error) {
      console.error('Error loading expenses:', error);
      toast.error('Erreur lors du chargement des frais');
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async (expenseData: Omit<Expense, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert(expenseData)
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Frais ajouté avec succès');
      return data;
    } catch (error) {
      console.error('Error adding expense:', error);
      toast.error('Erreur lors de l\'ajout du frais');
      throw error;
    }
  };

  const updateExpense = async (id: string, updates: Partial<Expense>) => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Frais mis à jour');
      return data;
    } catch (error) {
      console.error('Error updating expense:', error);
      toast.error('Erreur lors de la mise à jour');
      throw error;
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Frais supprimé');
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error('Erreur lors de la suppression');
      throw error;
    }
  };

  return {
    expenses,
    loading,
    addExpense,
    updateExpense,
    deleteExpense,
    refresh: loadExpenses,
  };
}