import { describe, it, expect } from 'vitest';
import {
  getCurrencyForCountry,
  formatCurrency,
  convertCost,
  COUNTRY_CURRENCY,
  TYPICAL_COSTS_USD,
} from './currency';

describe('COUNTRY_CURRENCY', () => {
  it('maps major countries correctly', () => {
    expect(COUNTRY_CURRENCY.US).toBe('USD');
    expect(COUNTRY_CURRENCY.GB).toBe('GBP');
    expect(COUNTRY_CURRENCY.FR).toBe('EUR');
    expect(COUNTRY_CURRENCY.JP).toBe('JPY');
    expect(COUNTRY_CURRENCY.TH).toBe('THB');
  });

  it('EU countries all map to EUR', () => {
    ['FR', 'DE', 'IT', 'ES', 'NL', 'BE', 'AT', 'PT', 'GR', 'IE', 'FI'].forEach(cc => {
      expect(COUNTRY_CURRENCY[cc]).toBe('EUR');
    });
  });
});

describe('getCurrencyForCountry', () => {
  it('returns currency for valid country code', () => {
    expect(getCurrencyForCountry('JP')).toBe('JPY');
    expect(getCurrencyForCountry('GB')).toBe('GBP');
  });

  it('is case-insensitive', () => {
    expect(getCurrencyForCountry('jp')).toBe('JPY');
    expect(getCurrencyForCountry('Gb')).toBe('GBP');
  });

  it('returns null for unknown country code', () => {
    expect(getCurrencyForCountry('XX')).toBeNull();
  });

  it('returns null for null/undefined input', () => {
    expect(getCurrencyForCountry(null)).toBeNull();
    expect(getCurrencyForCountry(undefined)).toBeNull();
    expect(getCurrencyForCountry('')).toBeNull();
  });
});

describe('formatCurrency', () => {
  it('formats USD', () => {
    expect(formatCurrency(15.50, 'USD')).toContain('15.50');
  });

  it('formats EUR', () => {
    expect(formatCurrency(12, 'EUR')).toContain('12.00');
  });

  it('falls back gracefully for unknown currency', () => {
    const result = formatCurrency(100, 'XYZ');
    expect(result).toContain('XYZ');
    expect(result).toContain('100.00');
  });
});

describe('convertCost', () => {
  it('converts USD cost to destination currency', () => {
    const result = convertCost('coffee', 150, 'JPY'); // 1 USD = 150 JPY
    expect(result.usd).toBe(4); // coffee = $4
    expect(result.converted).toBe(600); // 4 * 150
    expect(result.display).toContain('600');
  });

  it('handles fractional rates', () => {
    const result = convertCost('meal', 0.92, 'EUR');
    expect(result.usd).toBe(18); // meal = $18
    expect(result.converted).toBe(16.56); // 18 * 0.92
  });

  it('returns zero for unknown cost key', () => {
    const result = convertCost('nonexistent', 100, 'EUR');
    expect(result.usd).toBe(0);
    expect(result.converted).toBe(0);
  });
});

describe('TYPICAL_COSTS_USD', () => {
  it('has all expected cost keys', () => {
    const keys = ['laundry', 'taxi', 'meal', 'coffee', 'water', 'toiletries', 'sim', 'sunscreen'];
    keys.forEach(k => {
      expect(typeof TYPICAL_COSTS_USD[k]).toBe('number');
    });
  });
});
