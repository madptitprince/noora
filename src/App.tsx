import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './hooks/useAuth';
import { useAppInitialization } from './hooks/useAppInitialization';
import { Layout } from './components/Layout';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { ProductList } from './components/ProductList';
import { SalesList } from './components/SalesList';
import { ExpensesList } from './components/ExpensesList';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ConfigurationBanner } from './components/ConfigurationBanner';

function App() {
  const { user, loading } = useAuth();
  const { storageStatus, retryInitialization } = useAppInitialization();

  if (loading) {
    return <LoadingSpinner fullScreen text="Chargement de Noora..." />;
  }

  if (!user) {
    return (
      <ErrorBoundary>
        <Auth />
        <Toaster position="top-right" />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      {/* Banner de configuration si nécessaire */}
      <ConfigurationBanner 
        storageStatus={storageStatus} 
        onRetry={retryInitialization} 
      />
      
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<ProductList />} />
            <Route path="sales" element={<SalesList />} />
            <Route path="expenses" element={<ExpensesList />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster position="top-right" />
      </Router>
    </ErrorBoundary>
  );
}export default App;