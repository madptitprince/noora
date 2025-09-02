# Configuration Supabase Storage pour les Images

## Étapes pour configurer le stockage d'images

### 1. Créer le bucket de stockage

Dans le dashboard Supabase, allez dans **Storage** et créez un nouveau bucket :

- **Nom du bucket** : `product-images`
- **Public** : Oui (coché)

### 2. Configurer les politiques RLS

Dans **SQL Editor**, exécutez le script suivant :

```sql
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
```

### 3. Configurer les types MIME autorisés

Dans **Storage > Settings**, configurez les types MIME autorisés :
- `image/jpeg`
- `image/png` 
- `image/webp`
- `image/gif`

### 4. Limites recommandées

- **Taille maximale** : 5MB par fichier
- **Formats supportés** : JPG, PNG, WebP, GIF
- **Résolution recommandée** : 800x800px maximum pour optimiser les performances

## Test de fonctionnement

Une fois configuré, vous pouvez tester l'upload d'images dans l'application :

1. Aller dans **Produits**
2. Cliquer sur **Ajouter un produit**
3. Sélectionner une image dans le champ **Image**
4. L'image devrait s'afficher en prévisualisation
5. Après sauvegarde, l'image devrait être visible dans la liste des produits

## Dépannage

### Erreur "bucket not found"
- Vérifiez que le bucket `product-images` existe bien
- Vérifiez qu'il est marqué comme public

### Erreur de permissions
- Vérifiez que les politiques RLS sont bien configurées
- Vérifiez que l'utilisateur est bien authentifié

### Images ne s'affichent pas
- Vérifiez les URLs dans la console navigateur
- Vérifiez que le bucket est public
- Vérifiez la politique de lecture publique

## URLs des images

Les images uploadées auront des URLs de la forme :
```
https://[PROJECT_ID].supabase.co/storage/v1/object/public/product-images/[filename]
```

Ces URLs sont directement utilisables dans les balises `<img>` HTML.
