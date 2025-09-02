-- CORRECTION URGENTE: Récursion infinie dans les politiques RLS
-- Exécuter dans Supabase Dashboard > SQL Editor

-- 1. Supprimer toutes les politiques existantes sur user_profiles
DROP POLICY IF EXISTS "Users can read own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.user_profiles;

-- 2. Supprimer toutes les politiques existantes sur expenses
DROP POLICY IF EXISTS "Users can read own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can insert own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can update own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can delete own expenses" ON public.expenses;

-- 3. Créer des politiques SIMPLES et SÉCURISÉES

-- Politiques pour user_profiles (SANS RÉCURSION)
CREATE POLICY "Allow authenticated users to read profiles" ON public.user_profiles
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Allow users to update their own profile" ON public.user_profiles
FOR UPDATE TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Allow insert during signup" ON public.user_profiles
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);

-- Politiques pour expenses (SIMPLES)
CREATE POLICY "Allow authenticated users to read expenses" ON public.expenses
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to insert expenses" ON public.expenses
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own expenses" ON public.expenses
FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own expenses" ON public.expenses
FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- 4. Vérifier que RLS est activé
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
