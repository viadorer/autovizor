import { useMemo, useState } from 'react';
import { CircleDollarSign, Banknote, FileSignature, Info } from 'lucide-react';
import type { Vehicle } from '../types';
import { formatPrice } from '../lib/codebooks';

interface Props {
  vehicle: Vehicle;
}

type ProductType = 'loan' | 'leasing_op' | 'leasing_fin';

// Mock sazby ČR 2026 — průměrné nabídky. Reálné podléhají scoringu.
const PRODUCTS = {
  loan: {
    label: 'Úvěr',
    description: 'Vůz je váš od začátku, banka má zástavu na TP.',
    icon: Banknote,
    apr: 7.9, // typický autoúvěr
    minDownPaymentPct: 10,
    maxTermMonths: 84,
    defaultTerm: 60,
    feeMonthly: 0,
    color: 'from-emerald-500 to-emerald-700',
  },
  leasing_fin: {
    label: 'Finanční leasing',
    description: 'Po doplacení získáte vlastnictví. Měsíční splátka + akontace.',
    icon: FileSignature,
    apr: 6.5,
    minDownPaymentPct: 20,
    maxTermMonths: 72,
    defaultTerm: 48,
    feeMonthly: 0,
    color: 'from-cyan-500 to-cyan-700',
  },
  leasing_op: {
    label: 'Operativní leasing',
    description: 'Pouze užívání. Po skončení vrátíte. Vhodné pro firmy.',
    icon: CircleDollarSign,
    apr: 4.0, // efektivní financování (vyšší zbytková hodnota)
    minDownPaymentPct: 0,
    maxTermMonths: 60,
    defaultTerm: 36,
    feeMonthly: 1500, // service + insurance v ceně
    color: 'from-primary-500 to-primary-700',
    residualValuePct: 50, // typicky vrácení po 3-4 letech
  },
} as const;

export default function FinancingCalculator({ vehicle }: Props) {
  const [product, setProduct] = useState<ProductType>('loan');
  const [downPayment, setDownPayment] = useState(Math.round(vehicle.price * 0.20));
  const [termMonths, setTermMonths] = useState(60);
  const [expanded, setExpanded] = useState(false);

  const config = PRODUCTS[product];

  const calc = useMemo(() => {
    // PMT calculation: M = P * (r(1+r)^n) / ((1+r)^n - 1)
    const principal = product === 'leasing_op'
      ? vehicle.price * (1 - (config as { residualValuePct?: number }).residualValuePct! / 100) - downPayment
      : vehicle.price - downPayment;
    const monthlyRate = config.apr / 100 / 12;
    const n = termMonths;

    let monthly = 0;
    if (principal > 0) {
      if (monthlyRate === 0) {
        monthly = principal / n;
      } else {
        monthly = principal * (monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
      }
    }
    monthly += config.feeMonthly ?? 0;

    const total = downPayment + monthly * n;
    const totalInterest = total - vehicle.price;

    return {
      principal,
      monthly: Math.round(monthly),
      total: Math.round(total),
      totalInterest: Math.round(totalInterest),
    };
  }, [vehicle.price, product, downPayment, termMonths, config]);

  const minDown = Math.round(vehicle.price * config.minDownPaymentPct / 100);

  return (
    <div className="bg-surface-950 rounded-2xl shadow-sm overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-5 text-left hover:bg-surface-900 transition-colors"
      >
        <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0">
          <Banknote className="w-5 h-5 text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-bold text-surface-50" style={{ fontFamily: 'var(--font-display)' }}>
            Financování
          </h2>
          <p className="text-xs text-surface-400">
            Od <strong className="text-emerald-400">{formatPrice(calc.monthly)}</strong>/měs.
            (úvěr na {termMonths} měs.)
          </p>
        </div>
        <span className={`text-xs text-surface-500 transition-transform ${expanded ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {expanded && (
        <div className="px-5 pb-5 border-t border-surface-800 pt-4 space-y-4">
          {/* Product selector */}
          <div className="grid grid-cols-3 gap-2">
            {(Object.entries(PRODUCTS) as Array<[ProductType, typeof PRODUCTS[ProductType]]>).map(([key, p]) => (
              <button
                key={key}
                onClick={() => {
                  setProduct(key);
                  setTermMonths(p.defaultTerm);
                  setDownPayment(Math.max(downPayment, Math.round(vehicle.price * p.minDownPaymentPct / 100)));
                }}
                className={`p-2 rounded-lg text-center transition-colors ${
                  product === key
                    ? 'bg-primary-500/15 border border-primary-500/40 text-primary-300'
                    : 'bg-surface-900 border border-transparent hover:bg-surface-850 text-surface-300'
                }`}
              >
                <p.icon className="w-4 h-4 mx-auto mb-1" />
                <p className="text-[10px] font-semibold leading-tight">{p.label}</p>
              </button>
            ))}
          </div>

          <p className="text-[10px] text-surface-500">{config.description}</p>

          {/* Sliders */}
          <div className="space-y-3">
            <div>
              <label className="flex justify-between text-xs text-surface-400 mb-1">
                <span>Akontace / záloha</span>
                <strong className="text-surface-200">{formatPrice(downPayment)}</strong>
              </label>
              <input
                type="range"
                min={minDown}
                max={Math.round(vehicle.price * 0.7)}
                step={5000}
                value={downPayment}
                onChange={(e) => setDownPayment(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
              <p className="text-[10px] text-surface-500 mt-0.5">
                Min. {config.minDownPaymentPct}% ({formatPrice(minDown)})
              </p>
            </div>

            <div>
              <label className="flex justify-between text-xs text-surface-400 mb-1">
                <span>Doba splácení</span>
                <strong className="text-surface-200">{termMonths} měsíců ({Math.round(termMonths / 12 * 10) / 10} roku)</strong>
              </label>
              <input
                type="range"
                min={12}
                max={config.maxTermMonths}
                step={6}
                value={termMonths}
                onChange={(e) => setTermMonths(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>
          </div>

          {/* Result card */}
          <div className={`bg-gradient-to-br ${config.color} rounded-xl p-5 text-white`}>
            <p className="text-xs uppercase tracking-wide opacity-80 font-semibold">Měsíční splátka</p>
            <p className="text-3xl font-extrabold mt-1">{formatPrice(calc.monthly)}</p>
            <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-white/20 text-xs">
              <div>
                <p className="opacity-70">Akontace</p>
                <p className="font-semibold">{formatPrice(downPayment)}</p>
              </div>
              <div>
                <p className="opacity-70">Celkem zaplaceno</p>
                <p className="font-semibold">{formatPrice(calc.total)}</p>
              </div>
              {product !== 'leasing_op' && (
                <>
                  <div>
                    <p className="opacity-70">Úroková sazba (RPSN)</p>
                    <p className="font-semibold">{config.apr}%</p>
                  </div>
                  <div>
                    <p className="opacity-70">Přeplatek</p>
                    <p className="font-semibold">{formatPrice(calc.totalInterest)}</p>
                  </div>
                </>
              )}
              {product === 'leasing_op' && (
                <div className="col-span-2">
                  <p className="opacity-70">Včetně</p>
                  <p className="font-semibold text-xs">Servis + povinné ručení + havarijní pojištění</p>
                </div>
              )}
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={() => alert('Žádost o financování — TODO (integrace s partnerem)')}
            className="w-full py-3 bg-primary-500 hover:bg-primary-400 rounded-xl text-sm font-semibold text-white"
          >
            Nezávazně poptat
          </button>

          <div className="flex items-start gap-2 text-[10px] text-surface-500">
            <Info className="w-3 h-3 shrink-0 mt-0.5" />
            <p>
              Orientační výpočet podle průměrných tržních sazeb (ČR 2026).
              Konkrétní nabídka závisí na bonitě a parametrech smlouvy.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
