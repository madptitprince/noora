import { supabase } from './supabase';

/**
 * Initialise le bucket Supabase pour les images de produits
 */
export async function initializeStorage() {
  try {
    // Vérifier si le bucket existe déjà
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Erreur lors de la vérification des buckets:', listError);
      return false;
    }

    const productImagesBucket = buckets?.find(bucket => bucket.name === 'product-images');
    
    if (!productImagesBucket) {
      // Ne pas créer le bucket côté client (nécessite la service key)
      console.warn('⚠️ Bucket "product-images" introuvable. Créez-le dans le Dashboard Supabase et configurez les policies. Upload désactivé.');
      return false; // On n'essaie pas d'uploader si le bucket n'existe pas
    } else {
      console.log('✅ Bucket product-images déjà existant');
    }

    // Tester l'accès (lecture/écriture) au bucket
    const testResult = await testBucketAccess();
    return testResult;

  } catch (error) {
    console.error('Erreur lors de l\'initialisation du storage:', error);
    return false;
  }
}

/**
 * Teste l'accès au bucket en uploadant un fichier de test
 */
async function testBucketAccess(): Promise<boolean> {
  try {
    // Créer un petit fichier de test
    const testBlob = new Blob(['test'], { type: 'text/plain' });
    const testFile = new File([testBlob], 'test.txt', { type: 'text/plain' });

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload('test/test.txt', testFile, { upsert: true });

    if (uploadError) {
      console.warn('⚠️ Test d\'upload non autorisé (policies):', uploadError.message);
      return false;
    }

    // Supprimer le fichier de test
    await supabase.storage
      .from('product-images')
      .remove(['test/test.txt']);

    console.log('✅ Test d\'upload réussi');
    return true;

  } catch (error) {
    console.warn('⚠️ Erreur lors du test d\'accès au bucket:', error);
    return false;
  }
}

/**
 * Vérifie si les permissions du bucket sont correctement configurées
 */
export async function checkStoragePermissions(): Promise<{
  canRead: boolean;
  canWrite: boolean;
  message: string;
}> {
  try {
    // Test de lecture
    const { error: listError } = await supabase.storage
      .from('product-images')
      .list('', { limit: 1 });

    const canRead = !listError;

    // Test d'écriture (avec un fichier temporaire)
    const testBlob = new Blob(['permission-test'], { type: 'text/plain' });
    const testFile = new File([testBlob], 'permission-test.txt');
    
    const { error: writeError } = await supabase.storage
      .from('product-images')
      .upload('test/permission-test.txt', testFile, { upsert: true });

    const canWrite = !writeError;

    // Nettoyer le fichier de test
    if (canWrite) {
      await supabase.storage
        .from('product-images')
        .remove(['test/permission-test.txt']);
    }

    let message = '';
    if (canRead && canWrite) {
      message = '✅ Toutes les permissions sont correctes';
    } else if (canRead && !canWrite) {
      message = '⚠️ Lecture OK, mais problème d\'écriture - vérifiez les policies Storage';
    } else if (!canRead && canWrite) {
      message = '⚠️ Écriture OK, mais problème de lecture - vérifiez les policies Storage';
    } else {
      message = '❌ Problèmes de lecture et d\'écriture - vérifiez la configuration du bucket';
    }

    return { canRead, canWrite, message };

  } catch (error) {
    return {
      canRead: false,
      canWrite: false,
      message: `❌ Erreur lors de la vérification: ${error}`
    };
  }
}
