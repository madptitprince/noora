# Noora - Plateforme de gestion d'inventaire

Plateforme complète de gestion d'inventaire et de vente pour le business d'accessoires féminins Noora.

## 🎯 Fonctionnalités

### Gestion du stock
- ✅ Ajout de produits avec photo, prix fournisseur, prix de vente, quantité
- ✅ Système de références automatique par catégorie (brac1, lun2, col3, etc.)
- ✅ Modification et suppression de produits
- ✅ Interface de recherche et filtrage

### Système de vente
- ✅ Interface intuitive pour la gérante
- ✅ Bouton "Vendre" avec décrément automatique du stock
- ✅ Confirmation visuelle des ventes
- ✅ Historique complet des transactions

### Tableau de bord en temps réel
- ✅ Stock disponible par catégorie
- ✅ Coûts d'achat total des produits
- ✅ Chiffre d'affaires (jour/mois/total)
- ✅ Bénéfices nets calculés automatiquement
- ✅ Part de la gérante (25% des bénéfices)

### Gestion financière (propriétaire uniquement)
- ✅ Module de saisie des frais et dépenses
- ✅ Calculs automatiques des marges et bénéfices
- ✅ Historique des transactions

### Sécurité et rôles
- ✅ Authentification par email/mot de passe
- ✅ Système de rôles (propriétaire/gérante)
- ✅ Contrôle d'accès granulaire

## 🚀 Installation

### Prérequis
1. Compte Supabase (gratuit)
2. Node.js 18+ installé

### Configuration

1. **Connecter Supabase**
   - Cliquez sur le bouton "Connect to Supabase" en haut à droite
   - Suivez les instructions pour configurer votre projet Supabase

2. **Créer le bucket pour les images**
   Dans votre dashboard Supabase, allez dans Storage et créez un bucket public nommé `product-images`

3. **Lancer l'application**
   ```bash
   npm run dev
   ```

## 📊 Structure de la base de données

### Tables principales

- **products**: Gestion du catalogue produits
- **sales**: Historique des ventes
- **expenses**: Frais et dépenses (propriétaire uniquement)
- **user_profiles**: Profils utilisateurs avec rôles

### Sécurité (RLS)

- Row Level Security activé sur toutes les tables
- Politiques d'accès basées sur les rôles
- Les gérantes ne peuvent pas voir les frais

## 👥 Rôles utilisateurs

### Propriétaire
- Accès complet à toutes les fonctionnalités
- Gestion des frais et dépenses
- Vue complète des finances

### Gérante
- Gestion du stock (ajout, modification, suppression)
- Enregistrement des ventes
- Vue du tableau de bord (sans les frais)
- Calcul de sa part (25% des bénéfices)

## 💰 Calculs financiers

- **Chiffre d'affaires**: Somme de toutes les ventes
- **Coût des stocks**: Prix d'achat × Quantité en stock
- **Total investi**: Coût des stocks + Frais totaux
- **Bénéfice net**: Chiffre d'affaires - Total investi
- **Part gérante**: 25% du bénéfice net (si positif)

## 🔄 Mises à jour en temps réel

L'application utilise les subscriptions Supabase pour mettre à jour automatiquement:
- Le tableau de bord quand des ventes ou frais sont ajoutés
- La liste des produits quand le stock change
- Les statistiques financières en temps réel

## 📱 Design responsive

Interface optimisée pour:
- 📱 Mobile (< 768px)
- 📱 Tablette (768px - 1024px)
- 💻 Desktop (> 1024px)

## 🎨 Technologies utilisées

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Base de données**: Supabase
- **Authentification**: Supabase Auth
- **Stockage**: Supabase Storage
- **Icons**: Lucide React
- **Forms**: React Hook Form
- **Notifications**: React Hot Toast
- **Dates**: date-fns

## 🔧 Fonctionnalités avancées

- Génération automatique des références produits
- Upload et stockage d'images optimisé
- Animations et micro-interactions
- Validation des formulaires
- Gestion d'erreurs robuste
- Design Apple-level avec attention aux détails# noora
