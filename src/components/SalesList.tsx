import React, { useState } from 'react';
import { Calendar, ShoppingCart, TrendingUp, Filter } from 'lucide-react';
import { useSales } from '../hooks/useSales';
import { format, startOfDay, startOfWeek, startOfMonth } from 'date-fns';
import { fr } from 'date-fns/locale';

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
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Historique des ventes</h1>
          <p className="text-gray-600 mt-1">{filteredSales.length} ventes • {totalRevenue.toFixed(2)} € de chiffre d'affaires</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-6">
        <div className="flex items-center space-x-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <div className="flex space-x-2">
            {Object.entries(filterLabels).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setDateFilter(key as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  dateFilter === key
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-pink-50 hover:text-pink-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sales Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Chiffre d'affaires</p>
              <p className="text-2xl font-bold text-green-600">{totalRevenue.toFixed(2)} €</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Nombre de ventes</p>
              <p className="text-2xl font-bold text-blue-600">{filteredSales.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Panier moyen</p>
              <p className="text-2xl font-bold text-purple-600">
                {filteredSales.length > 0 ? (totalRevenue / filteredSales.length).toFixed(2) : '0.00'} €
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sales List */}
      <div className="bg-white rounded-xl shadow-sm border border-pink-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Détail des ventes</h2>
        </div>
        
        {filteredSales.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredSales.map((sale: any) => (
              <div key={sale.id} className="px-6 py-4 hover:bg-gray-50 transition-colors duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-pink-100 to-purple-100 rounded-lg flex items-center justify-center">
                      <ShoppingCart className="w-6 h-6 text-pink-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{sale.products?.name}</h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span className="bg-pink-100 text-pink-700 px-2 py-1 rounded-full text-xs">
                          {sale.products?.reference}
                        </span>
                        <span>•</span>
                        <span className="capitalize">{sale.products?.category}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">
                      {(sale.sale_price * sale.quantity_sold).toFixed(2)} €
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