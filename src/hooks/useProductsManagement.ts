import { useCallback } from 'react';
import { useProducts } from './useProducts';
import { useModal, useAsyncState } from './useUtils';
import { Product } from '../lib/database.types';
import toast from 'react-hot-toast';

export function useProductsManagement() {
  const { products, loading, deleteProduct, sellProduct } = useProducts();
  const productModal = useModal();
  const confirmModal = useModal();
  const { loading: actionLoading, execute } = useAsyncState();

  const handleSellProduct = useCallback(async (product: Product) => {
    if (!product || product.quantity <= 0) {
      toast.error('Stock insuffisant pour effectuer cette vente');
      return;
    }

    const result = await execute(async () => {
      // Optimistic update (on pourrait mettre à jour l'interface immédiatement)
      await sellProduct(product.id, product.selling_price, 'current-user-id');
      return true;
    });

    if (result) {
      toast.success(`Vente de "${product.name}" enregistrée avec succès`);
    }
  }, [execute, sellProduct]);

  const handleDeleteProduct = useCallback((product: Product) => {
    confirmModal.open({
      product,
      action: 'delete',
      title: 'Supprimer le produit',
      message: `Êtes-vous sûr de vouloir supprimer "${product.name}" ? Cette action est irréversible.`,
      onConfirm: async () => {
        const result = await execute(async () => {
          await deleteProduct(product.id);
          return true;
        });

        if (result) {
          toast.success('Produit supprimé avec succès');
        }
      }
    });
  }, [confirmModal, execute, deleteProduct]);

  const handleEditProduct = useCallback((product: Product) => {
    productModal.open(product);
  }, [productModal]);

  const handleAddProduct = useCallback(() => {
    productModal.open();
  }, [productModal]);

  return {
    // Data
    products,
    loading: loading || actionLoading,
    
    // Modals
    productModal,
    confirmModal,
    
    // Actions
    handleSellProduct,
    handleDeleteProduct,
    handleEditProduct,
    handleAddProduct,
  };
}
