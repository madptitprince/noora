# 🔧 Configuration du Bucket Supabase pour les Images

## Problème
L'erreur "Erreur lors de l'upload de l'image" indique que le bucket `product-images` n'existe pas ou n'est pas correctement configuré dans Supabase.

## Solution - Configuration Manuelle

### 1. Créer le Bucket
1. Allez dans votre dashboard Supabase
2. Naviguez vers **Storage** dans le menu de gauche
3. Cliquez sur **New bucket**
4. Configurez le bucket :
   - **Nom** : `product-images`
   - **Public bucket** : ✅ Activé
   - **File size limit** : `5MB` (5242880 bytes)
   - **Allowed MIME types** : `image/jpeg,image/jpg,image/png,image/webp`

### 2. Configurer les Politiques RLS

Dans l'onglet **Policies** de votre bucket, ajoutez les politiques suivantes :

#### Politique de Lecture (SELECT)
```sql
CREATE POLICY "Anyone can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');
```

#### Politique d'Écriture (INSERT)
```sql
CREATE POLICY "Authenticated users can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');
```

#### Politique de Mise à Jour (UPDATE)
```sql
CREATE POLICY "Authenticated users can update product images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images');
```

#### Politique de Suppression (DELETE)
```sql
CREATE POLICY "Authenticated users can delete product images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'product-images');
```

### 3. Configuration Alternative - Via SQL

Vous pouvez aussi exécuter ce script SQL dans l'éditeur SQL de Supabase :

```sql
-- Créer le bucket (si ce n'est pas fait via l'interface)
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Politiques pour les objets du bucket
CREATE POLICY "Anyone can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can update product images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can delete product images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'product-images');
```

## Solution - Configuration Automatique

### Utiliser l'Utilitaire Intégré

Nous avons créé un utilitaire pour vérifier et configurer automatiquement le bucket. 

1. **Importer l'utilitaire** dans votre composant principal :

```typescript
import { initializeStorage, checkStoragePermissions } from '../lib/storage-setup';
```

2. **Initialiser au démarrage de l'app** :

```typescript
// Dans App.tsx ou un hook d'initialisation
useEffect(() => {
  const setupStorage = async () => {
    const isInitialized = await initializeStorage();
    if (isInitialized) {
      console.log('✅ Storage configuré avec succès');
    } else {
      console.error('❌ Problème de configuration du storage');
    }
  };
  
  setupStorage();
}, []);
```

3. **Vérifier les permissions** :

```typescript
const checkPermissions = async () => {
  const result = await checkStoragePermissions();
  console.log(result.message);
};
```

## Vérification

### Test d'Upload
1. Créez un produit avec une image
2. Vérifiez que l'image s'affiche correctement
3. L'URL doit ressembler à : `https://yourproject.supabase.co/storage/v1/object/public/product-images/products/filename.jpg`

### Dépannage

#### Erreur "The resource was not found"
- ➡️ Le bucket n'existe pas → Créez-le manuellement

#### Erreur "new row violates row-level security"
- ➡️ Problème de permissions → Vérifiez les politiques RLS

#### Erreur "Payload too large"
- ➡️ Fichier trop volumineux → Réduisez la taille ou augmentez la limite

#### Erreur "Invalid mime type"
- ➡️ Format non autorisé → Utilisez JPG, PNG ou WebP

## Structure Recommandée

```
product-images/
├── products/           # Images de produits
│   ├── product1.jpg
│   ├── product2.png
│   └── ...
├── thumbnails/         # Miniatures (optionnel)
│   ├── product1_thumb.jpg
│   └── ...
└── temp/              # Fichiers temporaires
    └── ...
```

## Surveillance

Surveillez l'utilisation du storage dans votre dashboard Supabase :
- **Storage** > **Settings** > **Usage**
- Limite gratuite : 1GB
- Surveillez les requêtes d'API Storage

---

Une fois cette configuration terminée, l'upload d'images devrait fonctionner correctement ! 🎉
