import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import type { UserRole } from '../types';

interface Props {
  children: React.ReactNode;
  /** Pokud zadáno, vyžaduje konkrétní roli (nebo seznam povolených). Admin má vždy přístup. */
  requireRole?: UserRole | UserRole[];
}

export default function ProtectedRoute({ children, requireRole }: Props) {
  const { appUser, loading } = useAuthStore();
  const location = useLocation();

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <Loader2 className="w-8 h-8 text-primary-500 mx-auto mb-3 animate-spin" />
        <p className="text-sm text-surface-400">Načítám…</p>
      </div>
    );
  }

  if (!appUser) {
    // Po loginu se vrátíme na current path
    return <Navigate to="/prihlaseni" state={{ redirectTo: location.pathname + location.search }} replace />;
  }

  if (requireRole) {
    const allowed = Array.isArray(requireRole) ? requireRole : [requireRole];
    const ok = appUser.role === 'admin' || allowed.includes(appUser.role);
    if (!ok) {
      return (
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <h2 className="text-xl font-bold text-surface-100 mb-2">Nemáte oprávnění</h2>
          <p className="text-sm text-surface-400">Tato stránka vyžaduje jinou roli účtu.</p>
        </div>
      );
    }
  }

  return <>{children}</>;
}
