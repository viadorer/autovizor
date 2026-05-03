import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Car, Plus, Eye, Edit, Trash2, ExternalLink, Loader2, Check, AlertCircle } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import { useMyListings } from '../hooks/useVehicles';
import { updateVehicleStatus, deleteVehicle } from '../lib/api';
import { formatPrice, formatKm, formatRegistration } from '../lib/codebooks';
import { buildVehicleHref } from '../lib/slug';

type FilterStatus = 'all' | 'published' | 'draft' | 'pending_review' | 'sold' | 'expired';

export default function DashboardListings() {
  const { appUser } = useAuthStore();
  const { data: listings = [], isLoading } = useMyListings(appUser?.id, appUser?.dealer_id);
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [busyId, setBusyId] = useState<number | null>(null);

  if (!appUser) return null;

  const filtered = filter === 'all'
    ? listings
    : listings.filter((v) => v.published_status === filter);

  const counts = {
    all: listings.length,
    published: listings.filter((v) => v.published_status === 'published').length,
    draft: listings.filter((v) => v.published_status === 'draft').length,
    pending_review: listings.filter((v) => v.published_status === 'pending_review').length,
    sold: listings.filter((v) => v.published_status === 'sold').length,
    expired: listings.filter((v) => v.published_status === 'expired').length,
  };

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['myListings'] });

  const handleStatusChange = async (id: number, status: 'sold' | 'expired' | 'published') => {
    setBusyId(id);
    await updateVehicleStatus(id, status);
    setBusyId(null);
    refresh();
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Opravdu smazat inzerát "${title}"? Tato akce je nevratná.`)) return;
    setBusyId(id);
    await deleteVehicle(id);
    setBusyId(null);
    refresh();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold text-surface-50" style={{ fontFamily: 'var(--font-display)' }}>
            Moje inzeráty
          </h1>
          <p className="text-sm text-surface-400 mt-0.5">
            {appUser.role === 'dealer_admin' ? 'Inzeráty vašeho autobazaru' : 'Vaše osobní inzeráty'}
          </p>
        </div>
        <Link
          to="/prodat"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-br from-primary-500 to-primary-700 hover:from-primary-600 hover:to-primary-800 rounded-xl text-sm font-semibold text-white shadow-sm hover:shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          Nový inzerát
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {([
          ['all', 'Vše'],
          ['published', 'Aktivní'],
          ['pending_review', 'Ke schválení'],
          ['draft', 'Koncepty'],
          ['expired', 'Expirované'],
          ['sold', 'Prodané'],
        ] as const).map(([key, label]) => {
          const count = counts[key];
          if (key !== 'all' && count === 0) return null;
          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                filter === key
                  ? 'bg-primary-500 text-white'
                  : 'bg-surface-900 text-surface-300 hover:bg-surface-850'
              }`}
            >
              {label} ({count})
            </button>
          );
        })}
      </div>

      {/* Listings */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-surface-950 rounded-2xl p-12 text-center">
          <Car className="w-12 h-12 text-surface-700 mx-auto mb-3" />
          <p className="text-sm text-surface-400 mb-4">
            {filter === 'all'
              ? 'Ještě nemáte žádné inzeráty.'
              : 'V této kategorii nic není.'}
          </p>
          {filter === 'all' && (
            <Link
              to="/prodat"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-400 rounded-lg text-sm font-semibold text-white"
            >
              <Plus className="w-4 h-4" />
              Vytvořit první inzerát
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((v) => {
            const isBusy = busyId === v.id;
            const status = v.published_status ?? 'published';
            return (
              <div
                key={v.id}
                className="bg-surface-950 rounded-2xl shadow-sm overflow-hidden flex flex-col sm:flex-row gap-4 p-4"
              >
                {/* Image */}
                <Link
                  to={buildVehicleHref(v)}
                  className="shrink-0 w-full sm:w-32 h-32 rounded-lg overflow-hidden bg-surface-800 group relative"
                >
                  {v.main_image_url ? (
                    <img
                      src={v.main_image_url}
                      alt={v.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-surface-600">
                      <Car className="w-8 h-8" />
                    </div>
                  )}
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col">
                  <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <Link
                        to={buildVehicleHref(v)}
                        className="text-base font-bold text-surface-100 hover:text-primary-400 transition-colors line-clamp-1"
                      >
                        {v.title}
                      </Link>
                      <p className="text-sm text-surface-400 mt-0.5">
                        {formatPrice(v.price)}
                        {v.made_year && <> · {formatRegistration(v.made_month, v.made_year)}</>}
                        {v.tachometer != null && <> · {formatKm(v.tachometer)}</>}
                      </p>
                    </div>
                    <PublishStatusBadge status={status} active={!!v.is_active} />
                  </div>

                  <div className="flex items-center gap-4 mt-3 text-xs text-surface-500">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {v.views_count ?? 0} zobrazení
                    </span>
                    {v.expires_at && (
                      <span className="flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Vyprší {new Date(v.expires_at).toLocaleDateString('cs-CZ')}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 mt-auto pt-3">
                    <Link
                      to={buildVehicleHref(v)}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-900 hover:bg-surface-850 rounded-lg text-xs font-medium text-surface-200"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Zobrazit
                    </Link>

                    {/* TODO: po dokončení sell wizardu propojit edit flow */}
                    <button
                      disabled
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-900 rounded-lg text-xs font-medium text-surface-500 cursor-not-allowed opacity-50"
                      title="Editace bude dostupná po dokončení sell wizardu"
                    >
                      <Edit className="w-3 h-3" />
                      Upravit
                    </button>

                    {status === 'published' && (
                      <button
                        onClick={() => handleStatusChange(v.id, 'sold')}
                        disabled={isBusy}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 rounded-lg text-xs font-medium text-emerald-400 disabled:opacity-50"
                      >
                        <Check className="w-3 h-3" />
                        Označit prodané
                      </button>
                    )}

                    {(status === 'expired' || status === 'sold') && (
                      <button
                        onClick={() => handleStatusChange(v.id, 'published')}
                        disabled={isBusy}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-500/15 hover:bg-primary-500/25 rounded-lg text-xs font-medium text-primary-400 disabled:opacity-50"
                      >
                        <Check className="w-3 h-3" />
                        Aktivovat
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(v.id, v.title)}
                      disabled={isBusy}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-xs font-medium text-red-400 disabled:opacity-50 ml-auto"
                    >
                      {isBusy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                      Smazat
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PublishStatusBadge({ status, active }: { status: string; active: boolean }) {
  if (!active && status === 'expired') {
    return <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold uppercase tracking-wide bg-surface-800 text-surface-400 shrink-0">Expirováno</span>;
  }
  if (status === 'sold') {
    return <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold uppercase tracking-wide bg-emerald-500/15 text-emerald-400 shrink-0">Prodáno</span>;
  }
  if (status === 'pending_review') {
    return <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold uppercase tracking-wide bg-amber-500/15 text-amber-400 shrink-0">Ke schválení</span>;
  }
  if (status === 'draft') {
    return <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold uppercase tracking-wide bg-surface-800 text-surface-400 shrink-0">Koncept</span>;
  }
  if (status === 'rejected') {
    return <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold uppercase tracking-wide bg-red-500/15 text-red-400 shrink-0">Zamítnuto</span>;
  }
  return <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold uppercase tracking-wide bg-emerald-500/15 text-emerald-400 shrink-0">Aktivní</span>;
}
