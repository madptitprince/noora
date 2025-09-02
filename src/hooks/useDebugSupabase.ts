import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useDebugSupabase() {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const testQueries = async () => {
    setLoading(true);
    const results: any = {};

    try {
      // Test 1: Connection basique
      results.connectionTest = 'Testing...';
      const { error: testError } = await supabase
        .from('products')
        .select('count')
        .limit(1);
      
      results.connectionTest = testError ? `Erreur: ${testError.message}` : 'OK';

      // Test 2: Products (devrait marcher)
      results.productsTest = 'Testing...';
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*')
        .limit(5);
      
      results.productsTest = productsError ? `Erreur: ${productsError.message}` : `OK - ${products?.length || 0} produits`;

      // Test 3: Sales (devrait marcher)
      results.salesTest = 'Testing...';
      const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select('*')
        .limit(5);
      
      results.salesTest = salesError ? `Erreur: ${salesError.message}` : `OK - ${sales?.length || 0} ventes`;

      // Test 4: User profiles (problématique)
      results.profilesTest = 'Testing...';
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('*')
        .limit(5);
      
      results.profilesTest = profilesError ? `Erreur: ${profilesError.message}` : `OK - ${profiles?.length || 0} profils`;

      // Test 5: Expenses (problématique)
      results.expensesTest = 'Testing...';
      const { data: expenses, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .limit(5);
      
      results.expensesTest = expensesError ? `Erreur: ${expensesError.message}` : `OK - ${expenses?.length || 0} frais`;

            // Test 2: User actuel
      try {
        const { data: userResponse, error: userError } = await supabase.auth.getUser();
        if (userError) {
          results.currentUserTest = `Erreur auth: ${userError.message}`;
        } else {
          results.currentUserTest = userResponse.user ? 
            `User ID: ${userResponse.user.id.substring(0, 8)}...` : 
            'Pas de user';
        }
      } catch (err) {
        results.currentUserTest = `Exception: ${err instanceof Error ? err.message : 'Unknown'}`;
      }

      // Test 7: Politiques RLS
      results.rlsTest = 'Testing...';
      const { error: policiesError } = await supabase
        .rpc('get_policies_info'); // Cette fonction n'existe peut-être pas
      
      results.rlsTest = policiesError ? `Erreur ou fonction inexistante: ${policiesError.message}` : 'OK';

      // Test 8: User info détaillé (seulement si nous avons un user)
      try {
        const { data: userResponse } = await supabase.auth.getUser();
        if (userResponse?.user) {
          const { data: currentProfile, error: currentProfileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', userResponse.user.id)
            .single();
          
          results.currentUserTest = currentProfileError ? 
            `Erreur profil current user: ${currentProfileError.message}` : 
            `OK - Role: ${currentProfile?.role}, Email: ${currentProfile?.email}`;
        } else {
          results.currentUserTest = 'Pas d\'utilisateur connecté';
        }
      } catch (err) {
        results.currentUserTest = `Exception user info: ${err instanceof Error ? err.message : 'Unknown'}`;
      }

      setDebugInfo(results);

    } catch (error: any) {
      setDebugInfo({ globalError: error.message, ...results });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testQueries();
  }, []);

  return { debugInfo, loading, refresh: testQueries };
}
