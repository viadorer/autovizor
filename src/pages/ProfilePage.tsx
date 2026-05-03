import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User as UserIcon, Mail, Phone, ShieldCheck, Save, Loader2, BadgeCheck, Car, Inbox, ExternalLink } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

export default function ProfilePage() {
  const { appUser, updateProfile } = useAuthStore();
  const [name, setName] = useState(appUser?.name ?? '');
  const [phone, setPhone] = useState(appUser?.phone ?? '');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!appUser) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError(null);
    try {
      await updateProfile({
        name: name || undefined,
        phone: phone || undefined,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Uložení selhalo');
    } finally {
      setSaving(false);
    }
  };

  const roleLabels: Record<string, { label: string; color: string }> = {
    buyer: { label: 'Kupující', color: 'bg-surface-800 text-surface-300' },
    private_seller: { label: 'Soukromý prodejce', color: 'bg-amber-500/15 text-amber-400' },
    dealer_admin: { label: 'Dealer admin', color: 'bg-emerald-500/15 text-emerald-400' },
    admin: { label: 'Admin', color: 'bg-primary-500/15 text-primary-400' },
  };
  const roleMeta = roleLabels[appUser.role] ?? roleLabels.buyer;

  const isSeller = appUser.role === 'private_seller' || appUser.role === 'dealer_admin';

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-surface-950 rounded-2xl shadow-sm p-6 md:p-8 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-xl font-bold shrink-0">
            {(appUser.name ?? appUser.email)[0].toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-extrabold text-surface-50" style={{ fontFamily: 'var(--font-display)' }}>
              {appUser.name ?? 'Můj profil'}
            </h1>
            <p className="text-sm text-surface-400 truncate">{appUser.email}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className={`inline-block text-[10px] px-2 py-0.5 rounded uppercase tracking-wide font-semibold ${roleMeta.color}`}>
                {roleMeta.label}
              </span>
              {appUser.email_verified_at && (
                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded">
                  <BadgeCheck className="w-3 h-3" />
                  E-mail ověřen
                </span>
              )}
              {appUser.phone_verified_at && (
                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded">
                  <BadgeCheck className="w-3 h-3" />
                  Telefon ověřen
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick links pro prodejce */}
      {isSeller && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <Link
            to="/prodat"
            className="flex items-center gap-3 p-4 bg-surface-950 rounded-xl shadow-sm hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-primary-500/15 flex items-center justify-center text-primary-500 shrink-0">
              <Car className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-surface-100">Inzerovat vůz</p>
              <p className="text-xs text-surface-400">Přidat nový inzerát</p>
            </div>
          </Link>
          <div className="flex items-center gap-3 p-4 bg-surface-950 rounded-xl shadow-sm opacity-50">
            <div className="w-10 h-10 rounded-lg bg-surface-800 flex items-center justify-center text-surface-500 shrink-0">
              <Inbox className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-surface-100">Dotazy</p>
              <p className="text-xs text-surface-400">Brzy</p>
            </div>
          </div>
          {appUser.dealer_id && (
            <Link
              to={`/prodejce/${appUser.dealer_id}`}
              className="flex items-center gap-3 p-4 bg-surface-950 rounded-xl shadow-sm hover:shadow-md transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-accent-500/15 flex items-center justify-center text-accent-500 shrink-0">
                <ExternalLink className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-surface-100">Veřejný profil</p>
                <p className="text-xs text-surface-400">Zobrazit jak vidí kupující</p>
              </div>
            </Link>
          )}
        </div>
      )}

      {/* Edit form */}
      <div className="bg-surface-950 rounded-2xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-surface-50 mb-4" style={{ fontFamily: 'var(--font-display)' }}>
          Osobní údaje
        </h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-surface-400 mb-1.5">
              <UserIcon className="w-3.5 h-3.5 inline mr-1.5" />
              Jméno a příjmení
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-surface-900 rounded-lg px-3 py-2.5 text-sm text-surface-100 outline-none focus:ring-2 focus:ring-primary-500"
              autoComplete="name"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-surface-400 mb-1.5">
              <Mail className="w-3.5 h-3.5 inline mr-1.5" />
              E-mail
            </label>
            <input
              type="email"
              value={appUser.email}
              disabled
              className="w-full bg-surface-900 rounded-lg px-3 py-2.5 text-sm text-surface-500 outline-none cursor-not-allowed opacity-70"
            />
            <p className="text-[10px] text-surface-500 mt-1">
              Změnu e-mailu zatím podporujeme jen přes podporu — kontaktujte nás.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-surface-400 mb-1.5">
              <Phone className="w-3.5 h-3.5 inline mr-1.5" />
              Telefon
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-surface-900 rounded-lg px-3 py-2.5 text-sm text-surface-100 outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="+420…"
              autoComplete="tel"
            />
            {!appUser.phone_verified_at && phone && (
              <p className="text-[10px] text-amber-400 mt-1">
                Po uložení Vám pošleme SMS s ověřovacím kódem (TODO).
              </p>
            )}
          </div>

          {error && (
            <div className="px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">
              {error}
            </div>
          )}

          {success && (
            <div className="px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs text-emerald-400">
              Uloženo.
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-br from-primary-500 to-primary-700 hover:from-primary-600 hover:to-primary-800 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Ukládám…' : 'Uložit změny'}
          </button>
        </form>
      </div>

      {/* Role upgrade CTA */}
      {appUser.role === 'buyer' && (
        <div className="mt-6 bg-gradient-to-br from-primary-500/10 to-accent-500/10 rounded-2xl p-6 border border-primary-500/20">
          <ShieldCheck className="w-8 h-8 text-primary-500 mb-3" />
          <h3 className="text-base font-bold text-surface-50 mb-1">Chcete inzerovat vůz?</h3>
          <p className="text-sm text-surface-400 mb-4">
            Aktivujte si soukromý prodejní účet a inzerujte zdarma. Pro autobazary
            a dealery připravujeme firemní účty.
          </p>
          <button
            onClick={async () => {
              await useAuthStore.getState().updateProfile({});
              // TODO: dedicated upgrade-to-private-seller flow s ověřením telefonu
              alert('Upgrade na soukromého prodejce — TODO (vyžaduje ověření telefonu).');
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-400 rounded-lg text-sm font-semibold text-white"
          >
            Stát se soukromým prodejcem
          </button>
        </div>
      )}
    </div>
  );
}
