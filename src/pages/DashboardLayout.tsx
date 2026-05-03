import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Car, Inbox, User, Plus, ExternalLink, Settings } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useSellerInquiries } from '../hooks/useVehicles';

export default function DashboardLayout() {
  const { appUser } = useAuthStore();
  const { data: newInquiries = [] } = useSellerInquiries({ status: 'new', limit: 50 });
  const newInquiryCount = newInquiries.length;
  const location = useLocation();

  if (!appUser) return null;

  const navItems = [
    { to: '/dashboard', label: 'Přehled', icon: LayoutDashboard, exact: true },
    { to: '/dashboard/inzeraty', label: 'Moje inzeráty', icon: Car },
    { to: '/dashboard/dotazy', label: 'Dotazy', icon: Inbox, badge: newInquiryCount },
    { to: '/dashboard/profil', label: 'Profil', icon: User },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <aside className="w-full lg:w-60 shrink-0">
          <div className="lg:sticky lg:top-20 space-y-3">
            {/* User card */}
            <div className="bg-surface-950 rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-sm">
                  {(appUser.name ?? appUser.email)[0].toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-surface-100 truncate">{appUser.name ?? appUser.email}</p>
                  <p className="text-[10px] text-surface-500 uppercase tracking-wide">
                    {appUser.role === 'private_seller' ? 'Soukromý prodejce'
                      : appUser.role === 'dealer_admin' ? 'Dealer'
                      : appUser.role === 'admin' ? 'Admin'
                      : 'Kupující'}
                  </p>
                </div>
              </div>
              {appUser.dealer_id && (
                <Link
                  to={`/prodejce/${appUser.dealer_id}`}
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-surface-900 hover:bg-surface-850 rounded-lg text-xs text-surface-300 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  Veřejný profil
                </Link>
              )}
            </div>

            {/* Nav */}
            <nav className="bg-surface-950 rounded-xl p-2 shadow-sm">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.exact}
                  className={({ isActive }) => `
                    flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-sm transition-colors
                    ${isActive
                      ? 'bg-primary-500/15 text-primary-400 font-semibold'
                      : 'text-surface-300 hover:bg-surface-900 hover:text-surface-100'}
                  `}
                >
                  <span className="flex items-center gap-2">
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </span>
                  {item.badge && item.badge > 0 ? (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-primary-500 text-white rounded-full min-w-[18px] text-center">
                      {item.badge}
                    </span>
                  ) : null}
                </NavLink>
              ))}
            </nav>

            {/* CTA */}
            <Link
              to="/prodat"
              className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-br from-primary-500 to-primary-700 hover:from-primary-600 hover:to-primary-800 rounded-xl text-sm font-semibold text-white transition-all shadow-sm hover:shadow-md"
            >
              <Plus className="w-4 h-4" />
              Nový inzerát
            </Link>

            {/* Help */}
            <Link
              to="/poradna"
              className="flex items-center gap-2 px-3 py-2 text-xs text-surface-500 hover:text-surface-300 transition-colors"
            >
              <Settings className="w-3 h-3" />
              Nápověda
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
