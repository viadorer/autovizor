import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, ChevronLeft, ChevronRight, Save, Loader2, Trash2 } from 'lucide-react';
import { useSellWizardStore } from '../stores/sellWizardStore';
import { useAuthStore } from '../stores/authStore';
import { saveDraft, loadDraft } from '../lib/api';
import SellStep1 from './sell-wizard/SellStep1';
import SellStep2 from './sell-wizard/SellStep2';
import SellStep3 from './sell-wizard/SellStep3';
import SellStep4 from './sell-wizard/SellStep4';
import SellStep5 from './sell-wizard/SellStep5';

const STEPS = [
  { num: 1, label: 'Základ', desc: 'VIN, značka, ročník' },
  { num: 2, label: 'Technika', desc: 'Motor, převodovka, km' },
  { num: 3, label: 'Výbava', desc: 'Komfort, asistenty' },
  { num: 4, label: 'Fotky', desc: 'Min. 4 obrázky' },
  { num: 5, label: 'Cena', desc: 'Popis, kontakt, náhled' },
] as const;

export default function SellWizardLayout() {
  const navigate = useNavigate();
  const { appUser } = useAuthStore();
  const { step, data, vehicleId, setStep, prev, next, reset, lastSavedAt, hydrateFromVehicle, setVehicleId, markSaved } = useSellWizardStore();
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const hydrated = useRef(false);

  // Pokud user má v DB rozpracovaný draft, nabídneme ho
  useEffect(() => {
    if (hydrated.current || !appUser) return;
    hydrated.current = true;

    // Pokud uživatel nemá nic v lokálním store, načti draft z DB
    if (!vehicleId && !data.title && Object.keys(data).length < 8) {
      loadDraft().then((draft) => {
        if (draft) {
          hydrateFromVehicle({ id: draft.id, ...draft.data });
        }
      });
    }
  }, [appUser, vehicleId, data, hydrateFromVehicle]);

  // Auto-save při změně step
  useEffect(() => {
    if (!appUser) return;
    if (Object.keys(data).length < 4) return; // málo dat

    const timer = setTimeout(async () => {
      setSaving(true);
      const result = await saveDraft({
        user_id: appUser.id,
        vehicle_id: vehicleId,
        data: data as Record<string, unknown>,
        publish: false,
      });
      if (result?.id && !vehicleId) setVehicleId(result.id);
      if (result) markSaved();
      setSaving(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [step, data, appUser, vehicleId, setVehicleId, markSaved]);

  if (!appUser) return null;

  const handleSubmit = async () => {
    if (!appUser) return;
    setSubmitting(true);
    setSubmitError(null);

    const result = await saveDraft({
      user_id: appUser.id,
      vehicle_id: vehicleId,
      data: data as Record<string, unknown>,
      publish: true,
    });

    setSubmitting(false);

    if (!result) {
      setSubmitError('Odeslání selhalo. Zkontrolujte, zda jste vyplnili všechna povinná pole.');
      return;
    }

    reset();
    navigate('/dashboard/inzeraty?published=1');
  };

  const handleDiscard = () => {
    if (!confirm('Opravdu zahodit rozpracovaný inzerát? Tato akce je nevratná.')) return;
    reset();
    navigate('/dashboard');
  };

  // Validace per step
  const canProceed = (() => {
    switch (step) {
      case 1:
        return !!(data.kind_id && data.manufacturer_id && data.condition_id && data.made_year);
      case 2:
        return !!(data.fuel_type_id && data.tachometer != null && data.engine_power);
      case 3:
        return true; // equipment optional
      case 4:
        return (data.image_urls?.length ?? 0) >= 1; // alespoň 1 fotka
      case 5:
        return !!(data.price && data.price > 0 && data.description);
      default:
        return true;
    }
  })();

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-surface-50" style={{ fontFamily: 'var(--font-display)' }}>
            Inzerovat vůz
          </h1>
          <p className="text-sm text-surface-400">
            {STEPS[step - 1].desc}
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-surface-500">
          {saving && <span className="flex items-center gap-1.5"><Loader2 className="w-3 h-3 animate-spin" /> Ukládám…</span>}
          {!saving && lastSavedAt && (
            <span className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-500" /> Uloženo</span>
          )}
          <button
            onClick={handleDiscard}
            className="text-surface-500 hover:text-red-400 inline-flex items-center gap-1"
            title="Zahodit rozpracovaný inzerát"
          >
            <Trash2 className="w-3 h-3" />
            Zahodit
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2 overflow-x-auto">
          {STEPS.map((s, i) => {
            const isActive = step === s.num;
            const isDone = step > s.num;
            return (
              <button
                key={s.num}
                onClick={() => isDone && setStep(s.num as 1 | 2 | 3 | 4 | 5)}
                disabled={!isDone && !isActive}
                className={`flex items-center gap-2 ${i < STEPS.length - 1 ? 'flex-1' : ''} ${
                  isDone ? 'cursor-pointer' : !isActive ? 'cursor-not-allowed' : ''
                }`}
              >
                <span
                  className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    isActive ? 'bg-primary-500 text-white' :
                    isDone ? 'bg-primary-500/20 text-primary-400' :
                    'bg-surface-800 text-surface-500'
                  }`}
                >
                  {isDone ? <Check className="w-4 h-4" /> : s.num}
                </span>
                <span className={`text-xs font-semibold ${
                  isActive ? 'text-surface-50' :
                  isDone ? 'text-primary-400' :
                  'text-surface-500'
                } hidden sm:block`}>
                  {s.label}
                </span>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 ${isDone ? 'bg-primary-500/40' : 'bg-surface-800'}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Step content */}
      <div className="bg-surface-950 rounded-2xl shadow-sm p-6 md:p-8">
        {step === 1 && <SellStep1 />}
        {step === 2 && <SellStep2 />}
        {step === 3 && <SellStep3 />}
        {step === 4 && <SellStep4 />}
        {step === 5 && <SellStep5 />}
      </div>

      {/* Error */}
      {submitError && (
        <div className="mt-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
          {submitError}
        </div>
      )}

      {/* Bottom navigation */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={prev}
          disabled={step === 1}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-surface-900 hover:bg-surface-850 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-sm font-medium text-surface-200"
        >
          <ChevronLeft className="w-4 h-4" />
          Zpět
        </button>

        <div className="flex items-center gap-2">
          <Link
            to="/dashboard"
            className="text-xs text-surface-500 hover:text-surface-300 inline-flex items-center gap-1"
          >
            <Save className="w-3 h-3" />
            Uložit a pokračovat později
          </Link>

          {step < 5 ? (
            <button
              onClick={next}
              disabled={!canProceed}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-br from-primary-500 to-primary-700 hover:from-primary-600 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-semibold text-white"
            >
              Pokračovat
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting || !canProceed}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-br from-emerald-500 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-semibold text-white"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {submitting ? 'Odesílám…' : 'Publikovat inzerát'}
            </button>
          )}
        </div>
      </div>

      {/* Info pro private sellery */}
      {appUser.role === 'private_seller' && step === 5 && (
        <div className="mt-4 px-4 py-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-400">
          <strong>Po publikaci:</strong> Inzerát bude zkontrolován administrátorem (typicky do 24 h).
          Po schválení bude viditelný na webu.
        </div>
      )}
    </div>
  );
}
