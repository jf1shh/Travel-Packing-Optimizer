import { describe, it, expect } from 'vitest';
import { lookupByBarcode, searchByBrand, getAllBrands, getModelsForBrand, MODELS } from './suitcaseDatabase';

describe('lookupByBarcode', () => {
  it('finds Away Carry-On by full UPC prefix match', () => {
    const result = lookupByBarcode('81875802');
    expect(result).not.toBeNull();
    expect(result.brand).toBe('Away');
    expect(result.model).toBe('The Carry-On');
    expect(result.l).toBe(55.0);
    expect(result.w).toBe(34.8);
    expect(result.h).toBe(22.8);
    expect(result.preset).toBe('away-carry');
  });

  it('finds Monos Carry-On by prefix', () => {
    const result = lookupByBarcode('860009770001');
    expect(result).not.toBeNull();
    expect(result.brand).toBe('Monos');
    expect(result.preset).toBe('monos-carry');
  });

  it('finds BÉIS Carry-On Roller by prefix', () => {
    const result = lookupByBarcode('85001676');
    expect(result).not.toBeNull();
    expect(result.brand).toBe('BÉIS');
    expect(result.preset).toBe('beis-roller');
  });

  it('finds Samsonite Check-In Large by prefix', () => {
    const result = lookupByBarcode('04372524');
    expect(result).not.toBeNull();
    expect(result.brand).toBe('Samsonite');
    expect(result.preset).toBe('samsonite-check');
  });

  it('returns null for non-matching barcode', () => {
    expect(lookupByBarcode('999999999999')).toBeNull();
  });

  it('returns null for empty barcode', () => {
    expect(lookupByBarcode('')).toBeNull();
  });

  it('returns null for null/undefined barcode', () => {
    expect(lookupByBarcode(null)).toBeNull();
    expect(lookupByBarcode(undefined)).toBeNull();
  });

  it('returns null for short barcode (< 8 chars)', () => {
    expect(lookupByBarcode('12345')).toBeNull();
  });

  it('strips whitespace and hyphens from barcode', () => {
    const result = lookupByBarcode('8187-5802');
    expect(result).not.toBeNull();
    expect(result.brand).toBe('Away');
  });

  it('finds Travelpro Platinum Elite by prefix', () => {
    const result = lookupByBarcode('02567421');
    expect(result).not.toBeNull();
    expect(result.brand).toBe('Travelpro');
    expect(result.preset).toBe('travelpro-21');
  });

  it('finds Osprey Farpoint 40L by prefix', () => {
    const result = lookupByBarcode('84513608');
    expect(result).not.toBeNull();
    expect(result.brand).toBe('Osprey');
    expect(result.preset).toBe('osprey-40');
  });
});

describe('searchByBrand', () => {
  it('finds models by brand name (case-insensitive)', () => {
    const results = searchByBrand('away');
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].brand).toBe('Away');
  });

  it('finds models by partial brand name', () => {
    const results = searchByBrand('samso');
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results.every(r => r.brand.toLowerCase().includes('samsonite'))).toBe(true);
  });

  it('finds models by model name', () => {
    const results = searchByBrand('Farpoint');
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results.some(r => r.model.includes('Farpoint'))).toBe(true);
  });

  it('returns empty array for query shorter than 2 chars', () => {
    expect(searchByBrand('a')).toEqual([]);
    expect(searchByBrand('')).toEqual([]);
  });

  it('returns empty array for non-matching query', () => {
    expect(searchByBrand('zzzznonexistent')).toEqual([]);
  });

  it('deduplicates results', () => {
    // 'carry-on' appears in many models — should still be unique brand|model pairs
    const results = searchByBrand('carry-on');
    const keys = results.map(r => `${r.brand}|${r.model}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('limits results to 12 items', () => {
    // 'carry' should match many models
    const results = searchByBrand('carry');
    expect(results.length).toBeLessThanOrEqual(12);
  });
});

describe('getAllBrands', () => {
  it('returns sorted unique brand names', () => {
    const brands = getAllBrands();
    expect(brands.length).toBeGreaterThan(5);
    expect(brands).toEqual([...brands].sort());
    expect(new Set(brands).size).toBe(brands.length); // no dupes
  });

  it('includes major brands', () => {
    const brands = getAllBrands();
    expect(brands).toContain('Away');
    expect(brands).toContain('Rimowa');
    expect(brands).toContain('Samsonite');
    expect(brands).toContain('Osprey');
  });
});

describe('getModelsForBrand', () => {
  it('returns all models for Away (case-insensitive)', () => {
    const models = getModelsForBrand('away');
    expect(models.length).toBeGreaterThanOrEqual(2);
    expect(models.every(m => m.brand.toLowerCase() === 'away')).toBe(true);
  });

  it('returns empty array for unknown brand', () => {
    expect(getModelsForBrand('FakeBrand')).toEqual([]);
  });

  it('returns empty for empty/undefined input', () => {
    expect(getModelsForBrand('')).toEqual([]);
    expect(getModelsForBrand(null)).toEqual([]);
  });

  it('returns both carry-on and check-in types for Samsonite', () => {
    const models = getModelsForBrand('Samsonite');
    const types = new Set(models.map(m => m.type));
    expect(types.has('carry-on')).toBe(true);
    expect(types.has('check-in')).toBe(true);
  });
});

describe('MODELS array integrity', () => {
  it('every model has required fields', () => {
    MODELS.forEach(m => {
      expect(typeof m.brand).toBe('string');
      expect(typeof m.model).toBe('string');
      expect(typeof m.l).toBe('number');
      expect(typeof m.w).toBe('number');
      expect(typeof m.h).toBe('number');
      expect(m.l).toBeGreaterThan(0);
      expect(m.w).toBeGreaterThan(0);
      expect(m.h).toBeGreaterThan(0);
      expect(['carry-on', 'check-in', 'backpack']).toContain(m.type);
      expect(typeof m.preset).toBe('string');
      expect(Array.isArray(m.upcPrefixes)).toBe(true);
    });
  });

  it('has no duplicate brand+model combinations', () => {
    const keys = MODELS.map(m => `${m.brand}|${m.model}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('has at least one model per major brand', () => {
    const majorBrands = ['Away', 'Rimowa', 'Samsonite', 'Monos', 'Travelpro', 'BÉIS', 'Osprey', 'Peak Design', 'Tumi'];
    majorBrands.forEach(brand => {
      expect(MODELS.some(m => m.brand === brand), `Missing brand: ${brand}`).toBe(true);
    });
  });
});
