import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
im      import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { startOfDay, startOfMonth } from 'date-fns';

interface DashboardData {
  stockByCategory: Record<string, number>;
  totalPurchaseCost: number;
  totalExpenses: number;
  totalInvested: number;
  dailyRevenue: number;
  monthlyRevenue: number;
  totalRevenue: number;
  netProfit: number;
  managerShare: number;
}

export function useDashboard() {
  const [data, setData] = useState<DashboardData>({
    stockByCategory: {},
    totalPurchaseCost: 0,
    totalExpenses: 0,
    totalInvested: 0,
    dailyRevenue: 0,
    monthlyRevenue: 0,
    totalRevenue: 0,
    netProfit: 0,
    managerShare: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    
    // Subscribe to real-time updates
    const salesSubscription = supabase
      .channel('sales-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sales' }, () => {
        loadDashboardData();
      })
      .subscribe();

    const productsSubscription = supabase
      .channel('products-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        loadDashboardData();
      })
      .subscribe();

    const expensesSubscription = supabase
      .channel('expenses-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, () => {
        loadDashboardData();
      })
      .subscribe();

    return () => {
      salesSubscription.unsubscribe();
      productsSubscription.unsubscribe();
      expensesSubscription.unsubscribe();
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      console.log('🔄 Starting dashboard data load...');
      setLoading(true);
      
      // Load products for stock analysis
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*');

      if (productsError) {
        console.error('❌ Error loading products:', productsError);
        return;
      } else {
        console.log('✅ Products loaded:', products?.length || 0);
      }

      // Load sales data
      const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select('*, products(*)');

      if (salesError) {
        console.error('❌ Error loading sales:', salesError);
        return;
      } else {
        console.log('✅ Sales loaded:', sales?.length || 0);
      }

      // Load expenses data (with error handling for permissions)
      console.log('🔍 Loading expenses...');
      let safeExpenses: any[] = [];
      try {
        const { data: expenses, error: expensesError } = await supabase
          .from('expenses')
          .select('*');

        if (expensesError) {
          console.warn('⚠️ Cannot load expenses (permissions):', expensesError.message);
          console.warn('Expenses error details:', expensesError);
        } else {
          safeExpenses = expenses || [];
          console.log('✅ Expenses loaded successfully:', safeExpenses.length, 'expenses');
          console.log('💰 Expenses data:', safeExpenses);
        }
      } catch (expensesErr) {
        console.warn('❌ Expenses access blocked, using 0 for calculations');
        console.error('Expenses catch error:', expensesErr);
      }

      // Utiliser des tableaux vides si les données sont nulles
      const safeProducts = products || [];
      const safeSales = sales || [];

      console.log('Dashboard data loaded:', {
        products: safeProducts.length,
        sales: safeSales.length,
        expenses: safeExpenses.length,
        expensesData: safeExpenses
      });

      // Calculate stock by category
      const stockByCategory = safeProducts.reduce((acc, product) => {
        acc[product.category] = (acc[product.category] || 0) + product.quantity;
        return acc;
      }, {} as Record<string, number>);

      console.log('Stock by category:', stockByCategory);

      // Calculate total purchase cost of current inventory
      const totalPurchaseCost = safeProducts.reduce((sum, product) => 
        sum + (product.purchase_price * product.quantity), 0
      );

      // Calculate total expenses
      const totalExpenses = safeExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      console.log('💰 Total expenses calculated:', totalExpenses, 'from', safeExpenses.length, 'expenses');

      // Calculate total invested (purchase cost + expenses)
      const totalInvested = totalPurchaseCost + totalExpenses;

      // Calculate revenues
      const today = startOfDay(new Date());
      const thisMonth = startOfMonth(new Date());

      const dailyRevenue = safeSales
        .filter(sale => new Date(sale.sale_date) >= today)
        .reduce((sum, sale) => sum + (sale.sale_price * sale.quantity_sold), 0);

      const monthlyRevenue = safeSales
        .filter(sale => new Date(sale.sale_date) >= thisMonth)
        .reduce((sum, sale) => sum + (sale.sale_price * sale.quantity_sold), 0);

      const totalRevenue = safeSales.reduce((sum, sale) => 
        sum + (sale.sale_price * sale.quantity_sold), 0
      );

      // Calculate net profit (total revenue - total invested)
      const netProfit = totalRevenue - totalInvested;

      // Calculate manager share (25% of net profit if positive)
      const managerShare = netProfit > 0 ? netProfit * 0.25 : 0;

      console.log('📊 Final calculations:', {
        totalRevenue,
        totalPurchaseCost,
        totalExpenses,
        totalInvested,
        netProfit,
        managerShare
      });

      setData({
        stockByCategory,
        totalPurchaseCost,
        totalExpenses,
        totalInvested,
        dailyRevenue,
        monthlyRevenue,
        totalRevenue,
        netProfit,
        managerShare,
      });
    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, refresh: loadDashboardData };
}, startOfMonth } from 'date-fns';

interface DashboardData {
  stockByCategory: Record<string, number>;
  totalPurchaseCost: number;
  totalExpenses: number;
  totalInvested: number;
  dailyRevenue: number;
  monthlyRevenue: number;
  totalRevenue: number;
  netProfit: number;
  managerShare: number;
}

export function useDashboard() {
  const [data, setData] = useState<DashboardData>({
    stockByCategory: {},
    totalPurchaseCost: 0,
    totalExpenses: 0,
    totalInvested: 0,
    dailyRevenue: 0,
    monthlyRevenue: 0,
    totalRevenue: 0,
    netProfit: 0,
    managerShare: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    
    // Subscribe to real-time updates
    const salesSubscription = supabase
      .channel('sales-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sales' }, () => {
        loadDashboardData();
      })
      .subscribe();

    const productsSubscription = supabase
      .channel('products-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        loadDashboardData();
      })
      .subscribe();

    const expensesSubscription = supabase
      .channel('expenses-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, () => {
        loadDashboardData();
      })
      .subscribe();

    return () => {
      salesSubscription.unsubscribe();
      productsSubscription.unsubscribe();
      expensesSubscription.unsubscribe();
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      console.log('🔄 Starting dashboard data load...');
      setLoading(true);
      
      // Load products for stock analysis
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*');

      if (productsError) {
        console.error('❌ Error loading products:', productsError);
        return;
      } else {
        console.log('✅ Products loaded:', products?.length || 0);
      }

      // Load sales data
      const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select('*, products(*)');

      if (salesError) {
        console.error('❌ Error loading sales:', salesError);
        return;
      } else {
        console.log('✅ Sales loaded:', sales?.length || 0);
      }

      // Load expenses data (with error handling for permissions)
      let safeExpenses: any[] = [];
      try {
        const { data: expenses, error: expensesError } = await supabase
          .from('expenses')
          .select('*');

        if (expensesError) {
          console.warn('Cannot load expenses (permissions):', expensesError.message);
          console.warn('Expenses error details:', expensesError);
        } else {
          safeExpenses = expenses || [];
          console.log('Expenses loaded successfully:', safeExpenses);
        }
      } catch (expensesErr) {
        console.warn('Expenses access blocked, using 0 for calculations');
      }

      // Utiliser des tableaux vides si les données sont nulles
      const safeProducts = products || [];
      const safeSales = sales || [];

      console.log('Dashboard data loaded:', {
        products: safeProducts.length,
        sales: safeSales.length,
        expenses: safeExpenses.length,
        expensesData: safeExpenses
      });

      // Calculate stock by category
      const stockByCategory = safeProducts.reduce((acc, product) => {
        acc[product.category] = (acc[product.category] || 0) + product.quantity;
        return acc;
      }, {} as Record<string, number>);

      console.log('Stock by category:', stockByCategory);

      // Calculate total purchase cost of current inventory
      const totalPurchaseCost = safeProducts.reduce((sum, product) => 
        sum + (product.purchase_price * product.quantity), 0
      );

      // Calculate total expenses
      const totalExpenses = safeExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      console.log('Total expenses calculated:', totalExpenses, 'from', safeExpenses.length, 'expenses');

      // Calculate total invested (purchase cost + expenses)
      const totalInvested = totalPurchaseCost + totalExpenses;

      // Calculate revenues
      const today = startOfDay(new Date());
      const thisMonth = startOfMonth(new Date());

      const dailyRevenue = safeSales
        .filter(sale => new Date(sale.sale_date) >= today)
        .reduce((sum, sale) => sum + (sale.sale_price * sale.quantity_sold), 0);

      const monthlyRevenue = safeSales
        .filter(sale => new Date(sale.sale_date) >= thisMonth)
        .reduce((sum, sale) => sum + (sale.sale_price * sale.quantity_sold), 0);

      const totalRevenue = safeSales.reduce((sum, sale) => 
        sum + (sale.sale_price * sale.quantity_sold), 0
      );

      // Calculate net profit (total revenue - total invested)
      const netProfit = totalRevenue - totalInvested;

      // Calculate manager share (25% of net profit if positive)
      const managerShare = netProfit > 0 ? netProfit * 0.25 : 0;

      setData({
        stockByCategory,
        totalPurchaseCost,
        totalExpenses,
        totalInvested,
        dailyRevenue,
        monthlyRevenue,
        totalRevenue,
        netProfit,
        managerShare,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, refresh: loadDashboardData };
}