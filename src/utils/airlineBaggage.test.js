import { describe, it, expect } from 'vitest';
import {
  lookupAirline,
  searchAirlines,
  getAllAirlines,
  getRegions,
  checkBaggageCompliance,
  AIRLINES,
} from './airlineBaggage';

describe('AIRLINES dataset integrity', () => {
  it('has 75+ airlines across all regions', () => {
    expect(AIRLINES.length).toBeGreaterThanOrEqual(75);
  });

  it('every airline has required fields', () => {
    AIRLINES.forEach(a => {
      expect(typeof a.code).toBe('string');
      expect(a.code).toMatch(/^[A-Z0-9]{2}$/);
      expect(typeof a.name).toBe('string');
      expect(typeof a.region).toBe('string');
      expect(a.carryOn).toBeDefined();
      expect(a.carryOn.l).toBeGreaterThan(0);
      expect(a.carryOn.w).toBeGreaterThan(0);
      expect(a.carryOn.h).toBeGreaterThan(0);
      expect(a.personal).toBeDefined();
      expect(a.checked).toBeDefined();
    });
  });

  it('has no duplicate IATA codes', () => {
    const codes = AIRLINES.map(a => a.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it('covers all major regions', () => {
    const regions = new Set(AIRLINES.map(a => a.region));
    expect(regions.has('Europe')).toBe(true);
    expect(regions.has('North America')).toBe(true);
    expect(regions.has('Asia')).toBe(true);
    expect(regions.has('Middle East')).toBe(true);
    expect(regions.has('Oceania')).toBe(true);
    expect(regions.has('South America')).toBe(true);
    expect(regions.has('Africa')).toBe(true);
  });

  it('includes all major airlines', () => {
    const codes = AIRLINES.map(a => a.code);
    ['FR', 'U2', 'BA', 'LH', 'AF', 'KL', 'EK', 'QR', 'TK', 'DL', 'UA', 'AA', 'WN', 'SQ', 'CX', 'QF', 'AC'].forEach(c => {
      expect(codes, `Missing ${c}`).toContain(c);
    });
  });
});

describe('lookupAirline', () => {
  it('finds Ryanair by IATA code', () => {
    const a = lookupAirline('FR');
    expect(a.name).toBe('Ryanair');
  });

  it('finds British Airways', () => {
    expect(lookupAirline('BA').name).toBe('British Airways');
  });

  it('finds Delta', () => {
    expect(lookupAirline('DL').name).toBe('Delta Air Lines');
  });

  it('is case-insensitive', () => {
    expect(lookupAirline('fr').name).toBe('Ryanair');
    expect(lookupAirline('Fr').name).toBe('Ryanair');
  });

  it('trims whitespace', () => {
    expect(lookupAirline(' BA ').name).toBe('British Airways');
  });

  it('returns null for unknown code', () => {
    expect(lookupAirline('ZZ')).toBeNull();
  });

  it('returns null for null/undefined input', () => {
    expect(lookupAirline(null)).toBeNull();
    expect(lookupAirline(undefined)).toBeNull();
    expect(lookupAirline('')).toBeNull();
  });
});

describe('searchAirlines', () => {
  it('finds by partial name', () => {
    const results = searchAirlines('British');
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].name).toBe('British Airways');
  });

  it('finds by IATA code', () => {
    const results = searchAirlines('EK');
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].name).toBe('Emirates');
  });

  it('returns empty for short queries', () => {
    expect(searchAirlines('A')).toEqual([]);
    expect(searchAirlines('')).toEqual([]);
  });

  it('limits to 12 results', () => {
    const results = searchAirlines('Air');
    expect(results.length).toBeLessThanOrEqual(12);
  });
});

describe('getAllAirlines', () => {
  it('returns all airlines when no region filter', () => {
    expect(getAllAirlines().length).toBe(AIRLINES.length);
  });

  it('filters by region', () => {
    const europe = getAllAirlines('Europe');
    expect(europe.length).toBeGreaterThan(10);
    expect(europe.every(a => a.region === 'Europe')).toBe(true);
  });
});

describe('getRegions', () => {
  it('returns sorted unique regions', () => {
    const regions = getRegions();
    expect(regions.length).toBeGreaterThanOrEqual(7);
    expect(regions).toEqual([...regions].sort());
  });
});

describe('checkBaggageCompliance', () => {
  it('returns compliant for suitcase that fits Ryanair', () => {
    const result = checkBaggageCompliance({ l: 55, w: 40, h: 20 }, 'FR');
    expect(result.compliant).toBe(true);
    expect(result.warnings).toHaveLength(0);
    expect(result.airline.name).toBe('Ryanair');
  });

  it('returns non-compliant for oversized suitcase on Ryanair', () => {
    const result = checkBaggageCompliance({ l: 60, w: 45, h: 25 }, 'FR');
    expect(result.compliant).toBe(false);
    expect(result.warnings.length).toBeGreaterThanOrEqual(1);
  });

  it('warns on each oversize dimension', () => {
    const result = checkBaggageCompliance({ l: 65, w: 50, h: 30 }, 'LH');
    expect(result.byDimension.length.over).toBe(true);
    expect(result.byDimension.width.over).toBe(true);
    expect(result.byDimension.height.over).toBe(true);
  });

  it('US airlines have no weight limit on carry-on', () => {
    expect(lookupAirline('DL').carryOn.weight).toBe(0);
    expect(lookupAirline('UA').carryOn.weight).toBe(0);
  });

  it('European budget airlines are strict', () => {
    expect(lookupAirline('FR').strictCarryOn).toBe(true);
    expect(lookupAirline('W6').strictCarryOn).toBe(true);
    expect(lookupAirline('FR').carryOnInBasic).toBe(false);
  });

  it('full-service airlines include carry-on in basic', () => {
    expect(lookupAirline('BA').carryOnInBasic).toBe(true);
    expect(lookupAirline('EK').carryOnInBasic).toBe(true);
    expect(lookupAirline('DL').carryOnInBasic).toBe(true);
  });

  it('returns null airline for unknown code', () => {
    const result = checkBaggageCompliance({ l: 55, w: 40, h: 20 }, 'ZZ');
    expect(result.airline).toBeNull();
    expect(result.compliant).toBe(true); // No airline = no policy to violate
  });

  it('byDimension has length/width/height/total', () => {
    const result = checkBaggageCompliance({ l: 55, w: 40, h: 20 }, 'BA');
    expect(result.byDimension.length).toBeDefined();
    expect(result.byDimension.width).toBeDefined();
    expect(result.byDimension.height).toBeDefined();
    expect(result.byDimension.total).toBeDefined();
  });

  it('most generous is Southwest', () => {
    const sw = lookupAirline('WN');
    // 24×16×10 inches = 60×40×25 cm
    expect(sw.carryOn.l).toBeGreaterThanOrEqual(60);
  });

  it('strictest carry-on weight is Air China at 5kg', () => {
    const ca = lookupAirline('CA');
    expect(ca.carryOn.weight).toBe(5);
  });

  it('each airline has valid personal item dimensions', () => {
    AIRLINES.forEach(a => {
      expect(a.personal.l).toBeGreaterThan(0);
      expect(a.personal.w).toBeGreaterThan(0);
      expect(a.personal.h).toBeGreaterThan(0);
    });
  });
});
