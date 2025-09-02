import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { 
  Home, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  LogOut,
  Crown,
  User
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export function Layout() {
  const location = useLocation();
  const { signOut, profile, isOwner } = useAuth();

  const navigation = [
    { name: 'Tableau de bord', href: '/', icon: Home },
    { name: 'Stock', href: '/products', icon: Package },
    { name: 'Ventes', href: '/sales', icon: ShoppingCart },
    { name: 'Frais', href: '/expenses', icon: DollarSign },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl border-r border-pink-100">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 bg-gradient-to-r from-pink-500 to-purple-600">
            <h1 className="text-2xl font-bold text-white">Noora</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-pink-50 hover:text-pink-700'
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="border-t border-pink-100 p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="flex-shrink-0">
                {isOwner ? (
                  <Crown className="w-8 h-8 text-yellow-500" />
                ) : (
                  <User className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {profile?.email}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {profile?.role === 'owner' ? 'Propriétaire' : 'Gérante'}
                </p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center w-full px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-red-50 hover:text-red-700 transition-colors duration-200"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}