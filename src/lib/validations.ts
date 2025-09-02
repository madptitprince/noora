import { z } from 'zod';

export const authSchema = z.object({
  email: z
    .string()
    .min(1, 'L\'email est requis')
    .email('Format d\'email invalide'),
  password: z
    .string()
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères')
    .max(100, 'Le mot de passe est trop long'),
  role: z.enum(['owner', 'manager']).optional(),
});

export type AuthFormData = z.infer<typeof authSchema>;

export const productSchema = z.object({
  name: z
    .string()
    .min(1, 'Le nom du produit est requis')
    .max(100, 'Le nom est trop long'),
  category: z.enum(['lunettes', 'bagues', 'colliers', 'sets', 'bracelets']),
  purchase_price: z
    .number()
    .min(0, 'Le prix d\'achat doit être positif')
    .max(9999.99, 'Prix trop élevé'),
  selling_price: z
    .number()
    .min(0, 'Le prix de vente doit être positif')
    .max(9999.99, 'Prix trop élevé'),
  quantity: z
    .number()
    .int('La quantité doit être un nombre entier')
    .min(0, 'La quantité doit être positive')
    .max(9999, 'Quantité trop élevée'),
});

export type ProductFormData = z.infer<typeof productSchema>;

export const expenseSchema = z.object({
  description: z
    .string()
    .min(1, 'La description est requise')
    .max(200, 'Description trop longue'),
  amount: z
    .number()
    .min(0.01, 'Le montant doit être supérieur à 0')
    .max(9999.99, 'Montant trop élevé'),
  expense_date: z
    .string()
    .min(1, 'La date est requise'),
  type: z
    .string()
    .min(1, 'Le type de frais est requis'),
});

export type ExpenseFormData = z.infer<typeof expenseSchema>;
