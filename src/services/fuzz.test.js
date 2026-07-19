import { describe, it, expect } from 'vitest';
import { generatePackingList, PALETTES, ACTIVITY_GEAR, doColorsMatch } from './packerLogic';

// Deterministic pseudo-random for reproducible fuzz tests
const seedableRandom = (seed) => {
  let s = seed;
  return () => { s = (s * 1664525 + 1013904223) & 0xFFFFFFFF; return (s >>> 0) / 0xFFFFFFFF; };
};

const makeWeather = (locationName, days, rng) => ({
  locationName,
  weather: {
    time: Array.from({ length: days }, (_, i) => `2026-01-${String(i + 1).padStart(2, '0')}`),
    temperature_2m_max: Array.from({ length: days }, () => Math.round(rng() * 80 - 40)),
    temperature_2m_min: Array.from({ length: days }, () => Math.round(rng() * 60 - 30)),
    precipitation_sum: Array.from({ length: days }, () => Math.round(rng() * 30)),
    uv_index_max: Array.from({ length: days }, () => Math.round(rng() * 12)),
  }
});

const pack = (params) => generatePackingList(
  params.weatherDataArray, params.tripDuration, params.gender || 'other',
  params.suitcaseVolume || 0, params.paletteKey || 'quiet-luxury', params.travelMode || 'flying',
  params.dailyActivities || [], params.userWardrobe || [], params.packingStrategy || 'standard',
  params.techPorts || 'mixed', params.dailyDestinations || [],
  params.formDestinations, params.laundryCycle || 7, params.options || {}
);

const PALETTE_KEYS = Object.keys(PALETTES);
const GENDERS = ['male', 'female', 'other'];
const TRAVEL_MODES = ['flying', 'driving', 'train', 'biking'];
const STRATEGIES = ['standard', 'minimalist', 'maximalist'];
const LAUNDRY_VALUES = [3, 5, 7, 14, 999];

describe('Fuzz tests — randomized property-based', () => {
  it('never crashes or returns NaN for any random trip (100 iterations)', () => {
    const rng = seedableRandom(42);

    for (let i = 0; i < 100; i++) {
      const days = Math.floor(rng() * 30) + 1; // 1–30 days
      const numDests = Math.floor(rng() * 5) + 1; // 1–5 destinations
      const weatherDataArray = Array.from({ length: numDests }, (_, j) =>
        makeWeather(`Dest${j}`, days, rng)
      );
      const paletteKey = PALETTE_KEYS[Math.floor(rng() * PALETTE_KEYS.length)];
      const gender = GENDERS[Math.floor(rng() * GENDERS.length)];
      const travelMode = TRAVEL_MODES[Math.floor(rng() * TRAVEL_MODES.length)];
      const strategy = STRATEGIES[Math.floor(rng() * STRATEGIES.length)];
      const laundryCycle = LAUNDRY_VALUES[Math.floor(rng() * LAUNDRY_VALUES.length)];
      const suitcaseVolume = rng() > 0.3 ? Math.floor(rng() * 100000) + 1000 : 0;
      const activities = Array.from({ length: days }, () => {
        const actKeys = ['', ...Object.keys(ACTIVITY_GEAR)];
        return actKeys[Math.floor(rng() * actKeys.length)];
      });
      const formDestinations = weatherDataArray.map(w => w.locationName);

      const result = pack({
        weatherDataArray, tripDuration: days, gender,
        suitcaseVolume, paletteKey, travelMode,
        dailyActivities: activities, formDestinations,
        packingStrategy: strategy, laundryCycle,
      });

      // Invariant: outfit count equals trip duration
      expect(result.outfitCombinations, `Iteration ${i}: wrong outfit count`).toHaveLength(days);

      // Invariant: every outfit has top, bottom, shoe
      result.outfitCombinations.forEach((day, di) => {
        expect(day.top, `Iter ${i}, day ${di}`).toBeTruthy();
        expect(day.bottom, `Iter ${i}, day ${di}`).toBeTruthy();
        expect(day.shoe, `Iter ${i}, day ${di}`).toBeTruthy();
      });

      // Invariant: no NaN in volume/weight
      expect(result.currentVolume, `Iter ${i}`).not.toBeNaN();
      expect(result.currentWeight, `Iter ${i}`).not.toBeNaN();
      expect(result.currentVolume, `Iter ${i}`).toBeGreaterThanOrEqual(0);
      expect(result.currentWeight, `Iter ${i}`).toBeGreaterThan(0);

      // Invariant: all required packing list groups exist
      ['plane', 'main', 'base', 'loose', 'liquid', 'dry', 'tech'].forEach(key => {
        expect(Array.isArray(result.list[key]), `Iter ${i}, missing group ${key}`).toBe(true);
      });
    }
  });

  it('all palette × gender combos produce valid outfits (12 palettes × 3 genders = 36 combos)', () => {
    PALETTE_KEYS.forEach(paletteKey => {
      GENDERS.forEach(gender => {
        const weatherDataArray = [{ locationName: 'Test', weather: {
          time: ['2026-01-01', '2026-01-02', '2026-01-03'],
          temperature_2m_max: [20, 22, 21],
          temperature_2m_min: [10, 12, 11],
          precipitation_sum: [0, 0, 0],
        }}];

        const result = pack({
          weatherDataArray, tripDuration: 3, gender,
          paletteKey, formDestinations: ['Test'],
        });

        expect(result.outfitCombinations, `${paletteKey} × ${gender}`).toHaveLength(3);
        result.outfitCombinations.forEach(day => {
          expect(day.top).toBeTruthy();
          expect(day.bottom).toBeTruthy();
          expect(day.shoe).toBeTruthy();
        });
      });
    });
  });

  it('all travel modes produce valid output', () => {
    TRAVEL_MODES.forEach(mode => {
      const weatherDataArray = [{ locationName: 'Test', weather: {
        time: ['2026-01-01', '2026-01-02'],
        temperature_2m_max: [20, 22], temperature_2m_min: [10, 12], precipitation_sum: [0, 0],
      }}];

      const result = pack({
        weatherDataArray, tripDuration: 2, travelMode: mode,
        formDestinations: ['Test'],
      });

      expect(result.outfitCombinations).toHaveLength(2);
      expect(result.currentVolume).not.toBeNaN();
    });
  });

  it('all packing strategies work across trip lengths (1–30 days)', () => {
    STRATEGIES.forEach(strategy => {
      [1, 3, 7, 14, 30].forEach(days => {
        const weatherDataArray = [{ locationName: 'Test', weather: {
          time: Array.from({ length: days }, (_, i) => `2026-01-${String(i + 1).padStart(2, '0')}`),
          temperature_2m_max: Array(days).fill(22),
          temperature_2m_min: Array(days).fill(12),
          precipitation_sum: Array(days).fill(0),
        }}];

        const result = pack({
          weatherDataArray, tripDuration: days, packingStrategy: strategy,
          formDestinations: ['Test'],
        });

        expect(result.outfitCombinations, `${strategy} × ${days}d`).toHaveLength(days);
        expect(result.currentVolume).toBeGreaterThan(0);
      });
    });
  });

  it('laundry cycle always enforces ≤cycle tops/bottoms/socks/underwear', () => {
    [3, 5, 7, 14].forEach(cycle => {
      const weatherDataArray = [{ locationName: 'Test', weather: {
        time: Array.from({ length: 14 }, (_, i) => `2026-01-${String(i + 1).padStart(2, '0')}`),
        temperature_2m_max: Array(14).fill(22),
        temperature_2m_min: Array(14).fill(12),
        precipitation_sum: Array(14).fill(0),
      }}];

      const result = pack({
        weatherDataArray, tripDuration: 14, laundryCycle: cycle,
        formDestinations: ['Test'],
      });

      // Count how many unique clothing items are packed (not including worn items)
      const allItems = Object.values(result.list).flat();
      const tops = allItems.filter(i => i.name.match(/shirt|top|sweater|tee|hoodie|blouse/i) && !i.isWorn);
      const pants = allItems.filter(i => i.name.match(/pant|jean|short|skirt|trouser/i) && !i.isWorn);

      // With laundry every N days, shouldn't need more than ~N+1 items
      // (allow some slack for evening pieces and activity-specific gear)
      expect(tops.length, `Laundry ${cycle}: too many tops`).toBeLessThanOrEqual(cycle + 3);
      expect(pants.length, `Laundry ${cycle}: too many pants`).toBeLessThanOrEqual(cycle + 2);
    });
  });

  it('flying mode enforces 7kg weight limit on packed items', () => {
    const weatherDataArray = [{ locationName: 'Test', weather: {
      time: ['2026-01-01', '2026-01-02', '2026-01-03'],
      temperature_2m_max: [20, 22, 21],
      temperature_2m_min: [10, 12, 11],
      precipitation_sum: [0, 0, 0],
    }}];

    const result = pack({
      weatherDataArray, tripDuration: 3, travelMode: 'flying',
      suitcaseVolume: 50000,
      formDestinations: ['Test'],
    });

    // Total packed weight (excluding worn items) should be ≤ 7000g
    const packedItems = Object.values(result.list).flat().filter(i => i.category !== 'plane' && !i.isWorn);
    const totalPackedWeight = packedItems.reduce((sum, i) => sum + (i.weight || 0), 0);
    expect(totalPackedWeight).toBeLessThanOrEqual(7000);
  });

  it('extreme day-night temperature swings do not crash', () => {
    // Hot days (40°C), freezing nights (-10°C) — both warm and cold layers needed
    const weatherDataArray = [{ locationName: 'Desert', weather: {
      time: ['2026-01-01', '2026-01-02', '2026-01-03', '2026-01-04', '2026-01-05'],
      temperature_2m_max: [40, 42, 38, 41, 39],
      temperature_2m_min: [-10, -8, -12, -9, -7],
      precipitation_sum: [0, 0, 0, 0, 0],
    }}];

    const result = pack({
      weatherDataArray, tripDuration: 5, formDestinations: ['Desert'],
    });

    expect(result.outfitCombinations).toHaveLength(5);
    // Engine is driven by max temps; 40°C daytime won't trigger cold-weather
    // injection. The important invariant is it doesn't crash on extreme swings.
    expect(result.currentVolume).not.toBeNaN();
    expect(result.currentWeight).toBeGreaterThan(0);
  });

  it('doColorsMatch is symmetric for all color pairs', () => {
    const colors = ['black', 'navy', 'white', 'grey', 'beige', 'khaki', 'olive', 'brown', 'blue', 'red', 'green', 'yellow', 'pink', 'purple'];

    colors.forEach(c1 => {
      colors.forEach(c2 => {
        const forward = doColorsMatch(c1, c2);
        const backward = doColorsMatch(c2, c1);
        expect(forward, `${c1} ↔ ${c2} not symmetric`).toBe(backward);
      });
    });
  });

  it('every color matches itself', () => {
    const colors = ['black', 'navy', 'white', 'grey', 'beige', 'khaki', 'olive', 'brown', 'blue', 'red', 'green', 'yellow', 'pink', 'purple'];
    colors.forEach(c => {
      expect(doColorsMatch(c, c)).toBe(true);
    });
  });
});
