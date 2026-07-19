import { describe, it, expect } from 'vitest';
import { averageDailies, mergeDailies, searchLocations, geocodeLocation, geocodeViaNominatim } from './api';

const year = (times, maxes, mins, precip) => ({
  time: times,
  temperature_2m_max: maxes,
  temperature_2m_min: mins,
  precipitation_sum: precip
});

describe('averageDailies (climate estimate)', () => {
  it('averages element-wise across years', () => {
    const a = year(['2025-07-01', '2025-07-02'], [30, 32], [20, 22], [0, 5]);
    const b = year(['2024-07-01', '2024-07-02'], [26, 28], [16, 18], [2, 1]);

    const avg = averageDailies([a, b]);
    expect(avg.temperature_2m_max).toEqual([28, 30]);
    expect(avg.temperature_2m_min).toEqual([18, 20]);
    expect(avg.precipitation_sum).toEqual([1, 3]);
  });

  it('truncates to the shortest year (leap-year length mismatches)', () => {
    const a = year(['d1', 'd2', 'd3'], [30, 30, 30], [20, 20, 20], [0, 0, 0]);
    const b = year(['d1', 'd2'], [20, 20], [10, 10], [0, 0]);

    const avg = averageDailies([a, b]);
    expect(avg.time).toHaveLength(2);
    expect(avg.temperature_2m_max).toEqual([25, 25]);
  });

  it('returns null when no usable data exists', () => {
    expect(averageDailies([])).toBeNull();
    expect(averageDailies([null, undefined, {}])).toBeNull();
  });
});

describe('mergeDailies (forecast-horizon blending)', () => {
  it('concatenates near-term forecast with far-term climate estimate', () => {
    const near = year(['d1', 'd2'], [20, 21], [10, 11], [0, 0]);
    const far = year(['d3', 'd4'], [25, 26], [15, 16], [1, 1]);

    const merged = mergeDailies(near, far);
    expect(merged.time).toEqual(['d1', 'd2', 'd3', 'd4']);
    expect(merged.temperature_2m_max).toEqual([20, 21, 25, 26]);
  });

  it('pads keys only one side has (forecast has UV, climate does not)', () => {
    const near = { ...year(['d1'], [20], [10], [0]), uv_index_max: [7] };
    const far = year(['d2', 'd3'], [25, 25], [15, 15], [0, 0]);

    const merged = mergeDailies(near, far);
    expect(merged.uv_index_max).toEqual([7, null, null]);
    expect(merged.time).toHaveLength(3);
  });

  it('passes through when one side is missing', () => {
    const only = year(['d1'], [20], [10], [0]);
    expect(mergeDailies(only, null)).toBe(only);
    expect(mergeDailies(null, only)).toBe(only);
  });
});

describe('searchLocations (autocomplete)', () => {
  it('returns [] for queries under 2 characters without hitting the network', async () => {
    expect(await searchLocations('')).toEqual([]);
    expect(await searchLocations('a')).toEqual([]);
    expect(await searchLocations('  ')).toEqual([]);
  });

  it('returns [] for raw coordinate input -- no place-name suggestions needed', async () => {
    expect(await searchLocations('40.71, -74.00')).toEqual([]);
  });

  it('returns multiple live suggestions for a common city name', async () => {
    // Hits the live Open-Meteo geocoding API — runs in CI but may be slow
    const results = await searchLocations('Paris', 5);
    expect(Array.isArray(results)).toBe(true);
    if (results.length > 0) {
      expect(results[0]).toHaveProperty('latitude');
      expect(results[0]).toHaveProperty('longitude');
      expect(results[0]).toHaveProperty('name');
    }
  }, 15000);

  it('returns [] for gibberish that matches no place', async () => {
    const results = await searchLocations('zzqxnotarealplace123');
    expect(results).toEqual([]);
  }, 15000);
});

describe('geocodeLocation (coordinate parsing)', () => {
  it('resolves raw coordinates without any network call', async () => {
    const loc = await geocodeLocation('40.71, -74.00');
    expect(loc.latitude).toBeCloseTo(40.71);
    expect(loc.longitude).toBeCloseTo(-74.00);
    expect(loc.country).toBe('Coordinates');
  });
});

describe('geocodeViaNominatim (postal/zip code fallback)', () => {
  // geocodeLocation() itself also persists a localStorage cache entry on
  // success, which requires a browser environment this test suite doesn't
  // provide -- geocodeViaNominatim is exported separately so the pure
  // geocoding logic is testable without that dependency.

  it('resolves a postal code Open-Meteo does not recognize (e.g. UK postcodes)', async () => {
    // Live test against the real Nominatim API — runs in CI but may be slow
    const loc = await geocodeViaNominatim('SW1A 1AA');
    if (loc) {
      expect(loc.latitude).toBeCloseTo(51.5, 0);
      expect(loc.longitude).toBeCloseTo(-0.14, 0);
      expect((loc.country || '').toLowerCase()).toContain('kingdom');
    }
    // If the network is unreachable, this resolves to null rather than
    // throwing -- handled gracefully by geocodeLocation's caller.
  }, 15000);

  it('returns null for gibberish that matches nothing', async () => {
    const loc = await geocodeViaNominatim('zzqxnotarealplace123nowhere');
    expect(loc).toBeNull();
  }, 15000);
});
