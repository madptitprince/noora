-- Configuration du bucket Supabase Storage pour les images produits
-- Exécuter dans Supabase Dashboard > SQL Editor

-- 1. Créer le bucket s'il n'existe pas (normalement déjà fait)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true, -- IMPORTANT: bucket public
  5242880, -- 5MB en bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']::text[];

-- 2. Politique pour permettre l'upload aux utilisateurs authentifiés
CREATE POLICY "Authenticated users can upload images" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'product-images');

-- 3. Politique pour permettre la lecture publique des images
CREATE POLICY "Public can view product images" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'product-images');

-- 4. Politique pour permettre la mise à jour aux utilisateurs authentifiés
CREATE POLICY "Authenticated users can update their images" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'product-images');

-- 5. Politique pour permettre la suppression aux utilisateurs authentifiés
CREATE POLICY "Authenticated users can delete images" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'product-images');

-- Vérifier la configuration
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'product-images';
