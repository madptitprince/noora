import { supabase } from './supabase';

export class ImageService {
  private static bucketName = 'product-images';

  /**
   * Upload une image vers Supabase Storage
   */
  static async uploadImage(file: File, path?: string): Promise<{ url: string | null; error: string | null }> {
    try {
      // Génerer un nom de fichier unique
      const fileExt = file.name.split('.').pop();
      const fileName = path || `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      // Vérifier la taille du fichier (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        return { url: null, error: 'Le fichier est trop volumineux (max 5MB)' };
      }

      // Vérifier le type MIME
      if (!file.type.startsWith('image/')) {
        return { url: null, error: 'Seules les images sont autorisées' };
      }

      // Upload vers Supabase
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        return { url: null, error: `Erreur d'upload: ${error.message}` };
      }

      // Obtenir l'URL publique
      const { data: urlData } = supabase.storage
        .from(this.bucketName)
        .getPublicUrl(data.path);

      return { url: urlData.publicUrl, error: null };
    } catch (error: any) {
      console.error('Image upload error:', error);
      return { url: null, error: `Erreur inattendue: ${error.message}` };
    }
  }

  /**
   * Supprime une image de Supabase Storage
   */
  static async deleteImage(path: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.storage
        .from(this.bucketName)
        .remove([path]);

      if (error) {
        console.error('Delete error:', error);
        return { error: `Erreur de suppression: ${error.message}` };
      }

      return { error: null };
    } catch (error: any) {
      console.error('Image delete error:', error);
      return { error: `Erreur inattendue: ${error.message}` };
    }
  }

  /**
   * Obtient l'URL publique d'une image
   */
  static getPublicUrl(path: string): string {
    const { data } = supabase.storage
      .from(this.bucketName)
      .getPublicUrl(path);
    
    return data.publicUrl;
  }

  /**
   * Extrait le chemin d'une URL publique Supabase
   */
  static getPathFromUrl(url: string): string | null {
    try {
      const urlParts = url.split('/');
      const bucketIndex = urlParts.findIndex(part => part === this.bucketName);
      if (bucketIndex === -1) return null;
      
      return urlParts.slice(bucketIndex + 1).join('/');
    } catch {
      return null;
    }
  }

  /**
   * Valide qu'un fichier est une image valide
   */
  static validateImageFile(file: File): { valid: boolean; error?: string } {
    // Vérifier le type
    if (!file.type.startsWith('image/')) {
      return { valid: false, error: 'Le fichier doit être une image' };
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return { valid: false, error: 'L\'image ne doit pas dépasser 5MB' };
    }

    // Types supportés
    const supportedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!supportedTypes.includes(file.type)) {
      return { valid: false, error: 'Format non supporté. Utilisez JPG, PNG, WebP ou GIF' };
    }

    return { valid: true };
  }
}
