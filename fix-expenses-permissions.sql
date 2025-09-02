-- Correction des permissions pour les frais (expenses)
-- Les gérantes et propriétaires peuvent voir et ajouter des frais
-- Seuls les propriétaires peuvent modifier/supprimer

-- Supprimer les anciennes politiques pour expenses
DROP POLICY IF EXISTS "simple_read_expenses" ON public.expenses;
DROP POLICY IF EXISTS "simple_insert_expenses" ON public.expenses;
DROP POLICY IF EXISTS "simple_update_expenses" ON public.expenses;
DROP POLICY IF EXISTS "simple_delete_expenses" ON public.expenses;
DROP POLICY IF EXISTS "expenses_read_all" ON public.expenses;
DROP POLICY IF EXISTS "expenses_insert_owner_only" ON public.expenses;
DROP POLICY IF EXISTS "expenses_update_owner_only" ON public.expenses;
DROP POLICY IF EXISTS "expenses_delete_owner_only" ON public.expenses;

-- Nouvelles politiques avec permissions appropriées

-- Lecture: Tous les utilisateurs authentifiés peuvent voir les frais
CREATE POLICY "expenses_read_authenticated" ON public.expenses
FOR SELECT TO authenticated
USING (true);

-- Insertion: Propriétaires et gérantes peuvent ajouter des frais
CREATE POLICY "expenses_insert_owner_manager" ON public.expenses
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role IN ('owner', 'manager')
  )
);

-- Modification: Seuls les propriétaires peuvent modifier des frais
CREATE POLICY "expenses_update_owner_only" ON public.expenses
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role = 'owner'
  )
);

-- Suppression: Seuls les propriétaires peuvent supprimer des frais
CREATE POLICY "expenses_delete_owner_only" ON public.expenses
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role = 'owner'
  )
);

-- Vérifier que tout fonctionne
SELECT 'Permissions des frais mises à jour: gérantes peuvent voir/ajouter, propriétaires peuvent tout faire' as status;
