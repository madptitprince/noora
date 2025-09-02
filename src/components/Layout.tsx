import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { 
  Home, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  LogOut,
  Crown,
  User,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export function Layout() {
  const location = useLocation();
  const { signOut, profile, isOwner } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigation = [
    { name: 'Tableau de bord', href: '/', icon: Home },
    { name: 'Stock', href: '/products', icon: Package },
    { name: 'Ventes', href: '/sales', icon: ShoppingCart },
    { name: 'Frais', href: '/expenses', icon: DollarSign },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="px-4 py-6 space-y-2">
      {navigation.map((item) => {
        const isActive = location.pathname === item.href;
        return (
          <Link
            key={item.name}
            to={item.href}
            onClick={() => onNavigate?.()}
            className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 border-l-4 ${
              isActive
                ? 'bg-gray-900 text-brand-gold border-brand-gold shadow'
                : 'text-gray-300 hover:bg-gray-800 hover:text-brand-gold border-transparent'
            }`}
          >
            <item.icon className={`w-5 h-5 mr-3 ${isActive ? 'text-brand-gold' : 'text-gray-400'}`} />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Top bar (mobile) */}
      <div className="md:hidden sticky top-0 z-40 bg-brand-black text-white border-b border-gray-800">
        <div className="flex items-center justify-between px-4 h-14">
          <button
            aria-label="Ouvrir le menu"
            className="p-2 rounded-md hover:bg-gray-900"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-brand-gold tracking-wide">Noora</h1>
          <div className="w-6 h-6" />
        </div>
      </div>

      {/* Sidebar desktop */}
      <div className="hidden md:block fixed inset-y-0 left-0 z-30 w-64 bg-brand-black text-white shadow-xl border-r border-gray-800">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 bg-brand-black border-b border-gray-800">
            <h1 className="text-2xl font-bold text-brand-gold tracking-wide">Noora</h1>
          </div>
          {/* Navigation */}
          <NavLinks />
          {/* User Profile */}
          <div className="mt-auto border-t border-gray-800 p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="flex-shrink-0">
                {isOwner ? (
                  <Crown className="w-8 h-8 text-brand-gold" />
                ) : (
                  <User className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{profile?.email}</p>
                <p className="text-xs text-gray-400 capitalize">{profile?.role === 'owner' ? 'Propriétaire' : 'Gérante'}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center w-full px-3 py-2 text-sm text-gray-300 rounded-lg hover:bg-gray-800 hover:text-brand-gold transition-colors duration-200 border border-transparent hover:border-gray-700"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      {/* Off-canvas mobile menu */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-64 bg-brand-black text-white shadow-xl border-r border-gray-800 flex flex-col">
            <div className="flex items-center justify-between h-14 px-4 border-b border-gray-800">
              <h2 className="text-lg font-bold text-brand-gold">Noora</h2>
              <button
                aria-label="Fermer le menu"
                className="p-2 rounded-md hover:bg-gray-900"
                onClick={() => setMobileOpen(false)}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <NavLinks onNavigate={() => setMobileOpen(false)} />
            <div className="mt-auto border-t border-gray-800 p-4">
              <button
                onClick={async () => { await handleSignOut(); setMobileOpen(false); }}
                className="flex items-center w-full px-3 py-2 text-sm text-gray-300 rounded-lg hover:bg-gray-800 hover:text-brand-gold transition-colors duration-200"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="md:pl-64">
        <main className="p-4 sm:p-6 pb-20 md:pb-8">
          <Outlet />
        </main>
      </div>

      {/* Bottom navigation (mobile) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-brand-black border-t border-gray-800">
        <ul className="grid grid-cols-4">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={`flex flex-col items-center justify-center py-2.5 text-xs ${isActive ? 'text-brand-gold' : 'text-gray-300'}`}
                >
                  <Icon className={`w-5 h-5 mb-1 ${isActive ? 'text-brand-gold' : 'text-gray-400'}`} />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}