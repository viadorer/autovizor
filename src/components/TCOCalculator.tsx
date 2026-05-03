import { useMemo, useState } from 'react';
import { Calculator, Fuel, Wrench, Shield, FileText, TrendingDown } from 'lucide-react';
import type { Vehicle } from '../types';
import { formatPrice } from '../lib/codebooks';

interface Props {
  vehicle: Vehicle;
}

// ČR 2026 odhady — průměry. Reálné sazby závisí na lokalitě, věku řidiče atd.
const FUEL_PRICES: Record<number, number> = {
  1: 38, // Benzín Kč/l
  2: 39, // Nafta Kč/l
  3: 22, // LPG Kč/l (cena za "ekvivalent litru benzínu" je vyšší kvůli horší výhřevnosti)
  4: 6.50, // Elektro Kč/kWh (domácí) → spotřeba 18 kWh/100km = ~117 Kč
  5: 35, // Hybrid (počítáme nižší než benzín)
  6: 28, // CNG Kč/kg
};

const DEFAULT_CONSUMPTION: Record<number, number> = {
  1: 7.5, // Benzín l/100km
  2: 6.0, // Nafta
  3: 9.0, // LPG (vyšší spotřeba než benzín)
  4: 18,  // Elektro kWh/100km
  5: 5.5, // Hybrid
  6: 6.0, // CNG kg/100km
};

const ANNUAL_KM_DEFAULT = 15000;

export default function TCOCalculator({ vehicle }: Props) {
  const [annualKm, setAnnualKm] = useState(ANNUAL_KM_DEFAULT);
  const [yearsHorizon, setYearsHorizon] = useState(5);
  const [expanded, setExpanded] = useState(false);

  const tco = useMemo(() => {
    const fuelTypeId = vehicle.fuel_type_id ?? 1;
    const fuelPrice = FUEL_PRICES[fuelTypeId] ?? 38;
    const consumption = vehicle.gas_mileage ?? DEFAULT_CONSUMPTION[fuelTypeId] ?? 7;

    // Roční spotřeba = (annualKm / 100) * consumption * fuelPrice
    const annualFuel = Math.round((annualKm / 100) * consumption * fuelPrice);

    // Pojištění — odhad podle ceny vozidla a stáří
    // Povinné ručení ~ 8000 Kč/rok pro běžný vůz
    // Havarijní ~ 4-7 % z ceny vozu
    const age = vehicle.made_year ? new Date().getFullYear() - vehicle.made_year : 5;
    const insuranceMTPL = age > 15 ? 6000 : age > 8 ? 8500 : 11000; // povinné ručení
    const insuranceCASCO = vehicle.price < 100000 || age > 12
      ? 0
      : Math.round(vehicle.price * 0.045); // havarijní ~4.5%

    // Servis & údržba — 1.5-2.5 % z ceny vozu / rok
    const maintenance = Math.round(Math.max(8000, Math.min(vehicle.price * 0.022, 50000)));

    // Daň z vozidla — odhad podle paliva (elektro = 0)
    const annualTax = fuelTypeId === 4 ? 0 : (vehicle.engine_volume ?? 1500) > 2000 ? 4800 : 2400;

    // STK + emise — průměrně 1500 Kč / 2 roky = 750 Kč/rok
    const stkAnnual = 750;

    // Depreciace — pro ojetiny ~ 10% / rok klesající; nový vůz ~ 18% rok 1, pak 10%
    let depreciationAnnual = Math.round(vehicle.price * 0.10);
    if (age <= 1) depreciationAnnual = Math.round(vehicle.price * 0.18);
    if (age > 10) depreciationAnnual = Math.round(vehicle.price * 0.05);

    const annualTotal = annualFuel + insuranceMTPL + insuranceCASCO + maintenance + annualTax + stkAnnual;
    const totalHorizon = annualTotal * yearsHorizon;
    const totalDepreciation = depreciationAnnual * yearsHorizon;
    const totalCost = totalHorizon + totalDepreciation;
    const costPerKm = annualKm > 0 ? Math.round((annualTotal + depreciationAnnual) / annualKm * 100) / 100 : 0;

    return {
      annualFuel,
      insuranceMTPL,
      insuranceCASCO,
      maintenance,
      annualTax,
      stkAnnual,
      depreciationAnnual,
      annualTotal,
      totalHorizon,
      totalDepreciation,
      totalCost,
      costPerKm,
      consumption,
      fuelPrice,
    };
  }, [vehicle, annualKm, yearsHorizon]);

  return (
    <div className="bg-surface-950 rounded-2xl shadow-sm overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-5 text-left hover:bg-surface-900 transition-colors"
      >
        <div className="w-10 h-10 rounded-xl bg-cyan-500/15 flex items-center justify-center shrink-0">
          <Calculator className="w-5 h-5 text-cyan-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-bold text-surface-50" style={{ fontFamily: 'var(--font-display)' }}>
            Náklady na vlastnictví
          </h2>
          <p className="text-xs text-surface-400">
            Odhad provozu na <strong className="text-surface-200">{yearsHorizon} let</strong> →{' '}
            <strong className="text-cyan-400">{formatPrice(tco.totalCost)}</strong> ({tco.costPerKm.toFixed(2)} Kč/km)
          </p>
        </div>
        <span className={`text-xs text-surface-500 transition-transform ${expanded ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {expanded && (
        <div className="px-5 pb-5 border-t border-surface-800 pt-4 space-y-4">
          {/* Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="flex justify-between text-xs text-surface-400 mb-1">
                <span>Roční nájezd</span>
                <strong className="text-surface-200">{annualKm.toLocaleString('cs-CZ')} km</strong>
              </label>
              <input
                type="range"
                min={5000}
                max={50000}
                step={1000}
                value={annualKm}
                onChange={(e) => setAnnualKm(Number(e.target.value))}
                className="w-full accent-cyan-500"
              />
            </div>
            <div>
              <label className="flex justify-between text-xs text-surface-400 mb-1">
                <span>Horizont</span>
                <strong className="text-surface-200">{yearsHorizon} let</strong>
              </label>
              <input
                type="range"
                min={1}
                max={10}
                step={1}
                value={yearsHorizon}
                onChange={(e) => setYearsHorizon(Number(e.target.value))}
                className="w-full accent-cyan-500"
              />
            </div>
          </div>

          {/* Breakdown */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-surface-400 mb-2 uppercase tracking-wide">Roční náklady</p>
            <CostRow icon={Fuel} label={`Palivo (${tco.consumption} l/100 km)`} value={tco.annualFuel} />
            <CostRow icon={Shield} label="Povinné ručení" value={tco.insuranceMTPL} />
            {tco.insuranceCASCO > 0 && (
              <CostRow icon={Shield} label="Havarijní pojištění" value={tco.insuranceCASCO} />
            )}
            <CostRow icon={Wrench} label="Servis & údržba" value={tco.maintenance} />
            {tco.annualTax > 0 && <CostRow icon={FileText} label="Silniční daň" value={tco.annualTax} />}
            <CostRow icon={FileText} label="STK + emise" value={tco.stkAnnual} />
            <div className="flex justify-between items-center py-2 border-t border-surface-800 mt-2">
              <span className="text-sm font-semibold text-surface-200">Roční provoz celkem</span>
              <span className="text-base font-bold text-surface-50">{formatPrice(tco.annualTotal)}</span>
            </div>
            <CostRow
              icon={TrendingDown}
              label="Depreciace (ztráta hodnoty)"
              value={tco.depreciationAnnual}
              muted
            />
          </div>

          {/* Total */}
          <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4 text-center">
            <p className="text-xs text-cyan-400 uppercase tracking-wide font-semibold">
              Celkové náklady na {yearsHorizon} let
            </p>
            <p className="text-2xl font-extrabold text-surface-50 mt-1">{formatPrice(tco.totalCost)}</p>
            <p className="text-xs text-surface-400 mt-1">
              {formatPrice(tco.totalHorizon)} provoz + {formatPrice(tco.totalDepreciation)} depreciace
            </p>
            <p className="text-[10px] text-surface-500 mt-2">
              {tco.costPerKm.toFixed(2)} Kč/km · {formatPrice(Math.round(tco.totalCost / 12 / yearsHorizon))} měsíčně
            </p>
          </div>

          <p className="text-[10px] text-surface-500 leading-relaxed">
            Odhad podle průměrných sazeb v ČR 2026. Reálné náklady se mohou lišit
            (pojištění závisí na věku/oblasti řidiče, servis na servisní síti, palivo na cenách).
          </p>
        </div>
      )}
    </div>
  );
}

function CostRow({ icon: Icon, label, value, muted }: {
  icon: typeof Fuel;
  label: string;
  value: number;
  muted?: boolean;
}) {
  return (
    <div className="flex justify-between items-center text-xs">
      <span className={`flex items-center gap-2 ${muted ? 'text-surface-500' : 'text-surface-300'}`}>
        <Icon className="w-3.5 h-3.5" />
        {label}
      </span>
      <span className={muted ? 'text-surface-500' : 'text-surface-200 font-medium'}>
        {formatPrice(value)}
      </span>
    </div>
  );
}
