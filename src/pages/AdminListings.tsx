import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Loader2, Check, X, Eye, ExternalLink, Search, Car, AlertCircle, Calendar, Gauge, Zap,
} from 'lucide-react';
import { getPendingListings, approveListing, rejectListing } from '../lib/api';
import { formatPrice, formatKm, formatRegistration } from '../lib/codebooks';
import { buildVehicleHref } from '../lib/slug';

type Status = 'pending_review' | 'rejected' | 'published' | 'all';

export default function AdminListings() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filter, setFilter] = useState<Status>(
    (searchParams.get('status') as Status) ?? 'pending_review'
  );
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState<number | null>(null);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ['adminListings', filter, search],
    queryFn: () => getPendingListings({
      status: filter === 'published' ? undefined : filter,
      search: search || undefined,
      limit: 100,
    }),
    staleTime: 15 * 1000,
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['adminListings'] });
    queryClient.invalidateQueries({ queryKey: ['adminStats'] });
  };

  const handleApprove = async (id: number) => {
    setBusyId(id);
    await approveListing(id);
    setBusyId(null);
    refresh();
  };

  const handleReject = async (id: number) => {
    if (!rejectReason.trim()) {
      alert('Zadejte důvod zamítnutí.');
      return;
    }
    setBusyId(id);
    await rejectListing(id, rejectReason);
    setBusyId(null);
    setRejectingId(null);
    setRejectReason('');
    refresh();
  };

  const setStatusFilter = (newFilter: Status) => {
    setFilter(newFilter);
    if (newFilter === 'pending_review') searchParams.delete('status');
    else searchParams.set('status', newFilter);
    setSearchParams(searchParams, { replace: true });
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-surface-50" style={{ fontFamily: 'var(--font-display)' }}>
          Moderace inzerátů
        </h1>
        <p className="text-sm text-surface-400 mt-0.5">
          Schvalování nových inzerátů od soukromých prodejců.
        </p>
      </div>

      {/* Filter + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {([
            ['pending_review', 'Ke schválení'],
            ['published', 'Aktivní'],
            ['rejected', 'Zamítnuté'],
            ['all', 'Vše'],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                filter === key
                  ? 'bg-primary-500 text-white'
                  : 'bg-surface-900 text-surface-300 hover:bg-surface-850'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Hledat podle názvu…"
            className="w-full bg-surface-900 rounded-lg pl-10 pr-3 py-2 text-sm text-surface-100 outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
        </div>
      ) : listings.length === 0 ? (
        <div className="bg-surface-950 rounded-2xl p-12 text-center">
          <Check className="w-12 h-12 text-emerald-500/50 mx-auto mb-3" />
          <p className="text-sm text-surface-400">
            {filter === 'pending_review'
              ? 'Žádné inzeráty k moderaci. 🎉'
              : 'V této kategorii nic není.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map((v) => {
            const isBusy = busyId === v.id;
            const isRejecting = rejectingId === v.id;
            return (
              <div key={v.id} className="bg-surface-950 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-5 flex flex-col md:flex-row gap-4">
                  {/* Image */}
                  <div className="shrink-0 w-full md:w-40 h-32 rounded-lg overflow-hidden bg-surface-800">
                    {v.main_image_url ? (
                      <img src={v.main_image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-surface-600">
                        <Car className="w-8 h-8" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3 flex-wrap">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-bold text-surface-100">{v.title}</h3>
                        <p className="text-lg font-extrabold text-surface-50 mt-1">{formatPrice(v.price)}</p>
                      </div>
                      <StatusBadge status={v.published_status ?? 'published'} />
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-surface-400">
                      {v.made_year && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatRegistration(v.made_month, v.made_year)}
                        </span>
                      )}
                      {v.tachometer != null && (
                        <span className="flex items-center gap-1">
                          <Gauge className="w-3 h-3" />
                          {formatKm(v.tachometer)}
                        </span>
                      )}
                      {v.engine_power && (
                        <span className="flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          {v.engine_power} kW
                        </span>
                      )}
                    </div>

                    {/* Seller info */}
                    <div className="mt-2 text-xs text-surface-500">
                      Prodejce: <strong className="text-surface-300">{v.seller_name ?? 'Neznámý'}</strong>
                      {v.seller_email && <> · {v.seller_email}</>}
                      {v.dealer_id && (
                        <> · <Link to={`/prodejce/${v.dealer_id}`} className="text-primary-400 hover:underline">profil</Link></>
                      )}
                    </div>

                    {v.description && (
                      <p className="mt-2 text-xs text-surface-400 line-clamp-2">{v.description}</p>
                    )}

                    {v.deactivation_reason && (
                      <div className="mt-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">
                        <AlertCircle className="w-3 h-3 inline mr-1" />
                        Zamítnuto: {v.deactivation_reason}
                      </div>
                    )}

                    {/* Reject reason input */}
                    {isRejecting && (
                      <div className="mt-3 space-y-2">
                        <input
                          type="text"
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="Důvod zamítnutí (např. chybí fotky, nereálná cena)"
                          className="w-full bg-surface-900 rounded-lg px-3 py-2 text-sm text-surface-100 outline-none focus:ring-2 focus:ring-red-500"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleReject(v.id)}
                            disabled={isBusy || !rejectReason.trim()}
                            className="px-3 py-1.5 bg-red-500 hover:bg-red-400 disabled:opacity-50 rounded-lg text-xs font-semibold text-white"
                          >
                            Potvrdit zamítnutí
                          </button>
                          <button
                            onClick={() => { setRejectingId(null); setRejectReason(''); }}
                            className="px-3 py-1.5 bg-surface-900 hover:bg-surface-850 rounded-lg text-xs text-surface-300"
                          >
                            Zrušit
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    {!isRejecting && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Link
                          to={buildVehicleHref(v)}
                          target="_blank"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-900 hover:bg-surface-850 rounded-lg text-xs font-medium text-surface-200"
                        >
                          <Eye className="w-3 h-3" />
                          Detail
                          <ExternalLink className="w-3 h-3" />
                        </Link>

                        {v.published_status === 'pending_review' && (
                          <>
                            <button
                              onClick={() => handleApprove(v.id)}
                              disabled={isBusy}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 rounded-lg text-xs font-semibold text-white"
                            >
                              {isBusy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                              Schválit
                            </button>
                            <button
                              onClick={() => setRejectingId(v.id)}
                              disabled={isBusy}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-xs font-semibold text-red-400 disabled:opacity-50"
                            >
                              <X className="w-3 h-3" />
                              Zamítnout
                            </button>
                          </>
                        )}

                        {v.published_status === 'rejected' && (
                          <button
                            onClick={() => handleApprove(v.id)}
                            disabled={isBusy}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 rounded-lg text-xs font-semibold text-emerald-400 disabled:opacity-50"
                          >
                            <Check className="w-3 h-3" />
                            Přesto schválit
                          </button>
                        )}
                      </div>
                    )}
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

function StatusBadge({ status }: { status: string }) {
  const labels: Record<string, { label: string; className: string }> = {
    pending_review: { label: 'Ke schválení', className: 'bg-amber-500/15 text-amber-400' },
    published: { label: 'Aktivní', className: 'bg-emerald-500/15 text-emerald-400' },
    rejected: { label: 'Zamítnuto', className: 'bg-red-500/15 text-red-400' },
    draft: { label: 'Koncept', className: 'bg-surface-800 text-surface-400' },
    expired: { label: 'Expirováno', className: 'bg-surface-800 text-surface-400' },
    sold: { label: 'Prodáno', className: 'bg-emerald-500/15 text-emerald-400' },
  };
  const meta = labels[status] ?? labels.pending_review;
  return (
    <span className={`inline-block text-[10px] px-2 py-0.5 rounded-md font-semibold uppercase tracking-wide shrink-0 ${meta.className}`}>
      {meta.label}
    </span>
  );
}
