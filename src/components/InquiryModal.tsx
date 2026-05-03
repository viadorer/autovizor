import { useEffect, useRef, useState } from 'react';
import { X, Mail, Phone, Calendar, DollarSign, Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import type { Vehicle, InquiryType } from '../types';
import { createInquiry } from '../lib/api';
import { checkRateLimit, formatResetTime } from '../lib/rate-limit';
import { formatPrice } from '../lib/codebooks';

interface Props {
  vehicle: Vehicle;
  onClose: () => void;
  initialType?: InquiryType;
}

const TYPE_OPTIONS: { value: InquiryType; label: string; icon: typeof Mail; description: string }[] = [
  { value: 'message', label: 'Mám dotaz', icon: Mail, description: 'Zeptat se na vůz, dohodnout prohlídku.' },
  { value: 'phone_call', label: 'Zavolat zpět', icon: Phone, description: 'Prodejce vás zavolá v dohodnutý čas.' },
  { value: 'test_drive', label: 'Zkušební jízda', icon: Calendar, description: 'Sjednat termín zkušební jízdy.' },
  { value: 'offer', label: 'Nabídnout cenu', icon: DollarSign, description: 'Učinit závaznou nabídku ceny.' },
];

const DEFAULT_MESSAGES: Record<InquiryType, string> = {
  message: 'Dobrý den, zaujal mě tento vůz. Mohli bychom se domluvit na prohlídce?',
  phone_call: 'Dobrý den, prosím o zpětný telefonát ohledně tohoto vozu.',
  test_drive: 'Dobrý den, rád bych si vůz vyzkoušel na zkušební jízdě. Kdy by se Vám to hodilo?',
  offer: 'Dobrý den, mám zájem o tento vůz. Předkládám následující nabídku.',
};

const RATE_LIMIT_PER_HOUR = 5;
const HOUR_MS = 60 * 60 * 1000;

export default function InquiryModal({ vehicle, onClose, initialType = 'message' }: Props) {
  const [type, setType] = useState<InquiryType>(initialType);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState(DEFAULT_MESSAGES[initialType]);
  const [offerAmount, setOfferAmount] = useState<string>(String(Math.round(vehicle.price * 0.9)));
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimited, setRateLimited] = useState<{ resetAt: number } | null>(null);

  const dialogRef = useRef<HTMLDivElement>(null);

  // ESC to close, body scroll lock
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const handleTypeChange = (newType: InquiryType) => {
    setType(newType);
    // Auto-update default message jen pokud user nezačal psát vlastní
    const prevDefaults = Object.values(DEFAULT_MESSAGES);
    if (prevDefaults.includes(message) || message === '') {
      setMessage(DEFAULT_MESSAGES[newType]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (!email && !phone) {
      setError('Zadejte e-mail nebo telefon, abychom Vás mohli kontaktovat.');
      return;
    }
    if (!agreed) {
      setError('Pro odeslání je potřeba souhlas se zpracováním osobních údajů.');
      return;
    }

    // Rate limit (5 dotazů / hodinu / browser)
    const rl = checkRateLimit('inquiry', RATE_LIMIT_PER_HOUR, HOUR_MS);
    if (!rl.ok) {
      setRateLimited({ resetAt: rl.resetAt });
      return;
    }

    setSubmitting(true);
    setError(null);

    const result = await createInquiry({
      vehicle_id: vehicle.id,
      buyer_name: name || undefined,
      buyer_email: email || undefined,
      buyer_phone: phone || undefined,
      buyer_message: message,
      inquiry_type: type,
      offer_amount: type === 'offer' ? Number(offerAmount) || undefined : undefined,
    });

    setSubmitting(false);

    if (result) {
      setSuccess(true);
      setTimeout(onClose, 2500);
    } else {
      setError('Odeslání selhalo. Zkuste to prosím znovu nebo kontaktujte prodejce přímo.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="inquiry-modal-title"
    >
      <div
        ref={dialogRef}
        className="bg-surface-950 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 bg-surface-950 px-6 pt-5 pb-3 border-b border-surface-800 flex items-start justify-between gap-4 z-10">
          <div className="min-w-0 flex-1">
            <h2 id="inquiry-modal-title" className="text-lg font-bold text-surface-50">
              Kontakt prodejce
            </h2>
            <p className="text-xs text-surface-400 mt-0.5 truncate">
              {vehicle.title} • {formatPrice(vehicle.price)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-surface-400 hover:text-surface-100 hover:bg-surface-800"
            aria-label="Zavřít"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center">
            <CheckCircle className="w-14 h-14 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-surface-50 mb-2">Dotaz odeslán!</h3>
            <p className="text-sm text-surface-400">
              Prodejce Vás brzy kontaktuje. Děkujeme.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Type selector */}
            <div>
              <label className="block text-xs font-medium text-surface-400 mb-2">Typ dotazu</label>
              <div className="grid grid-cols-2 gap-2">
                {TYPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleTypeChange(opt.value)}
                    className={`flex items-start gap-2 p-3 rounded-xl text-left text-sm transition-colors ${
                      type === opt.value
                        ? 'bg-primary-500/15 border border-primary-500/40 text-primary-300'
                        : 'bg-surface-900 border border-transparent text-surface-300 hover:bg-surface-850'
                    }`}
                  >
                    <opt.icon className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold">{opt.label}</div>
                      <div className="text-[10px] text-surface-500 mt-0.5 leading-snug">{opt.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Offer amount (jen pro offer type) */}
            {type === 'offer' && (
              <div>
                <label className="block text-xs font-medium text-surface-400 mb-1">
                  Vaše cenová nabídka
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={offerAmount}
                    onChange={(e) => setOfferAmount(e.target.value)}
                    className="w-full bg-surface-900 rounded-lg pl-3 pr-12 py-2.5 text-sm text-surface-100 outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Např. 280 000"
                    min={0}
                    step={1000}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-surface-500">Kč</span>
                </div>
                <p className="text-[10px] text-surface-500 mt-1">
                  Vyvolávací cena: {formatPrice(vehicle.price)}
                </p>
              </div>
            )}

            {/* Buyer fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-surface-400 mb-1">Jméno</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-surface-900 rounded-lg px-3 py-2.5 text-sm text-surface-100 outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Vaše jméno"
                  autoComplete="name"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-400 mb-1">Telefon</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-surface-900 rounded-lg px-3 py-2.5 text-sm text-surface-100 outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="+420…"
                  autoComplete="tel"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-surface-400 mb-1">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface-900 rounded-lg px-3 py-2.5 text-sm text-surface-100 outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="vy@example.cz"
                autoComplete="email"
              />
              <p className="text-[10px] text-surface-500 mt-1">Stačí vyplnit alespoň e-mail nebo telefon.</p>
            </div>

            {/* Message */}
            <div>
              <label className="block text-xs font-medium text-surface-400 mb-1">Zpráva</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full bg-surface-900 rounded-lg px-3 py-2.5 text-sm text-surface-100 outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                required
                minLength={10}
                maxLength={1000}
              />
              <p className="text-[10px] text-surface-500 mt-1">{message.length}/1000 znaků</p>
            </div>

            {/* GDPR consent */}
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-surface-600 bg-surface-800 text-primary-600 focus:ring-primary-600"
              />
              <span className="text-xs text-surface-400 leading-relaxed">
                Souhlasím se zpracováním osobních údajů pro účely zpracování tohoto dotazu.
                Údaje budou předány prodejci.
              </span>
            </label>

            {error && (
              <div className="flex items-start gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {rateLimited && (
              <div className="flex items-start gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-400">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Přesáhli jste limit dotazů (5/hodinu). Zkuste to znovu {formatResetTime(rateLimited.resetAt)}.
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !!rateLimited}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-br from-primary-500 to-primary-700 hover:from-primary-600 hover:to-primary-800 rounded-xl text-sm font-semibold text-white transition-all shadow-sm hover:shadow-md disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {submitting ? 'Odesílám…' : 'Odeslat dotaz'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
