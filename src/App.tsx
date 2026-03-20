import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import VehicleDetailPage from './pages/VehicleDetailPage';
import FavoritesPage from './pages/FavoritesPage';
import SellPage from './pages/SellPage';
import AdvisoryPage from './pages/AdvisoryPage';
import ComparisonPage from './pages/ComparisonPage';
import LoginPage from './pages/LoginPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-surface-950 text-white flex flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/hledat" element={<SearchPage />} />
            <Route path="/vozidlo/:id" element={<VehicleDetailPage />} />
            <Route path="/oblibene" element={<FavoritesPage />} />
            <Route path="/prodat" element={<SellPage />} />
            <Route path="/poradna" element={<AdvisoryPage />} />
            <Route path="/porovnani" element={<ComparisonPage />} />
            <Route path="/prihlaseni" element={<LoginPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
