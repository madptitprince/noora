import { AlertTriangle, ExternalLink, RefreshCw } from 'lucide-react';

interface ConfigurationBannerProps {
  storageStatus: {
    canRead: boolean;
    canWrite: boolean;
    message: string;
  } | null;
  onRetry: () => void;
}

export function ConfigurationBanner({ storageStatus, onRetry }: ConfigurationBannerProps) {
  if (!storageStatus || (storageStatus.canRead && storageStatus.canWrite)) {
    return null;
  }

  const isPartiallyWorking = storageStatus.canRead || storageStatus.canWrite;
  const bgColor = isPartiallyWorking ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200';
  const textColor = isPartiallyWorking ? 'text-yellow-800' : 'text-red-800';
  const iconColor = isPartiallyWorking ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className={`border-l-4 p-4 ${bgColor}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertTriangle className={`h-5 w-5 ${iconColor}`} />
        </div>
        <div className="ml-3 flex-1">
          <h3 className={`text-sm font-medium ${textColor}`}>
            Configuration Supabase Incomplète
          </h3>
          <div className={`mt-2 text-sm ${textColor}`}>
            <p>{storageStatus.message}</p>
            <div className="mt-3">
              <div className="flex items-center space-x-2">
                <button
                  onClick={onRetry}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Réessayer
                </button>
                <a
                  href="/CONFIGURATION_BUCKET.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Guide de Configuration
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Instructions rapides */}
      <div className="mt-4 p-3 bg-white rounded-md border border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-2">
          Configuration rapide :
        </h4>
        <ol className="text-xs text-gray-600 space-y-1">
          <li>1. Allez dans votre dashboard Supabase → Storage</li>
          <li>2. Créez un bucket public nommé "product-images"</li>
          <li>3. Configurez les politiques RLS pour les utilisateurs authentifiés</li>
          <li>4. Redémarrez l'application</li>
        </ol>
      </div>
    </div>
  );
}
