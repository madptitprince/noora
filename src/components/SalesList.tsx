import { useState } from 'react';
import { Calendar, ShoppingCart, TrendingUp, Filter } from 'lucide-react';
import { useSales } from '../hooks/useSales';
import { format, startOfDay, startOfWeek, startOfMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatCFA } from '../lib/currency';

export function SalesList() {
  const { sales, loading } = useSales();
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  const filterSalesByDate = (sales: any[]) => {
    const now = new Date();
    switch (dateFilter) {
      case 'today':
        return sales.filter(sale => new Date(sale.sale_date) >= startOfDay(now));
      case 'week':
        return sales.filter(sale => new Date(sale.sale_date) >= startOfWeek(now, { weekStartsOn: 1 }));
      case 'month':
        return sales.filter(sale => new Date(sale.sale_date) >= startOfMonth(now));
      default:
        return sales;
    }
  };

  const filteredSales = filterSalesByDate(sales);
  
  const totalRevenue = filteredSales.reduce((sum, sale) => 
    sum + (sale.sale_price * sale.quantity_sold), 0
  );

  const filterLabels = {
    all: 'Toutes les ventes',
    today: 'Aujourd\'hui',
    week: 'Cette semaine',
    month: 'Ce mois',
  } as const;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Historique des ventes</h1>
          <p className="text-gray-600 mt-1">{filteredSales.length} ventes • {formatCFA(totalRevenue)} de chiffre d'affaires</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-gray-400" />
          <div className="flex flex-wrap gap-2">
            {Object.entries(filterLabels).map(([key, label]) => {
              const active = dateFilter === (key as typeof dateFilter);
              return (
                <button
                  key={key}
                  onClick={() => setDateFilter(key as any)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 border ${
                    active
                      ? 'bg-brand-gold text-black border-brand-gold shadow-sm'
                      : 'text-gray-700 hover:bg-brand-gray-50 hover:text-black border-gray-200'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sales Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-2.5 bg-brand-gray-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-brand-gold" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Chiffre d'affaires</p>
              <p className="text-2xl font-bold text-gray-900">{formatCFA(totalRevenue)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-2.5 bg-brand-gray-100 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-brand-gold" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Nombre de ventes</p>
              <p className="text-2xl font-bold text-gray-900">{filteredSales.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-2.5 bg-brand-gray-100 rounded-lg">
              <Calendar className="w-6 h-6 text-brand-gold" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Panier moyen</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredSales.length > 0 ? formatCFA(totalRevenue / filteredSales.length) : formatCFA(0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sales List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Détail des ventes</h2>
        </div>
        
        {filteredSales.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredSales.map((sale: any) => (
              <div key={sale.id} className="px-4 py-3 sm:px-6 sm:py-4 hover:bg-gray-50 transition-colors duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-brand-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                      {sale.products?.image_url ? (
                        <img
                          src={sale.products.image_url}
                          alt={sale.products?.name || 'Produit'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ShoppingCart className="w-5 h-5 md:w-6 md:h-6 text-brand-gold" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{sale.products?.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="bg-brand-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs">
                          {sale.products?.reference}
                        </span>
                        <span>•</span>
                        <span className="capitalize">{sale.products?.category}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-brand-gold">
                      {formatCFA(sale.sale_price * sale.quantity_sold)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(sale.sale_date), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune vente trouvée</h3>
            <p className="text-gray-600">
              {dateFilter !== 'all' 
                ? 'Aucune vente pour la période sélectionnée'
                : 'Les ventes apparaîtront ici une fois enregistrées'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}