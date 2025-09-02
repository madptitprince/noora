-- Création du profil utilisateur manquant
-- D'abord, récupérons l'ID de l'utilisateur depuis auth.users

SELECT id, email FROM auth.users WHERE email = 'madptitprince@gmail.com';

-- Ensuite, créons le profil utilisateur (remplacez 'USER_ID_HERE' par l'ID réel)
-- Récupérez d'abord l'ID ci-dessus, puis utilisez-le dans la requête suivante

-- Version automatique (recommandée) :
INSERT INTO public.user_profiles (id, email, role)
SELECT id, email, 'manager'
FROM auth.users 
WHERE email = 'madptitprince@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM public.user_profiles WHERE email = 'madptitprince@gmail.com'
);

-- Vérifier que le profil a été créé
SELECT id, email, role, created_at 
FROM public.user_profiles 
WHERE email = 'madptitprince@gmail.com';
