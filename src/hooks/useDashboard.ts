import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { startOfDay, startOfMonth } from 'date-fns';

interface DashboardData {
  stockByCategory: Record<string, number>;
  totalPurchaseCost: number; // coût du stock restant
  totalExpenses: number; // frais opérationnels
  totalInvested: number; // courant = stock restant + frais
  totalInvestedCumulative: number; // cumulé = stock restant + stock vendu (COGS) + frais
  costOfSoldStock: number; // COGS = coût d'achat des articles vendus
  dailyRevenue: number;
  monthlyRevenue: number;
  totalRevenue: number;
  netProfit: number; // CA - COGS - Frais
  managerShare: number;
  // Prévisions
  potentialRevenueFromStock: number; // prix de vente du stock restant
  forecastTotalRevenue: number; // déjà vendu + potentiel
}

export function useDashboard() {
  const [data, setData] = useState<DashboardData>({
    stockByCategory: {},
    totalPurchaseCost: 0,
    totalExpenses: 0,
    totalInvested: 0,
    totalInvestedCumulative: 0,
    costOfSoldStock: 0,
    dailyRevenue: 0,
    monthlyRevenue: 0,
    totalRevenue: 0,
    netProfit: 0,
    managerShare: 0,
    potentialRevenueFromStock: 0,
    forecastTotalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      if (isMounted) {
        await loadDashboardData();
      }
    };
    
    loadData();
    
    // Subscribe to real-time updates
    const salesSubscription = supabase
      .channel('sales-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sales' }, () => {
        if (isMounted) loadDashboardData();
      })
      .subscribe();

    const productsSubscription = supabase
      .channel('products-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        if (isMounted) loadDashboardData();
      })
      .subscribe();

    const expensesSubscription = supabase
      .channel('expenses-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, () => {
        if (isMounted) loadDashboardData();
      })
      .subscribe();

    return () => {
      isMounted = false;
      salesSubscription.unsubscribe();
      productsSubscription.unsubscribe();
      expensesSubscription.unsubscribe();
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load products for stock analysis
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*');

      if (productsError) {
        console.error('❌ Error loading products:', productsError);
        return;
      }

      // Load sales data (include product purchase price)
      const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select('*, products(*)');

      if (salesError) {
        console.error('❌ Error loading sales:', salesError);
        return;
      }

      // Load expenses data (with error handling for permissions)
      let safeExpenses: any[] = [];
      try {
        const { data: expenses, error: expensesError } = await supabase
          .from('expenses')
          .select('*');

        if (expensesError) {
          console.warn('⚠️ Cannot load expenses:', expensesError.message);
        } else {
          safeExpenses = expenses || [];
        }
      } catch (expensesErr) {
        console.warn('❌ Expenses access blocked, using 0 for calculations');
      }

      const safeProducts = products || [];
      const safeSales = sales || [];

      // Calculate stock by category
      const stockByCategory = safeProducts.reduce((acc, product) => {
        acc[product.category] = (acc[product.category] || 0) + product.quantity;
        return acc;
      }, {} as Record<string, number>);

      // Cost of remaining inventory (current stock)
      const totalPurchaseCost = safeProducts.reduce((sum, product) => 
        sum + (product.purchase_price * product.quantity), 0
      );

      // Operating expenses (frais)
      const totalExpenses = safeExpenses.reduce((sum, expense) => sum + expense.amount, 0);

      // Revenues
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

      // COGS: cost of goods sold based on product purchase price at time (approx using current value)
      const costOfSoldStock = safeSales.reduce((sum, sale: any) => 
        sum + ((sale.products?.purchase_price || 0) * sale.quantity_sold), 0
      );

      // Forecasts
      const potentialRevenueFromStock = safeProducts.reduce((sum, product) => 
        sum + (product.selling_price * product.quantity), 0
      );
      const forecastTotalRevenue = totalRevenue + potentialRevenueFromStock;

      // Invested metrics
      const totalInvestedCurrent = totalPurchaseCost + totalExpenses; // remaining stock + expenses
      const totalInvestedCumulative = totalPurchaseCost + costOfSoldStock + totalExpenses; // stable over time

      // Profit: revenue - COGS - expenses
      const netProfit = totalRevenue - costOfSoldStock - totalExpenses;

      // Manager share (25% if profit positive)
      const managerShare = netProfit > 0 ? netProfit * 0.25 : 0;

      setData({
        stockByCategory,
        totalPurchaseCost,
        totalExpenses,
        totalInvested: totalInvestedCurrent,
        totalInvestedCumulative,
        costOfSoldStock,
        dailyRevenue,
        monthlyRevenue,
        totalRevenue,
        netProfit,
        managerShare,
        potentialRevenueFromStock,
        forecastTotalRevenue,
      });
    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, refresh: loadDashboardData };
}
