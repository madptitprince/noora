import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { RefreshCw, Database, Users, Package, ShoppingCart, DollarSign } from 'lucide-react';

export function DataDebugger() {
  const { user, profile, isOwner } = useAuth();
  const [debugData, setDebugData] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const checkData = async () => {
    setLoading(true);
    try {
      // Test de connexion
      const { error: connectionError } = await supabase
        .from('user_profiles')
        .select('count')
        .limit(1);

      // Compter les données
      const [productsResult, salesResult, expensesResult, profilesResult] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact' }),
        supabase.from('sales').select('*', { count: 'exact' }),
        supabase.from('expenses').select('*', { count: 'exact' }),
        supabase.from('user_profiles').select('*', { count: 'exact' })
      ]);

      setDebugData({
        connection: connectionError ? 'Erreur' : 'OK',
        connectionError,
        user: user ? {
          id: user.id,
          email: user.email,
          role: user.role
        } : null,
        profile: profile ? {
          id: profile.id,
          email: profile.email,
          role: profile.role
        } : null,
        isOwner,
        counts: {
          products: productsResult.count || 0,
          sales: salesResult.count || 0,
          expenses: expensesResult.count || 0,
          profiles: profilesResult.count || 0
        },
        errors: {
          products: productsResult.error?.message,
          sales: salesResult.error?.message,
          expenses: expensesResult.error?.message,
          profiles: profilesResult.error?.message
        },
        sampleData: {
          products: productsResult.data?.slice(0, 2),
          sales: salesResult.data?.slice(0, 2),
          expenses: expensesResult.data?.slice(0, 2)
        }
      });
    } catch (error) {
      console.error('Debug error:', error);
      setDebugData({ globalError: error });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkData();
  }, [user]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <Database className="w-5 h-5 mr-2" />
          Debug des données
        </h2>
        <button
          onClick={checkData}
          disabled={loading}
          className="flex items-center px-3 py-2 text-sm bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>

      <div className="space-y-4">
        {/* Connexion */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Connexion DB</h3>
            <p className={`text-sm ${debugData.connection === 'OK' ? 'text-green-600' : 'text-red-600'}`}>
              {debugData.connection}
            </p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Utilisateur</h3>
            <p className="text-sm text-gray-600">
              {user ? `${user.email} (${isOwner ? 'Propriétaire' : 'Gérante'})` : 'Non connecté'}
            </p>
          </div>
        </div>

        {/* Compteurs */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Produits', count: debugData.counts?.products, icon: Package, error: debugData.errors?.products },
            { label: 'Ventes', count: debugData.counts?.sales, icon: ShoppingCart, error: debugData.errors?.sales },
            { label: 'Frais', count: debugData.counts?.expenses, icon: DollarSign, error: debugData.errors?.expenses },
            { label: 'Profils', count: debugData.counts?.profiles, icon: Users, error: debugData.errors?.profiles }
          ].map((item, index) => (
            <div key={index} className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center mb-2">
                <item.icon className="w-4 h-4 mr-2 text-gray-500" />
                <h3 className="font-medium text-gray-900 text-sm">{item.label}</h3>
              </div>
              <p className={`text-lg font-bold ${item.error ? 'text-red-600' : 'text-green-600'}`}>
                {item.error ? 'Erreur' : item.count || 0}
              </p>
              {item.error && (
                <p className="text-xs text-red-500 mt-1">{item.error}</p>
              )}
            </div>
          ))}
        </div>

        {/* Erreurs */}
        {debugData.globalError && (
          <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
            <h3 className="font-medium text-red-900 mb-2">Erreur globale</h3>
            <pre className="text-xs text-red-700 overflow-auto">
              {JSON.stringify(debugData.globalError, null, 2)}
            </pre>
          </div>
        )}

        {/* Données d'exemple */}
        {debugData.sampleData && (
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Échantillons de données</h3>
            <div className="text-xs text-blue-700 space-y-2">
              {debugData.sampleData.products?.length > 0 && (
                <div>
                  <strong>Produits:</strong> {debugData.sampleData.products.map((p: any) => p.name).join(', ')}
                </div>
              )}
              {debugData.sampleData.sales?.length > 0 && (
                <div>
                  <strong>Ventes:</strong> {debugData.sampleData.sales.length} ventes récentes
                </div>
              )}
              {debugData.sampleData.expenses?.length > 0 && (
                <div>
                  <strong>Frais:</strong> {debugData.sampleData.expenses.length} frais récents
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
