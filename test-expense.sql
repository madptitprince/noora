-- Test: Ajouter un frais de test pour vérifier le fonctionnement

-- D'abord, voir s'il y a déjà des frais
SELECT * FROM public.expenses ORDER BY created_at DESC;

-- Ajouter un frais de test
INSERT INTO public.expenses (description, amount, expense_date, type, user_id)
VALUES (
  'Test - Frais de livraison',
  15.50,
  CURRENT_DATE,
  'transport',
  (SELECT id FROM auth.users WHERE email = 'madptitprince@gmail.com')
);

-- Vérifier que le frais a été ajouté
SELECT id, description, amount, expense_date, type, user_id, created_at 
FROM public.expenses 
ORDER BY created_at DESC
LIMIT 5;
