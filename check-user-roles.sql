-- Vérification et correction des rôles utilisateurs
-- Vérifier les rôles existants dans user_profiles

SELECT id, email, role, created_at 
FROM public.user_profiles 
ORDER BY created_at;

-- Si le rôle est mal défini, le corriger
-- Remplacez 'your-user-id' par l'ID réel de votre utilisateur si nécessaire

-- Pour s'assurer que le rôle gérante est bien 'manager'
UPDATE public.user_profiles 
SET role = 'manager' 
WHERE email = 'madptitprince@gmail.com' AND role != 'owner';

-- Vérifier après mise à jour
SELECT id, email, role, created_at 
FROM public.user_profiles 
WHERE email = 'madptitprince@gmail.com';

-- Vérifier les politiques actives sur expenses
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'expenses' AND schemaname = 'public';
