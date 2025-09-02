// Types temporaires pour contourner les problèmes de génération Supabase
import { supabase } from '../lib/supabase';

// Helper pour les requêtes avec typage correct
export const supabaseHelpers = {
  // Products
  async insertProduct(data: any) {
    return supabase.from('products').insert(data).select().single();
  },

  async updateProduct(id: string, data: any) {
    return supabase.from('products').update(data).eq('id', id).select().single();
  },

  async deleteProduct(id: string) {
    return supabase.from('products').delete().eq('id', id);
  },

  async selectProducts() {
    return supabase.from('products').select('*').order('created_at', { ascending: false });
  },

  // Sales
  async insertSale(data: any) {
    return supabase.from('sales').insert(data).select().single();
  },

  async selectSales() {
    return supabase.from('sales').select(`
      *,
      products (
        name,
        category,
        reference
      )
    `).order('sale_date', { ascending: false });
  },

  // Expenses
  async insertExpense(data: any) {
    return supabase.from('expenses').insert(data).select().single();
  },

  async updateExpense(id: string, data: any) {
    return supabase.from('expenses').update(data).eq('id', id).select().single();
  },

  async deleteExpense(id: string) {
    return supabase.from('expenses').delete().eq('id', id);
  },

  async selectExpenses() {
    return supabase.from('expenses').select('*').order('expense_date', { ascending: false });
  },

  // User Profiles
  async insertUserProfile(data: any) {
    return supabase.from('user_profiles').insert(data);
  },

  async selectUserProfile(id: string) {
    return supabase.from('user_profiles').select('*').eq('id', id).single();
  }
};
