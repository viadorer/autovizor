import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Warehouse, ArrowLeftRight, User, Menu, X, Sun, Moon, Car, LogOut, Settings, ChevronDown, ShieldCheck } from 'lucide-react';
import { AutovizorLogo } from './AutovizorLogo';
import { useEffect, useRef, useState } from 'react';
import { useFavoritesStore } from '../stores/favoritesStore';
import { useThemeStore } from '../stores/themeStore';
import { useAuthStore } from '../stores/authStore';

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const garageCount = useFavoritesStore((s) => s.favoriteIds.length);
  const { mode, toggleMode } = useThemeStore();
  const { appUser, signOut } = useAuthStore();

  const navItems = [
    { to: '/hledat', label: 'Hledat', icon: Search },
    { to: '/prodat', label: 'Prodat', icon: Car },
    { to: '/porovnani', label: 'Porovnat', icon: ArrowLeftRight },
    { to: '/poradna', label: 'Poradna', icon: Search },
  ];

  // Click outside to close user menu
  useEffect(() => {
    if (!userMenuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [userMenuOpen]);

  const handleLogout = async () => {
    await signOut();
    setUserMenuOpen(false);
    navigate('/');
  };

  const userInitials = appUser?.name
    ? appUser.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
    : appUser?.email?.[0].toUpperCase() ?? '?';

  return (
    <header className="sticky top-0 z-50 bg-surface-950/95 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <AutovizorLogo size={24} />
            <span className="text-2xl font-bold text-surface-100 tracking-tight">
              Auto<span className="text-primary-600">vizor</span>
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
              to="/garaz"
              className="relative flex items-center justify-center w-10 h-10 rounded-lg text-surface-300 hover:text-surface-100 hover:bg-surface-800 transition-colors"
              title="Moje garáž"
            >
              <Warehouse className="w-5 h-5" />
              {garageCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center font-medium">
                  {garageCount}
                </span>
              )}
            </Link>

            {/* Auth state: přihlášený user nebo login button */}
            {appUser ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-surface-800 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-xs font-bold">
                    {userInitials}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-surface-400 hidden sm:block" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-surface-900 rounded-xl shadow-2xl border border-surface-800 overflow-hidden">
                    <div className="px-4 py-3 border-b border-surface-800">
                      <p className="text-sm font-semibold text-surface-100 truncate">
                        {appUser.name ?? appUser.email}
                      </p>
                      <p className="text-xs text-surface-500 truncate">{appUser.email}</p>
                      <span className="inline-block mt-1.5 text-[10px] px-1.5 py-0.5 bg-surface-800 text-surface-300 rounded uppercase tracking-wide">
                        {appUser.role === 'private_seller' ? 'Soukromý prodejce'
                          : appUser.role === 'dealer_admin' ? 'Dealer admin'
                          : appUser.role === 'admin' ? 'Admin'
                          : 'Kupující'}
                      </span>
                    </div>
                    <div className="py-1">
                      <Link
                        to="/profil"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-surface-200 hover:bg-surface-850 hover:text-surface-100"
                      >
                        <Settings className="w-4 h-4" />
                        Můj profil
                      </Link>
                      <Link
                        to="/garaz"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-surface-200 hover:bg-surface-850 hover:text-surface-100"
                      >
                        <Warehouse className="w-4 h-4" />
                        Moje garáž
                      </Link>
                      {(appUser.role === 'private_seller' || appUser.role === 'dealer_admin' || appUser.role === 'admin') && (
                        <Link
                          to="/prodat"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-surface-200 hover:bg-surface-850 hover:text-surface-100"
                        >
                          <Car className="w-4 h-4" />
                          Inzerovat vůz
                        </Link>
                      )}
                      {appUser.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-surface-200 hover:bg-surface-850 hover:text-surface-100"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          Administrace
                        </Link>
                      )}
                    </div>
                    <div className="border-t border-surface-800 py-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-surface-200 hover:bg-surface-850 hover:text-surface-100"
                      >
                        <LogOut className="w-4 h-4" />
                        Odhlásit
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/prihlaseni"
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 hover:from-primary-600 hover:to-primary-800 text-white text-sm font-medium transition-all"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Přihlásit se</span>
              </Link>
            )}

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
        <div className="md:hidden bg-surface-950">
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
            {appUser && (
              <Link
                to="/profil"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-surface-300 hover:text-surface-100 hover:bg-surface-800 transition-colors"
              >
                <Settings className="w-5 h-5" />
                Můj profil
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
