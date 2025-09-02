import { useState, useEffect } from 'react';
import { initializeStorage, checkStoragePermissions } from '../lib/storage-setup';
import toast from 'react-hot-toast';

interface AppInitState {
  isInitialized: boolean;
  isLoading: boolean;
  errors: string[];
  storageStatus: {
    canRead: boolean;
    canWrite: boolean;
    message: string;
  } | null;
}

export function useAppInitialization() {
  const [state, setState] = useState<AppInitState>({
    isInitialized: false,
    isLoading: true,
    errors: [],
    storageStatus: null,
  });

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, errors: [] }));

      // 1. Vérifier et initialiser le storage
      console.log('🔧 Initialisation du storage...');
      const storageInitialized = await initializeStorage();
      
      if (!storageInitialized) {
        console.warn('⚠️ Problème d\'initialisation du storage - fonctionnalité d\'upload désactivée');
      }

      // 2. Vérifier les permissions
      console.log('🔒 Vérification des permissions...');
      const permissions = await checkStoragePermissions();
      
      setState(prev => ({
        ...prev,
        storageStatus: permissions,
        isInitialized: true,
        isLoading: false,
      }));

      // 3. Afficher le statut
      if (permissions.canRead && permissions.canWrite) {
        console.log('✅ Application initialisée avec succès');
      } else {
        console.warn('⚠️ Application initialisée avec des limitations');
        toast.error('Certaines fonctionnalités peuvent être limitées. Vérifiez la configuration Supabase.');
      }

    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        errors: [...prev.errors, `Erreur d'initialisation: ${error}`],
      }));
      
      toast.error('Erreur lors de l\'initialisation de l\'application');
    }
  };

  const retryInitialization = () => {
    initializeApp();
  };

  return {
    ...state,
    retryInitialization,
  };
}
