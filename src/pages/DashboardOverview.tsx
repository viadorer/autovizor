import { Link } from 'react-router-dom';
import { Car, Inbox, Eye, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useSellerDashboard, useMyListings, useSellerInquiries } from '../hooks/useVehicles';
import { formatPrice } from '../lib/codebooks';
import { buildVehicleHref } from '../lib/slug';

export default function DashboardOverview() {
  const { appUser } = useAuthStore();
  const { data: dashboard, isLoading: dashboardLoading } = useSellerDashboard(appUser?.id);
  const { data: listings = [] } = useMyListings(appUser?.id, appUser?.dealer_id);
  const { data: recentInquiries = [], isLoading: inquiriesLoading } = useSellerInquiries({ limit: 5 });

  if (!appUser) return null;

  const activeListings = listings.filter((v) => v.is_active && v.published_status === 'published').length;
  const draftListings = listings.filter((v) => v.published_status === 'draft' || v.published_status === 'pending_review').length;
  const totalViews = listings.reduce((sum, v) => sum + (v.views_count ?? 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-surface-50 mb-1" style={{ fontFamily: 'var(--font-display)' }}>
          Přehled
        </h1>
        <p className="text-sm text-surface-400">
          Vítej zpět, {appUser.name?.split(' ')[0] ?? 'prodejce'}.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          icon={Car}
          label="Aktivní inzeráty"
          value={activeListings}
          color="text-primary-400"
          bgColor="bg-primary-500/10"
          loading={dashboardLoading}
        />
        <KpiCard
          icon={Inbox}
          label="Nové dotazy"
          value={dashboard?.new_inquiries ?? 0}
          color="text-emerald-400"
          bgColor="bg-emerald-500/10"
          loading={dashboardLoading}
          href="/dashboard/dotazy"
        />
        <KpiCard
          icon={Eye}
          label="Zobrazení 30 dní"
          value={dashboard?.total_views_30d ?? totalViews}
          color="text-cyan-400"
          bgColor="bg-cyan-500/10"
          loading={dashboardLoading}
        />
        <KpiCard
          icon={ShieldCheck}
          label="Rozpracované"
          value={draftListings}
          color="text-amber-400"
          bgColor="bg-amber-500/10"
          loading={false}
        />
      </div>

      {/* Recent inquiries */}
      <div className="bg-surface-950 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-surface-50">Nedávné dotazy</h2>
          <Link
            to="/dashboard/dotazy"
            className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300"
          >
            Vše
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {inquiriesLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 text-surface-500 animate-spin" />
          </div>
        ) : recentInquiries.length === 0 ? (
          <div className="text-center py-8">
            <Inbox className="w-10 h-10 text-surface-700 mx-auto mb-2" />
            <p className="text-sm text-surface-400">Zatím žádné dotazy.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentInquiries.map((inq) => (
              <Link
                key={inq.id}
                to={`/dashboard/dotazy?id=${inq.id}`}
                className="flex items-center gap-3 p-3 bg-surface-900 hover:bg-surface-850 rounded-lg transition-colors group"
              >
                {inq.vehicle?.main_image_url ? (
                  <img
                    src={inq.vehicle.main_image_url}
                    alt=""
                    className="w-12 h-12 rounded-lg object-cover bg-surface-800 shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-surface-800 flex items-center justify-center text-surface-600 shrink-0">
                    <Car className="w-5 h-5" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-surface-100 truncate">
                    {inq.buyer_name ?? inq.buyer_email ?? 'Anonymní zájemce'}
                  </p>
                  <p className="text-xs text-surface-400 truncate">
                    {inq.vehicle?.title ?? `Vozidlo #${inq.vehicle_id}`}
                  </p>
                  <p className="text-xs text-surface-500 truncate mt-0.5">
                    {inq.buyer_message.slice(0, 80)}{inq.buyer_message.length > 80 ? '…' : ''}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <StatusBadge status={inq.status ?? 'new'} />
                  <p className="text-[10px] text-surface-500 mt-1">
                    {new Date(inq.created_at).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Recent listings */}
      <div className="bg-surface-950 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-surface-50">Nedávné inzeráty</h2>
          <Link
            to="/dashboard/inzeraty"
            className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300"
          >
            Vše
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {listings.length === 0 ? (
          <div className="text-center py-8">
            <Car className="w-10 h-10 text-surface-700 mx-auto mb-2" />
            <p className="text-sm text-surface-400 mb-3">Ještě nemáte žádné inzeráty.</p>
            <Link
              to="/prodat"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-400 rounded-lg text-sm font-semibold text-white"
            >
              Vytvořit první inzerát
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {listings.slice(0, 5).map((v) => (
              <Link
                key={v.id}
                to={buildVehicleHref(v)}
                className="flex items-center gap-3 p-3 bg-surface-900 hover:bg-surface-850 rounded-lg transition-colors"
              >
                {v.main_image_url ? (
                  <img src={v.main_image_url} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-surface-800 flex items-center justify-center text-surface-600 shrink-0">
                    <Car className="w-5 h-5" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-surface-100 truncate">{v.title}</p>
                  <p className="text-xs text-surface-500">
                    {formatPrice(v.price)} · {v.views_count ?? 0} zobrazení
                  </p>
                </div>
                <PublishStatusBadge status={v.published_status ?? 'published'} active={!!v.is_active} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function KpiCard({
  icon: Icon, label, value, color, bgColor, loading, href,
}: {
  icon: typeof Car;
  label: string;
  value: number;
  color: string;
  bgColor: string;
  loading?: boolean;
  href?: string;
}) {
  const inner = (
    <div className="bg-surface-950 rounded-xl p-4 shadow-sm">
      <div className={`w-9 h-9 rounded-lg ${bgColor} flex items-center justify-center mb-2`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <p className="text-[10px] text-surface-500 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-extrabold text-surface-50 mt-0.5">
        {loading ? <Loader2 className="w-5 h-5 animate-spin text-surface-600" /> : value.toLocaleString('cs-CZ')}
      </p>
    </div>
  );
  if (href) return <Link to={href} className="block hover:opacity-80 transition-opacity">{inner}</Link>;
  return inner;
}

function StatusBadge({ status }: { status: string }) {
  const labels: Record<string, { label: string; className: string }> = {
    new: { label: 'Nové', className: 'bg-primary-500/15 text-primary-400' },
    contacted: { label: 'Kontaktováno', className: 'bg-emerald-500/15 text-emerald-400' },
    closed: { label: 'Uzavřeno', className: 'bg-surface-800 text-surface-400' },
    spam: { label: 'Spam', className: 'bg-red-500/15 text-red-400' },
  };
  const meta = labels[status] ?? labels.new;
  return (
    <span className={`inline-block text-[10px] px-2 py-0.5 rounded-md font-semibold uppercase tracking-wide ${meta.className}`}>
      {meta.label}
    </span>
  );
}

function PublishStatusBadge({ status, active }: { status: string; active: boolean }) {
  if (!active && status === 'expired') {
    return <span className="inline-block text-[10px] px-2 py-0.5 rounded-md font-semibold uppercase tracking-wide bg-surface-800 text-surface-400">Expirováno</span>;
  }
  if (status === 'sold') {
    return <span className="inline-block text-[10px] px-2 py-0.5 rounded-md font-semibold uppercase tracking-wide bg-emerald-500/15 text-emerald-400">Prodáno</span>;
  }
  if (status === 'pending_review') {
    return <span className="inline-block text-[10px] px-2 py-0.5 rounded-md font-semibold uppercase tracking-wide bg-amber-500/15 text-amber-400">Ke schválení</span>;
  }
  if (status === 'draft') {
    return <span className="inline-block text-[10px] px-2 py-0.5 rounded-md font-semibold uppercase tracking-wide bg-surface-800 text-surface-400">Koncept</span>;
  }
  if (status === 'rejected') {
    return <span className="inline-block text-[10px] px-2 py-0.5 rounded-md font-semibold uppercase tracking-wide bg-red-500/15 text-red-400">Zamítnuto</span>;
  }
  return <span className="inline-block text-[10px] px-2 py-0.5 rounded-md font-semibold uppercase tracking-wide bg-emerald-500/15 text-emerald-400">Aktivní</span>;
}
