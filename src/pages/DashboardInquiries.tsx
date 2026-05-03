import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  Inbox, Loader2, Mail, Phone, MessageSquare, DollarSign, Calendar,
  Check, X, AlertCircle, Car,
} from 'lucide-react';
import { useSellerInquiries } from '../hooks/useVehicles';
import { updateInquiryStatus } from '../lib/api';
import { formatPrice } from '../lib/codebooks';
import { buildVehicleHref } from '../lib/slug';
import type { InquiryWithVehicle } from '../lib/api';

type FilterStatus = 'new' | 'contacted' | 'closed' | 'spam' | 'all';

const TYPE_ICONS = {
  message: MessageSquare,
  phone_call: Phone,
  test_drive: Calendar,
  offer: DollarSign,
};

const TYPE_LABELS = {
  message: 'Dotaz',
  phone_call: 'Zpětný telefonát',
  test_drive: 'Zkušební jízda',
  offer: 'Cenová nabídka',
};

export default function DashboardInquiries() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filter, setFilter] = useState<FilterStatus>(
    (searchParams.get('status') as FilterStatus) ?? 'all'
  );
  const focusedId = searchParams.get('id') ? Number(searchParams.get('id')) : null;
  const { data: inquiries = [], isLoading } = useSellerInquiries({
    status: filter === 'all' ? undefined : filter,
    limit: 200,
  });
  const [busyId, setBusyId] = useState<number | null>(null);

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['sellerInquiries'] });
    queryClient.invalidateQueries({ queryKey: ['sellerDashboard'] });
  };

  const handleStatusChange = async (id: number, status: 'new' | 'contacted' | 'closed' | 'spam') => {
    setBusyId(id);
    await updateInquiryStatus(id, status);
    setBusyId(null);
    refresh();
  };

  const handleFilterChange = (newFilter: FilterStatus) => {
    setFilter(newFilter);
    if (newFilter === 'all') searchParams.delete('status');
    else searchParams.set('status', newFilter);
    setSearchParams(searchParams, { replace: true });
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-surface-50" style={{ fontFamily: 'var(--font-display)' }}>
          Dotazy
        </h1>
        <p className="text-sm text-surface-400 mt-0.5">
          Zájemci o vaše inzeráty. Kontaktujte je a označte status.
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {([
          ['all', 'Vše'],
          ['new', 'Nové'],
          ['contacted', 'Kontaktováno'],
          ['closed', 'Uzavřeno'],
          ['spam', 'Spam'],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => handleFilterChange(key)}
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

      {/* List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
        </div>
      ) : inquiries.length === 0 ? (
        <div className="bg-surface-950 rounded-2xl p-12 text-center">
          <Inbox className="w-12 h-12 text-surface-700 mx-auto mb-3" />
          <p className="text-sm text-surface-400">
            {filter === 'all' ? 'Zatím žádné dotazy.' : 'V této kategorii nic není.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {inquiries.map((inq) => (
            <InquiryCard
              key={inq.id}
              inquiry={inq}
              focused={focusedId === inq.id}
              busy={busyId === inq.id}
              onStatusChange={(status) => handleStatusChange(inq.id, status)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function InquiryCard({
  inquiry, focused, busy, onStatusChange,
}: {
  inquiry: InquiryWithVehicle;
  focused: boolean;
  busy: boolean;
  onStatusChange: (status: 'new' | 'contacted' | 'closed' | 'spam') => void;
}) {
  const TypeIcon = TYPE_ICONS[inquiry.inquiry_type as keyof typeof TYPE_ICONS] ?? MessageSquare;
  const typeLabel = TYPE_LABELS[inquiry.inquiry_type as keyof typeof TYPE_LABELS] ?? 'Dotaz';

  return (
    <div
      className={`bg-surface-950 rounded-2xl shadow-sm overflow-hidden transition-all ${
        focused ? 'ring-2 ring-primary-500' : ''
      }`}
    >
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Vehicle thumb */}
          {inquiry.vehicle && (
            <Link
              to={buildVehicleHref({
                id: inquiry.vehicle.id,
                slug: inquiry.vehicle.slug,
                title: inquiry.vehicle.title,
              })}
              className="shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-surface-800"
            >
              {inquiry.vehicle.main_image_url ? (
                <img src={inquiry.vehicle.main_image_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-surface-600">
                  <Car className="w-6 h-6" />
                </div>
              )}
            </Link>
          )}

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-surface-100">
                  {inquiry.buyer_name ?? 'Anonymní zájemce'}
                </p>
                {inquiry.vehicle && (
                  <Link
                    to={buildVehicleHref({
                      id: inquiry.vehicle.id,
                      slug: inquiry.vehicle.slug,
                      title: inquiry.vehicle.title,
                    })}
                    className="text-xs text-surface-400 hover:text-primary-400 truncate block mt-0.5"
                  >
                    {inquiry.vehicle.title} · {formatPrice(inquiry.vehicle.price)}
                  </Link>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 bg-surface-900 text-surface-300 rounded-md font-semibold uppercase tracking-wide">
                  <TypeIcon className="w-3 h-3" />
                  {typeLabel}
                </span>
                <StatusBadge status={inquiry.status ?? 'new'} />
              </div>
            </div>

            {/* Offer amount */}
            {inquiry.inquiry_type === 'offer' && inquiry.offer_amount && (
              <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-sm font-semibold text-amber-400">
                  Nabídka: {formatPrice(inquiry.offer_amount)}
                </span>
                {inquiry.vehicle && (
                  <span className="text-xs text-amber-400/70">
                    (cena: {formatPrice(inquiry.vehicle.price)})
                  </span>
                )}
              </div>
            )}

            {/* Contact info */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-surface-400">
              {inquiry.buyer_email && (
                <a href={`mailto:${inquiry.buyer_email}`} className="flex items-center gap-1.5 hover:text-primary-400">
                  <Mail className="w-3 h-3" />
                  {inquiry.buyer_email}
                </a>
              )}
              {inquiry.buyer_phone && (
                <a href={`tel:${inquiry.buyer_phone}`} className="flex items-center gap-1.5 hover:text-primary-400">
                  <Phone className="w-3 h-3" />
                  {inquiry.buyer_phone}
                </a>
              )}
              <span className="text-surface-500">
                {new Date(inquiry.created_at).toLocaleString('cs-CZ', {
                  day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                })}
              </span>
            </div>

            {/* Message */}
            <div className="mt-3 p-3 bg-surface-900 rounded-lg">
              <p className="text-sm text-surface-200 whitespace-pre-wrap">{inquiry.buyer_message}</p>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2 mt-4">
              {inquiry.buyer_email && (
                <a
                  href={`mailto:${inquiry.buyer_email}?subject=${encodeURIComponent(`Re: ${inquiry.vehicle?.title ?? 'Vaše dotaz'}`)}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-500 hover:bg-primary-400 rounded-lg text-xs font-semibold text-white"
                >
                  <Mail className="w-3 h-3" />
                  Odpovědět e-mailem
                </a>
              )}
              {inquiry.buyer_phone && (
                <a
                  href={`tel:${inquiry.buyer_phone}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-900 hover:bg-surface-850 rounded-lg text-xs font-semibold text-surface-200"
                >
                  <Phone className="w-3 h-3" />
                  Zavolat
                </a>
              )}

              {/* Status mutations */}
              <div className="ml-auto flex flex-wrap gap-2">
                {inquiry.status !== 'contacted' && (
                  <button
                    onClick={() => onStatusChange('contacted')}
                    disabled={busy}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 rounded-lg text-xs font-semibold text-emerald-400 disabled:opacity-50"
                  >
                    {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                    Kontaktováno
                  </button>
                )}
                {inquiry.status !== 'closed' && inquiry.status !== 'spam' && (
                  <button
                    onClick={() => onStatusChange('closed')}
                    disabled={busy}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-900 hover:bg-surface-800 rounded-lg text-xs font-semibold text-surface-300 disabled:opacity-50"
                  >
                    <X className="w-3 h-3" />
                    Uzavřít
                  </button>
                )}
                {inquiry.status !== 'spam' && (
                  <button
                    onClick={() => onStatusChange('spam')}
                    disabled={busy}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-xs font-semibold text-red-400 disabled:opacity-50"
                  >
                    <AlertCircle className="w-3 h-3" />
                    Spam
                  </button>
                )}
              </div>
            </div>

            {inquiry.contacted_at && (
              <p className="mt-2 text-[10px] text-emerald-400/70 inline-flex items-center gap-1">
                <Check className="w-3 h-3" />
                Kontaktováno {new Date(inquiry.contacted_at).toLocaleString('cs-CZ', { day: 'numeric', month: 'short' })}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
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
