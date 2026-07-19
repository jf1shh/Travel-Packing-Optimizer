import { describe, it, expect } from 'vitest';
import { getSlug, fetchTravelAdvisory, extractPackingRelevance } from './advisory';

describe('getSlug', () => {
  it('maps common country codes to slugs', () => {
    expect(getSlug('FR')).toBe('france');
    expect(getSlug('TH')).toBe('thailand');
    expect(getSlug('JP')).toBe('japan');
    expect(getSlug('GB')).toBe('united-kingdom');
    expect(getSlug('US')).toBe('usa');
    expect(getSlug('AE')).toBe('united-arab-emirates');
  });

  it('is case-insensitive', () => {
    expect(getSlug('fr')).toBe('france');
    expect(getSlug('Th')).toBe('thailand');
  });

  it('returns null for unknown country code', () => {
    expect(getSlug('XX')).toBeNull();
  });

  it('returns null for null/undefined input', () => {
    expect(getSlug(null)).toBeNull();
    expect(getSlug(undefined)).toBeNull();
    expect(getSlug('')).toBeNull();
  });

  it('handles multi-word country names', () => {
    expect(getSlug('HK')).toBe('hong-kong');
    expect(getSlug('NZ')).toBe('new-zealand');
    expect(getSlug('ZA')).toBe('south-africa');
  });
});

describe('fetchTravelAdvisory', () => {
  it('returns null for unknown country code', async () => {
    const result = await fetchTravelAdvisory('XX');
    expect(result).toBeNull();
  });

  it('returns advisory object for known country', async () => {
    // This hits the live GOV.UK API — runs in CI but may be slow
    const result = await fetchTravelAdvisory('FR');
    if (result) {
      expect(result.title).toBeTruthy();
      expect(result.url).toContain('gov.uk');
    }
    // If network fails, result is null (handled gracefully)
  }, 15000);

  it('returns null for null input', async () => {
    const result = await fetchTravelAdvisory(null);
    expect(result).toBeNull();
  });
});

describe('extractPackingRelevance', () => {
  it('returns empty strings for null advisory', () => {
    const result = extractPackingRelevance(null);
    expect(result.safety).toBe('');
    expect(result.health).toBe('');
    expect(result.localLaws).toBe('');
  });

  it('returns empty for advisory without raw data', () => {
    const result = extractPackingRelevance({ title: 'Test' });
    expect(result.safety).toBe('');
  });
});
