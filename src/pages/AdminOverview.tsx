import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, ListChecks, Users, Inbox, Car, ShieldCheck, AlertTriangle } from 'lucide-react';
import { getAdminStats } from '../lib/api';

export default function AdminOverview() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: getAdminStats,
    staleTime: 30 * 1000,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-surface-50" style={{ fontFamily: 'var(--font-display)' }}>
          Přehled administrace
        </h1>
        <p className="text-sm text-surface-400 mt-0.5">Přehled stavu platformy.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
        </div>
      ) : (
        <>
          {/* Pending alert */}
          {stats && stats.pending_review > 0 && (
            <Link
              to="/admin/listings?status=pending_review"
              className="block bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 hover:bg-amber-500/15 transition-colors"
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-base font-bold text-amber-400">
                    Čeká {stats.pending_review} {stats.pending_review === 1 ? 'inzerát' : stats.pending_review < 5 ? 'inzeráty' : 'inzerátů'} na schválení
                  </p>
                  <p className="text-xs text-amber-400/80 mt-1">
                    Klikněte pro moderaci →
                  </p>
                </div>
              </div>
            </Link>
          )}

          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <KpiCard
              icon={ListChecks}
              label="Ke schválení"
              value={stats?.pending_review ?? 0}
              color="text-amber-400"
              bgColor="bg-amber-500/10"
              href="/admin/listings?status=pending_review"
              alert={!!(stats && stats.pending_review > 0)}
            />
            <KpiCard
              icon={Car}
              label="Aktivní inzeráty"
              value={stats?.published ?? 0}
              color="text-emerald-400"
              bgColor="bg-emerald-500/10"
            />
            <KpiCard
              icon={ShieldCheck}
              label="Zamítnuté"
              value={stats?.rejected ?? 0}
              color="text-red-400"
              bgColor="bg-red-500/10"
              href="/admin/listings?status=rejected"
            />
            <KpiCard
              icon={Users}
              label="Uživatelé"
              value={stats?.total_users ?? 0}
              color="text-cyan-400"
              bgColor="bg-cyan-500/10"
            />
            <KpiCard
              icon={ShieldCheck}
              label="Prodejci (dealers)"
              value={stats?.total_dealers ?? 0}
              color="text-primary-400"
              bgColor="bg-primary-500/10"
            />
            <KpiCard
              icon={Inbox}
              label="Dotazy celkem"
              value={stats?.total_inquiries ?? 0}
              color="text-fuchsia-400"
              bgColor="bg-fuchsia-500/10"
            />
          </div>
        </>
      )}
    </div>
  );
}

function KpiCard({
  icon: Icon, label, value, color, bgColor, href, alert,
}: {
  icon: typeof Car;
  label: string;
  value: number;
  color: string;
  bgColor: string;
  href?: string;
  alert?: boolean;
}) {
  const inner = (
    <div className={`bg-surface-950 rounded-xl p-4 shadow-sm ${alert ? 'ring-2 ring-amber-500/30' : ''}`}>
      <div className={`w-9 h-9 rounded-lg ${bgColor} flex items-center justify-center mb-2`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <p className="text-[10px] text-surface-500 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-extrabold text-surface-50 mt-0.5">
        {value.toLocaleString('cs-CZ')}
      </p>
    </div>
  );
  if (href) return <Link to={href} className="block hover:opacity-80 transition-opacity">{inner}</Link>;
  return inner;
}
