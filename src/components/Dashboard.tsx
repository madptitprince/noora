import { 
  Package, 
  TrendingUp, 
  DollarSign, 
  Wallet,
  Eye,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useDashboard } from '../hooks/useDashboard';
import { useAuth } from '../hooks/useAuth';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatCFA } from '../lib/currency';

export function Dashboard() {
  const { data, loading } = useDashboard();
  const { isOwner } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Chiffre d\'affaires total',
      value: formatCFA(data.totalRevenue || 0),
      icon: TrendingUp,
      color: 'bg-green-500',
      change: `+${formatCFA(data.monthlyRevenue || 0)} ce mois`,
      changeType: 'positive' as const,
    },
    {
      title: 'Bénéfice net',
      value: formatCFA(data.netProfit || 0),
      icon: DollarSign,
      color: (data.netProfit || 0) >= 0 ? 'bg-emerald-500' : 'bg-red-500',
      change: `${formatCFA(data.dailyRevenue || 0)} aujourd'hui`,
      changeType: (data.netProfit || 0) >= 0 ? 'positive' as const : 'negative' as const,
    },
    {
      title: 'Frais',
      value: formatCFA(data.totalExpenses || 0),
      icon: ArrowDownRight,
      color: 'bg-red-500',
      change: 'Total des dépenses opérationnelles',
      changeType: 'neutral' as const,
    },
    {
      title: 'Part gérante (25%)',
      value: formatCFA(data.managerShare || 0),
      icon: Wallet,
      color: 'bg-purple-500',
      change: 'Calculé automatiquement',
      changeType: 'neutral' as const,
    },
    {
      title: 'Dépenses totales investies',
      value: formatCFA(data.totalInvestedCumulative || 0),
      icon: Eye,
      color: 'bg-blue-600',
      change: 'Stock acheté (vendu + restant) + Frais',
      changeType: 'neutral' as const,
    },
    ...(isOwner ? [{
      title: 'Investi (courant)',
      value: formatCFA((data.totalPurchaseCost || 0) + (data.totalExpenses || 0)),
      icon: Eye,
      color: 'bg-blue-500',
      change: `Stock restant: ${formatCFA(data.totalPurchaseCost || 0)} + Frais: ${formatCFA(data.totalExpenses || 0)}`,
      changeType: 'neutral' as const,
    }] : []),
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-600 mt-1">
            {format(new Date(), 'EEEE d MMMM yyyy', { locale: fr })}
          </p>
        </div>
        <div className="bg-white rounded-lg p-3 shadow-sm border border-pink-100">
          <Calendar className="w-6 h-6 text-pink-500" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-pink-100 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              {stat.changeType === 'positive' && <ArrowUpRight className="w-5 h-5 text-green-500" />}
              {stat.changeType === 'negative' && <ArrowDownRight className="w-5 h-5 text-red-500" />}
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">{stat.title}</h3>
            <p className="text-2xl font-bold text-gray-900 mb-2">{stat.value}</p>
            <p className={`text-xs ${
              stat.changeType === 'positive' ? 'text-green-600' :
              stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-500'
            }`}>
              {stat.change}
            </p>
          </div>
        ))}
      </div>

      {/* Stock by Category */}
      <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <Package className="w-6 h-6 mr-2 text-pink-500" />
          Stock par catégorie
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(data.stockByCategory).map(([category, quantity]) => {
            const categoryLabels = {
              lunettes: 'Lunettes',
              bagues: 'Bagues',
              colliers: 'Colliers',
              sets: 'Sets',
              bracelets: 'Bracelets',
            };

            const categoryColors = {
              lunettes: 'from-blue-400 to-blue-600',
              bagues: 'from-yellow-400 to-yellow-600',
              colliers: 'from-green-400 to-green-600',
              sets: 'from-purple-400 to-purple-600',
              bracelets: 'from-pink-400 to-pink-600',
            };

            return (
              <div
                key={category}
                className="text-center p-4 rounded-lg bg-gradient-to-br border border-gray-100 hover:shadow-md transition-all duration-200"
              >
                <div className={`w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-r ${categoryColors[category as keyof typeof categoryColors]} flex items-center justify-center`}>
                  <Package className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">
                  {categoryLabels[category as keyof typeof categoryLabels]}
                </h3>
                <p className="text-2xl font-bold text-gray-900">{quantity}</p>
                <p className="text-xs text-gray-500">en stock</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Résumé financier</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Chiffre d'affaires</span>
              <span className="font-semibold text-green-600">+{formatCFA(data.totalRevenue || 0)}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Frais</span>
              <span className="font-semibold text-red-600">-{formatCFA(data.totalExpenses || 0)}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Coût des stocks restants</span>
              <span className="font-semibold text-gray-800">{formatCFA(data.totalPurchaseCost || 0)}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Dépenses totales investies</span>
              <span className="font-semibold text-gray-900">{formatCFA(data.totalInvestedCumulative || 0)}</span>
            </div>
            <div className="border-t border-gray-200 pt-2">
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-900 font-medium">Bénéfice net</span>
                <span className={`font-bold text-lg ${(data.netProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {(data.netProfit || 0) >= 0 ? '+' : ''}{formatCFA(data.netProfit || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-purple-600 font-medium">Part gérante</span>
                <span className="font-bold text-purple-600">
                  {formatCFA(data.managerShare || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Prévision (CA déjà vendu + potentiel stock)</span>
                <span className="font-semibold text-gray-900">{formatCFA(data.forecastTotalRevenue || 0)}</span>
              </div>
              {isOwner && (
                <div className="text-xs text-gray-500">
                  <span>dont Potentiel stock: {formatCFA(data.potentialRevenueFromStock || 0)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance</h3>
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Aujourd'hui</p>
                  <p className="text-lg font-bold text-green-700">{formatCFA(data.dailyRevenue || 0)}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Ce mois</p>
                  <p className="text-lg font-bold text-blue-700">{formatCFA(data.monthlyRevenue || 0)}</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}