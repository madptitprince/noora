import React, { useState } from 'react';
import { Edit, Trash2, ShoppingCart, Plus, Search, Package } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { useAuth } from '../hooks/useAuth';
import { Product } from '../lib/database.types';
import { ProductForm } from './ProductForm';
import { ProductImage } from './ProductImage';

export function ProductList() {
  const { products, loading, deleteProduct, sellProduct } = useProducts();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const categories = ['all', 'lunettes', 'bagues', 'colliers', 'sets', 'bracelets'];
  
  const categoryLabels = {
    all: 'Toutes les catégories',
    lunettes: 'Lunettes',
    bagues: 'Bagues',
    colliers: 'Colliers',
    sets: 'Sets',
    bracelets: 'Bracelets',
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSell = async (product: Product) => {
    if (!user || product.quantity <= 0) return;
    
    const confirmed = window.confirm(`Confirmer la vente de "${product.name}" pour ${product.selling_price} € ?`);
    if (confirmed) {
      await sellProduct(product.id, product.selling_price, user.id);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = async (product: Product) => {
    const confirmed = window.confirm(`Êtes-vous sûr de vouloir supprimer "${product.name}" ?`);
    if (confirmed) {
      await deleteProduct(product.id);
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion du stock</h1>
          <p className="text-gray-600 mt-1">{products.length} produits au total</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-200 shadow-sm"
        >
          <Plus className="w-5 h-5 mr-2" />
          Ajouter un produit
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher par nom ou référence..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {categoryLabels[category as keyof typeof categoryLabels]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-xl shadow-sm border border-pink-100 overflow-hidden hover:shadow-md transition-all duration-200"
          >
            {/* Product Image */}
            <div className="aspect-square bg-gray-100 relative group">
              <ProductImage
                src={product.image_url}
                alt={product.name}
                className="w-full h-full"
              />
              
              {/* Quick Actions Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleSell(product)}
                    disabled={product.quantity <= 0}
                    className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    title="Vendre"
                  >
                    <ShoppingCart className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(product)}
                    className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors duration-200"
                    title="Modifier"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(product)}
                    className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
                <span className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded-full">
                  {product.reference}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 capitalize mb-3">{product.category}</p>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Prix de vente:</span>
                  <span className="font-semibold text-green-600">{product.selling_price.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Stock:</span>
                  <span className={`font-semibold ${product.quantity > 5 ? 'text-green-600' : product.quantity > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {product.quantity}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 flex space-x-2">
                <button
                  onClick={() => handleSell(product)}
                  disabled={product.quantity <= 0}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-200 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <ShoppingCart className="w-4 h-4 mr-1" />
                  Vendre
                </button>
                <button
                  onClick={() => handleEdit(product)}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun produit trouvé</h3>
          <p className="text-gray-600">
            {searchTerm || selectedCategory !== 'all'
              ? 'Essayez de modifier vos filtres de recherche'
              : 'Commencez par ajouter votre premier produit'
            }
          </p>
        </div>
      )}

      {/* Product Form Modal */}
      {showForm && (
        <ProductForm
          product={editingProduct}
          onClose={closeForm}
        />
      )}
    </div>
  );
}