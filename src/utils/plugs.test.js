import { describe, it, expect } from 'vitest';
import { getAdapterSuggestion, PLUG_TYPES } from './plugs';

describe('getAdapterSuggestion', () => {
  it('returns specific adapter for single US destination', () => {
    expect(getAdapterSuggestion(['US'])).toBe('Travel Adapter (Type A/B outlets)');
  });

  it('returns specific adapter for single GB destination', () => {
    expect(getAdapterSuggestion(['GB'])).toBe('Travel Adapter (Type G outlets)');
  });

  it('returns specific adapter for single EU destination', () => {
    expect(getAdapterSuggestion(['FR'])).toBe('Travel Adapter (Type C/E outlets)');
    expect(getAdapterSuggestion(['DE'])).toBe('Travel Adapter (Type C/F outlets)');
  });

  it('returns specific adapter for AUS destination', () => {
    expect(getAdapterSuggestion(['AU'])).toBe('Travel Adapter (Type I outlets)');
  });

  it('returns specific adapter when all countries share same plug type', () => {
    // US and CA both use A/B
    expect(getAdapterSuggestion(['US', 'CA'])).toBe('Travel Adapter (Type A/B outlets)');
    // GB and IE both use G
    expect(getAdapterSuggestion(['GB', 'IE'])).toBe('Travel Adapter (Type G outlets)');
  });

  it('returns null for mixed plug types', () => {
    // US (A/B) and GB (G) are different
    expect(getAdapterSuggestion(['US', 'GB'])).toBeNull();
    // FR (C/E) and DE (C/F) are different
    expect(getAdapterSuggestion(['FR', 'DE'])).toBeNull();
  });

  it('returns null for empty array', () => {
    expect(getAdapterSuggestion([])).toBeNull();
  });

  it('returns null for undefined/null input', () => {
    expect(getAdapterSuggestion(undefined)).toBeNull();
    expect(getAdapterSuggestion(null)).toBeNull();
  });

  it('returns null for unknown country code', () => {
    expect(getAdapterSuggestion(['XX'])).toBeNull();
  });

  it('returns null when any country in set is unknown', () => {
    // US known, XX unknown → null (fall back to universal)
    expect(getAdapterSuggestion(['US', 'XX'])).toBeNull();
  });

  it('deduplicates country codes', () => {
    // US repeated → still A/B
    expect(getAdapterSuggestion(['US', 'US', 'US'])).toBe('Travel Adapter (Type A/B outlets)');
  });

  it('is case-insensitive for country codes', () => {
    expect(getAdapterSuggestion(['us'])).toBe('Travel Adapter (Type A/B outlets)');
    expect(getAdapterSuggestion(['gb'])).toBe('Travel Adapter (Type G outlets)');
  });

  it('filters out empty/falsy country codes', () => {
    expect(getAdapterSuggestion(['US', '', null, undefined])).toBe('Travel Adapter (Type A/B outlets)');
  });

  it('handles many countries with same plug type', () => {
    // All Latin American type A/B
    expect(getAdapterSuggestion(['US', 'CA', 'MX', 'JP'])).toBe('Travel Adapter (Type A/B outlets)');
  });
});

describe('PLUG_TYPES integrity', () => {
  it('has entries for major countries', () => {
    expect(PLUG_TYPES.US).toBeDefined();
    expect(PLUG_TYPES.GB).toBeDefined();
    expect(PLUG_TYPES.FR).toBeDefined();
    expect(PLUG_TYPES.DE).toBeDefined();
    expect(PLUG_TYPES.AU).toBeDefined();
    expect(PLUG_TYPES.JP).toBeDefined();
    expect(PLUG_TYPES.CN).toBeDefined();
    expect(PLUG_TYPES.IN).toBeDefined();
  });

  it('all plug type values are non-empty strings', () => {
    Object.entries(PLUG_TYPES).forEach(([country, type]) => {
      expect(typeof type, `Invalid type for ${country}`).toBe('string');
      expect(type.length, `Empty type for ${country}`).toBeGreaterThan(0);
    });
  });

  it('all country codes are uppercase 2-letter codes', () => {
    Object.keys(PLUG_TYPES).forEach(cc => {
      expect(cc).toMatch(/^[A-Z]{2}$/);
    });
  });
});
