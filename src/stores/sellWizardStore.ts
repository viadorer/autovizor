import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WizardData {
  // Step 1 — základní info
  kind_id?: number;
  manufacturer_id?: number;
  model_id?: number;
  body_type_id?: number;
  condition_id?: number;
  title?: string;
  model_variant?: string;
  vin?: string;
  made_year?: number;
  made_month?: number;

  // Step 2 — technické specs
  fuel_type_id?: number;
  gearbox_id?: number;
  gearbox_level_id?: number;
  drive_id?: number;
  engine_volume?: number;
  engine_power?: number;
  tachometer?: number;
  euro_id?: number;
  color_id?: number;
  color_tone_id?: number;
  color_type_id?: number;
  door_count_id?: number;
  capacity_id?: number;
  aircondition_id?: number;
  upholstery_id?: number;
  servicebook_id?: number;
  country_id?: number;
  owner_count_id?: number;
  first_owner?: 1 | 2;
  crashed?: boolean;

  // Step 3 — equipment
  equipment_ids?: number[];

  // Step 4 — fotky (URL po uploadu na Storage)
  image_urls?: string[];

  // Step 5 — cena + popis + lokace
  price?: number;
  price_includes_vat?: boolean;
  vat_deductible?: boolean;
  description?: string;
  region_id?: number;
  city?: string;
  zip_code?: string;
  address?: string;
  // STK
  stk_date?: string;
}

export type StepIndex = 1 | 2 | 3 | 4 | 5;

interface WizardState {
  step: StepIndex;
  data: WizardData;
  vehicleId: number | null; // pokud editujeme draft uložený v DB
  lastSavedAt: number | null;

  setStep: (step: StepIndex) => void;
  next: () => void;
  prev: () => void;
  patch: (updates: Partial<WizardData>) => void;
  reset: () => void;
  setVehicleId: (id: number | null) => void;
  markSaved: () => void;
  hydrateFromVehicle: (data: WizardData & { id?: number }) => void;
}

const INITIAL: WizardData = {
  kind_id: 1, // osobní default
  condition_id: 2, // ojeté
  first_owner: 2,
  crashed: false,
  price_includes_vat: true,
  vat_deductible: false,
  equipment_ids: [],
  image_urls: [],
};

export const useSellWizardStore = create<WizardState>()(
  persist(
    (set, get) => ({
      step: 1,
      data: { ...INITIAL },
      vehicleId: null,
      lastSavedAt: null,

      setStep: (step) => set({ step }),
      next: () => {
        const s = get().step;
        if (s < 5) set({ step: (s + 1) as StepIndex });
      },
      prev: () => {
        const s = get().step;
        if (s > 1) set({ step: (s - 1) as StepIndex });
      },
      patch: (updates) => set((state) => ({ data: { ...state.data, ...updates } })),
      reset: () => set({ step: 1, data: { ...INITIAL }, vehicleId: null, lastSavedAt: null }),
      setVehicleId: (id) => set({ vehicleId: id }),
      markSaved: () => set({ lastSavedAt: Date.now() }),
      hydrateFromVehicle: ({ id, ...data }) => {
        set({
          step: 1,
          data: { ...INITIAL, ...data },
          vehicleId: id ?? null,
          lastSavedAt: Date.now(),
        });
      },
    }),
    {
      name: 'autovizor-sell-wizard',
      partialize: (state) => ({
        step: state.step,
        data: state.data,
        vehicleId: state.vehicleId,
      }),
    }
  )
);
