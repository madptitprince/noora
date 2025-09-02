import { useState } from 'react';
import { Package } from 'lucide-react';

interface ProductImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  fallbackClassName?: string;
}

export function ProductImage({ src, alt, className = '', fallbackClassName = '' }: ProductImageProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Si pas d'URL ou erreur de chargement, afficher le fallback
  if (!src || imageError) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${fallbackClassName || className}`}>
        <Package className="w-12 h-12 text-gray-400" />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {imageLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onLoad={() => setImageLoading(false)}
        onError={() => {
          setImageError(true);
          setImageLoading(false);
          console.error('Erreur de chargement image:', src);
        }}
      />
    </div>
  );
}
