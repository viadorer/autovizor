import { Link, useLocation } from 'react-router-dom';
import { Search, Heart, ArrowLeftRight, User, Menu, X, Sun, Moon, Car } from 'lucide-react';
import { AutovizorLogo } from './AutovizorLogo';
import { useState } from 'react';
import { useFavoritesStore } from '../stores/favoritesStore';
import { useThemeStore } from '../stores/themeStore';

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const favoriteCount = useFavoritesStore((s) => s.favoriteIds.length);
  const { mode, toggleMode } = useThemeStore();

  const navItems = [
    { to: '/hledat', label: 'Hledat', icon: Search },
    { to: '/prodat', label: 'Prodat', icon: Car },
    { to: '/porovnani', label: 'Porovnat', icon: ArrowLeftRight },
    { to: '/poradna', label: 'Poradna', icon: Search },
  ];

  return (
    <header className="sticky top-0 z-50 bg-surface-950/95 backdrop-blur-md border-b border-surface-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <AutovizorLogo size={32} />
            <span className="text-lg font-bold text-surface-100 tracking-tight">
              Auto<span className="text-primary-400">vizor</span>
            </span>
          </Link>

          {/* Navigace - desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-surface-800 text-surface-100'
                      : 'text-surface-300 hover:text-surface-100 hover:bg-surface-900'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Pravé ikony */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMode}
              className="flex items-center justify-center w-10 h-10 rounded-lg text-surface-300 hover:text-surface-100 hover:bg-surface-800 transition-colors"
              aria-label="Přepnout motiv"
            >
              {mode === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <Link
              to="/oblibene"
              className="relative flex items-center justify-center w-10 h-10 rounded-lg text-surface-300 hover:text-surface-100 hover:bg-surface-800 transition-colors"
            >
              <Heart className="w-5 h-5" />
              {favoriteCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center font-medium">
                  {favoriteCount}
                </span>
              )}
            </Link>

            <Link
              to="/prihlaseni"
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium transition-colors"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Přihlásit se</span>
            </Link>

            {/* Hamburger */}
            <button
              className="md:hidden flex items-center justify-center w-10 h-10 text-surface-300 hover:text-surface-100"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobilní menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-surface-800 bg-surface-950">
          <nav className="px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-surface-300 hover:text-surface-100 hover:bg-surface-800 transition-colors"
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
