import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { ShieldCheck, ListChecks, Users, Inbox, BarChart3, Settings } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

export default function AdminLayout() {
  const { appUser } = useAuthStore();
  const location = useLocation();

  if (!appUser) return null;

  const navItems = [
    { to: '/admin', label: 'Přehled', icon: BarChart3, exact: true },
    { to: '/admin/listings', label: 'Inzeráty', icon: ListChecks },
    { to: '/admin/users', label: 'Uživatelé', icon: Users },
    { to: '/admin/inquiries', label: 'Dotazy', icon: Inbox },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <aside className="w-full lg:w-60 shrink-0">
          <div className="lg:sticky lg:top-20 space-y-3">
            {/* Admin badge */}
            <div className="bg-gradient-to-br from-primary-500/10 to-accent-500/5 rounded-xl p-4 border border-primary-500/20">
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="w-5 h-5 text-primary-500" />
                <p className="text-sm font-bold text-surface-50">Administrace</p>
              </div>
              <p className="text-xs text-surface-400">{appUser.email}</p>
            </div>

            {/* Nav */}
            <nav className="bg-surface-950 rounded-xl p-2 shadow-sm">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.exact}
                  className={({ isActive }) => `
                    flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-colors
                    ${isActive
                      ? 'bg-primary-500/15 text-primary-400 font-semibold'
                      : 'text-surface-300 hover:bg-surface-900 hover:text-surface-100'}
                  `}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <Link
              to="/dashboard"
              className="flex items-center gap-2 px-3 py-2 text-xs text-surface-500 hover:text-surface-300"
            >
              <Settings className="w-3 h-3" />
              Můj prodejní dashboard
            </Link>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <Outlet key={location.pathname} />
        </main>
      </div>
    </div>
  );
}
