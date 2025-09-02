/**
 * Utilities pour la validation des formulaires
 */

export const validateEmail = (email: string): string | null => {
  if (!email) return 'L\'email est requis';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return 'Format d\'email invalide';
  }
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) return 'Le mot de passe est requis';
  if (password.length < 6) {
    return 'Le mot de passe doit contenir au moins 6 caractères';
  }
  if (password.length > 100) {
    return 'Le mot de passe est trop long';
  }
  return null;
};

export const validateRequired = (value: string | number, fieldName: string): string | null => {
  if (!value && value !== 0) return `${fieldName} est requis`;
  return null;
};

export const validatePositiveNumber = (value: number, fieldName: string): string | null => {
  if (value < 0) return `${fieldName} doit être positif`;
  if (value > 9999.99) return `${fieldName} est trop élevé`;
  return null;
};

export const validatePositiveInteger = (value: number, fieldName: string): string | null => {
  if (!Number.isInteger(value)) return `${fieldName} doit être un nombre entier`;
  if (value < 0) return `${fieldName} doit être positif`;
  if (value > 9999) return `${fieldName} est trop élevé`;
  return null;
};

export const validateStringLength = (
  value: string, 
  fieldName: string, 
  min: number = 1, 
  max: number = 200
): string | null => {
  if (value.length < min) return `${fieldName} doit contenir au moins ${min} caractères`;
  if (value.length > max) return `${fieldName} ne peut pas dépasser ${max} caractères`;
  return null;
};
