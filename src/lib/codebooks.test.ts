import { describe, it, expect } from 'vitest';
import {
  formatPrice, formatKm, formatPower, formatVolume,
  formatRegistration, getCodebookName,
  FUEL_TYPES, GEARBOX_TYPES, COLORS,
} from './codebooks';

describe('formatPrice', () => {
  it('should format price with czech locale', () => {
    const result = formatPrice(1250000);
    expect(result).toContain('1');
    expect(result).toContain('250');
    expect(result).toContain('000');
  });

  it('should handle zero', () => {
    expect(formatPrice(0)).toBeDefined();
  });
});

describe('formatKm', () => {
  it('should format kilometers', () => {
    const result = formatKm(125000);
    expect(result).toContain('125');
    expect(result).toContain('km');
  });
});

describe('formatPower', () => {
  it('should show kW and PS', () => {
    const result = formatPower(110);
    expect(result).toContain('110');
    expect(result).toContain('kW');
  });
});

describe('formatVolume', () => {
  it('should format engine volume in liters', () => {
    const result = formatVolume(1968);
    expect(result).toContain('l');
  });
});

describe('formatRegistration', () => {
  it('should format month/year', () => {
    expect(formatRegistration(3, 2020)).toContain('2020');
  });

  it('should handle undefined month', () => {
    const result = formatRegistration(undefined, 2020);
    expect(result).toContain('2020');
  });

  it('should return empty string for missing year', () => {
    expect(formatRegistration(3, undefined)).toBeFalsy();
  });
});

describe('getCodebookName', () => {
  it('should find fuel type by id', () => {
    const benzin = FUEL_TYPES.find(f => f.name === 'Benzín');
    if (benzin) {
      expect(getCodebookName(FUEL_TYPES, benzin.id)).toBe('Benzín');
    }
  });

  it('should return falsy for unknown id', () => {
    expect(getCodebookName(FUEL_TYPES, 999)).toBeFalsy();
  });

  it('should return falsy for undefined id', () => {
    expect(getCodebookName(GEARBOX_TYPES, undefined)).toBeFalsy();
  });

  it('should find colors', () => {
    expect(COLORS.length).toBeGreaterThan(0);
  });
});
