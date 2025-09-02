# 🚨 PROBLÈME CRITIQUE DÉTECTÉ

## Problème : Récursion infinie dans les politiques RLS

**Erreur** : `infinite recursion detected in policy for relation "user_profiles"`

Cette erreur empêche le chargement des données des frais et profils utilisateur.

## ✅ SOLUTION IMMÉDIATE

### 1. Exécuter le script de correction dans Supabase

1. Allez dans **Supabase Dashboard**
2. Cliquez sur **SQL Editor**
3. Copiez et exécutez le contenu du fichier `supabase/fix-rls-policies.sql`

### 2. Vérifier les rôles utilisateur

Exécutez cette requête pour vérifier/corriger les rôles :

```sql
-- Voir tous les profils
SELECT * FROM public.user_profiles;

-- Mettre à jour le rôle si nécessaire
UPDATE public.user_profiles 
SET role = 'owner' 
WHERE email = 'madptitprince@gmail.com';
```

### 3. Alternative temporaire

Si le problème persiste, vous pouvez temporairement utiliser le hook de contournement en modifiant `Dashboard.tsx` :

```tsx
// Remplacer cette ligne
import { useDashboard } from '../hooks/useDashboard';

// Par celle-ci
import { useDashboardFix as useDashboard } from '../hooks/useDashboardFix';
```

## 📊 État actuel des données

D'après le debug :
- ✅ **Produits** : 1 produit (brac1)
- ✅ **Ventes** : 1 vente récente  
- ❌ **Frais** : Erreur RLS (récursion infinie)
- ❌ **Profils** : Erreur RLS (récursion infinie)

## 🔧 Après la correction

Une fois les politiques RLS corrigées :

1. **Le dashboard affichera les vraies données**
2. **La page des frais sera accessible** (si vous êtes propriétaire)
3. **Les calculs financiers seront précis**
4. **Plus d'erreurs de récursion**

## 🎯 Pour vérifier que ça marche

1. Rechargez la page après avoir exécuté le script SQL
2. Le debug devrait montrer "Connexion DB: OK" 
3. Frais et Profils ne doivent plus afficher "Erreur"
4. Le menu "Frais" apparaîtra si vous êtes propriétaire

---

**Note** : Cette erreur est commune avec Supabase RLS quand les politiques référencent des tables qui s'auto-référencent. Le script corrige cela avec des politiques plus simples et sécurisées.
