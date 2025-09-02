# 🔧 Configuration Supabase Requise

## Configuration du Storage (URGENT)

### 1. Créer le bucket pour les images
1. Aller dans Supabase Dashboard → Storage
2. Créer un nouveau bucket nommé `product-images`
3. Cocher "Public bucket" pour que les images soient accessibles
4. Sauvegarder

### 2. Politique de Storage
Exécuter cette requête SQL dans l'éditeur SQL de Supabase :

```sql
-- Permettre l'upload d'images pour les utilisateurs authentifiés
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

-- Politique pour permettre l'upload
CREATE POLICY "Users can upload product images" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product-images');

-- Politique pour permettre la lecture
CREATE POLICY "Public can view product images" ON storage.objects
FOR SELECT TO public USING (bucket_id = 'product-images');

-- Politique pour permettre la mise à jour
CREATE POLICY "Users can update their product images" ON storage.objects
FOR UPDATE TO authenticated USING (bucket_id = 'product-images');

-- Politique pour permettre la suppression
CREATE POLICY "Users can delete their product images" ON storage.objects
FOR DELETE TO authenticated USING (bucket_id = 'product-images');
```

## ⚠️ ATTENTION
Sans cette configuration, l'upload d'images ne fonctionnera pas !
