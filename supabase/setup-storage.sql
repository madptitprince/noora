-- Configuration du bucket de stockage pour les images de produits
-- Script SQL à exécuter dans Supabase Dashboard > SQL Editor

-- Créer le bucket s'il n'existe pas
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Politique pour permettre l'upload d'images aux utilisateurs authentifiés
CREATE POLICY "Allow authenticated users to upload images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);

-- Politique pour permettre la lecture publique des images
CREATE POLICY "Allow public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');

-- Politique pour permettre aux utilisateurs de modifier leurs propres images
CREATE POLICY "Allow users to update their own images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);

-- Politique pour permettre aux utilisateurs de supprimer leurs propres images
CREATE POLICY "Allow users to delete their own images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);

-- Configuration MIME types autorisés
-- Cette configuration doit être faite dans l'interface Supabase Dashboard
-- Dans Storage > Settings, ajouter les types MIME suivants :
-- image/jpeg, image/png, image/webp, image/gif
