import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import VehicleDetailPage from './pages/VehicleDetailPage';
import FavoritesPage from './pages/FavoritesPage';
import SellPage from './pages/SellPage';
import AdvisoryPage from './pages/AdvisoryPage';
import ComparisonPage from './pages/ComparisonPage';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';
import DealerPage from './pages/DealerPage';
import ProfilePage from './pages/ProfilePage';
import DashboardLayout from './pages/DashboardLayout';
import DashboardOverview from './pages/DashboardOverview';
import DashboardListings from './pages/DashboardListings';
import DashboardInquiries from './pages/DashboardInquiries';
import { useThemeStore } from './stores/themeStore';
import { useAuthStore } from './stores/authStore';

export default function App() {
  // Initialize theme on mount (triggers rehydration side-effect)
  useThemeStore();
  const initAuth = useAuthStore((s) => s.init);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-surface-950 text-surface-100 flex flex-col">
        <Header />
        <main className="flex-1">
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/hledat" element={<SearchPage />} />
              {/* /vozidlo/{slug}-{id} — SEO friendly URL, fallback /vozidlo/{id} */}
              <Route path="/vozidlo/:slugOrId" element={<VehicleDetailPage />} />
              {/* Dealer profile page */}
              <Route path="/prodejce/:slug" element={<DealerPage />} />
              <Route path="/garaz" element={<FavoritesPage />} />
              <Route path="/oblibene" element={<FavoritesPage />} />
              <Route path="/prodat" element={<SellPage />} />
              <Route path="/poradna" element={<AdvisoryPage />} />
              <Route path="/porovnani" element={<ComparisonPage />} />
              <Route path="/prihlaseni" element={<LoginPage />} />
              <Route
                path="/profil"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              {/* Seller dashboard — jen pro prodejce */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute requireRole={['private_seller', 'dealer_admin', 'admin']}>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardOverview />} />
                <Route path="inzeraty" element={<DashboardListings />} />
                <Route path="dotazy" element={<DashboardInquiries />} />
                <Route path="profil" element={<ProfilePage />} />
              </Route>
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </ErrorBoundary>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
