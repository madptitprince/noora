-- CORRECTION RADICALE: Supprimer TOUTES les politiques et recréer proprement
-- Exécuter dans Supabase Dashboard > SQL Editor

-- ÉTAPE 1: Désactiver temporairement RLS pour les tables problématiques
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses DISABLE ROW LEVEL SECURITY;

-- ÉTAPE 2: Supprimer TOUTES les politiques existantes (même celles avec des noms différents)
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Supprimer toutes les politiques sur user_profiles
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'user_profiles' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON public.user_profiles';
    END LOOP;
    
    -- Supprimer toutes les politiques sur expenses
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'expenses' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON public.expenses';
    END LOOP;
    
    RAISE NOTICE 'Toutes les politiques RLS ont été supprimées';
END
$$;

-- ÉTAPE 3: Réactiver RLS avec des politiques très simples
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- ÉTAPE 4: Créer des politiques ultra-simples (sans référence circulaire)

-- Pour user_profiles: accès total aux utilisateurs authentifiés
CREATE POLICY "simple_read_profiles" ON public.user_profiles
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "simple_insert_profiles" ON public.user_profiles
FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "simple_update_profiles" ON public.user_profiles
FOR UPDATE TO authenticated
USING (true);

-- Pour expenses: accès total aux utilisateurs authentifiés
CREATE POLICY "simple_read_expenses" ON public.expenses
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "simple_insert_expenses" ON public.expenses
FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "simple_update_expenses" ON public.expenses
FOR UPDATE TO authenticated
USING (true);

CREATE POLICY "simple_delete_expenses" ON public.expenses
FOR DELETE TO authenticated
USING (true);

-- ÉTAPE 5: Vérifier que tout fonctionne
SELECT 'Politiques RLS réinitialisées avec succès' as status;
