import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Product } from '../lib/database.types';
import { ImageService } from '../lib/imageService';
import toast from 'react-hot-toast';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
    
    // Subscribe to real-time updates
    const subscription = supabase
      .channel('products-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        loadProducts();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Erreur lors du chargement des produits');
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (productData: Omit<Product, 'id' | 'reference' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Produit ajouté avec succès');
      return data;
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Erreur lors de l\'ajout du produit');
      throw error;
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Produit mis à jour');
      return data;
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Erreur lors de la mise à jour');
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Produit supprimé');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Erreur lors de la suppression');
      throw error;
    }
  };

  const sellProduct = async (productId: string, salePrice: number, userId: string) => {
    try {
      const { data, error } = await supabase
        .from('sales')
        .insert({
          product_id: productId,
          quantity_sold: 1,
          sale_price: salePrice,
          user_id: userId,
        })
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Vente enregistrée avec succès');
      return data;
    } catch (error) {
      console.error('Error recording sale:', error);
      toast.error('Erreur lors de l\'enregistrement de la vente');
      throw error;
    }
  };

  const uploadProductImage = async (file: File): Promise<string | null> => {
    try {
      const { url, error } = await ImageService.uploadImage(file);
      
      if (error) {
        toast.error(error);
        return null;
      }
      
      return url || null;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Erreur lors de l\'upload de l\'image');
      return null;
    }
  };

  return {
    products,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    sellProduct,
    uploadProductImage,
    refresh: loadProducts,
  };
}