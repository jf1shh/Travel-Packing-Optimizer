import { describe, it, expect } from 'vitest';
import { generatePackingList, deriveCube } from './packerLogic';

const makeWeather = (locationName, { maxTemps, minTemps, precip, uv, days = 5 } = {}) => ({
  locationName,
  weather: {
    time: Array.from({ length: days }, (_, i) => `2026-01-${String(i + 1).padStart(2, '0')}`),
    temperature_2m_max: maxTemps || Array(days).fill(20),
    temperature_2m_min: minTemps || Array(days).fill(10),
    precipitation_sum: precip || Array(days).fill(0),
    ...(uv ? { uv_index_max: uv } : {})
  }
});

const pack = ({
  weatherDataArray, tripDuration, suitcaseVolume = 0, gender = 'other',
  paletteKey = 'quiet-luxury', travelMode = 'flying', dailyActivities = [],
  userWardrobe = [], packingStrategy = 'standard', techPorts = 'mixed',
  dailyDestinations = [], formDestinations, laundryCycle = 7, options = {}
}) => generatePackingList(
  weatherDataArray, tripDuration, gender, suitcaseVolume, paletteKey, travelMode,
  dailyActivities, userWardrobe, packingStrategy, techPorts, dailyDestinations,
  formDestinations, laundryCycle, options
);

describe('Stress tests', () => {
  it('handles a 30-day trip with no crash or infinite loop', () => {
    const weatherDataArray = [makeWeather('Anywhere', { days: 30 })];
    const result = pack({
      weatherDataArray, tripDuration: 30, formDestinations: ['Anywhere'],
      laundryCycle: 5
    });

    expect(result.outfitCombinations).toHaveLength(30);
    // All groups should exist
    ['plane', 'main', 'base', 'liquid', 'dry', 'tech'].forEach(key => {
      expect(Array.isArray(result.list[key])).toBe(true);
    });
    // No NaN anywhere
    expect(result.currentVolume).not.toBeNaN();
    expect(result.currentWeight).not.toBeNaN();
    expect(result.currentWeight).toBeGreaterThan(0);
  });

  it('handles extreme cold (-30°C) without error', () => {
    const weatherDataArray = [makeWeather('Siberia', {
      days: 5, maxTemps: [-30, -28, -25, -22, -20],
      minTemps: [-40, -38, -35, -32, -30]
    })];
    const result = pack({
      weatherDataArray, tripDuration: 5, formDestinations: ['Siberia'],
      dailyActivities: ['ski', 'ski', 'ski', 'ski', 'ski']
    });

    expect(result.outfitCombinations).toHaveLength(5);
    // Should include every cold-weather item
    const allNames = Object.values(result.list).flat().map(i => i.name);
    expect(allNames).toContain('Fleece Mid-Layer');
    expect(allNames).toContain('Rain Shell / Windbreaker');
  });

  it('handles extreme heat (45°C) without error', () => {
    const weatherDataArray = [makeWeather('Dubai', {
      days: 5, maxTemps: [45, 44, 43, 45, 44],
      minTemps: [32, 31, 30, 32, 31], uv: [11, 11, 11, 11, 11]
    })];
    const result = pack({
      weatherDataArray, tripDuration: 5, formDestinations: ['Dubai']
    });

    expect(result.outfitCombinations).toHaveLength(5);
    const allNames = Object.values(result.list).flat().map(i => i.name);
    expect(allNames).toContain('Sunglasses');
  });

  it('handles a micro-suitcase (1L) without crashing', () => {
    const weatherDataArray = [makeWeather('Anywhere', { days: 3 })];
    const result = pack({
      weatherDataArray, tripDuration: 3, formDestinations: ['Anywhere'],
      suitcaseVolume: 1000 // 1L
    });

    // All essential items survive; nothing crashes
    const allItems = Object.values(result.list).flat();
    const essentials = allItems.filter(i => i.isEssential || i.isWorn);
    essentials.forEach(item => {
      expect(item.removed).toBeFalsy();
    });
    // Essentials survive; volume can exceed capacity since essentials are
    // always kept (the knapsack only prunes optionals)
    expect(result.currentVolume).toBeGreaterThan(0);
    expect(result.currentVolume).toBeLessThan(5000);
  });

  it('handles all 10 activity types active across days', () => {
    const weatherDataArray = [makeWeather('Anywhere', { days: 10 })];
    const activities = ['formal', 'gym', 'beach', 'hike', 'ski', 'business', 'nightout', 'sightseeing', 'transit', ''];
    const result = pack({
      weatherDataArray, tripDuration: 10, formDestinations: ['Anywhere'],
      dailyActivities: activities
    });

    expect(result.outfitCombinations).toHaveLength(10);
    const allItems = Object.values(result.list).flat();
    // Formal/nightout days with the quiet-luxury palette are covered by real
    // evening pieces, so their generic placeholders are intentionally skipped.
    // Verify they're absent and that non-dressy activity gear appears instead.
    expect(allItems.some(i => i.name === 'Formal Attire (Top & Bottom)')).toBe(false);
    expect(allItems.some(i => i.name === 'Evening Outfit')).toBe(false);
    expect(allItems.some(i => i.name === 'Gym Outfit')).toBe(true);
    expect(allItems.some(i => i.name === 'Swimsuit / Trunks')).toBe(true);
    expect(allItems.some(i => i.name === 'Hiking Pants / Leggings')).toBe(true);
    expect(allItems.some(i => i.name === 'Snow Pants')).toBe(true);
    expect(allItems.some(i => i.name === 'Suit / Business Attire')).toBe(true);
    expect(allItems.some(i => i.name === 'Comfortable Walking Shoes')).toBe(true);
    expect(allItems.some(i => i.name === 'Noise-Canceling Headphones')).toBe(true);
  });

  it('handles 5 destinations with different weather', () => {
    const weatherDataArray = [
      makeWeather('London', { days: 3, maxTemps: [10, 12, 11], precip: [5, 2, 8] }),
      makeWeather('Paris', { days: 3, maxTemps: [15, 16, 14], precip: [0, 0, 0] }),
      makeWeather('Rome', { days: 3, maxTemps: [28, 30, 29], uv: [8, 9, 8] }),
      makeWeather('Berlin', { days: 3, maxTemps: [5, 6, 4], precip: [0, 1, 0] }),
      makeWeather('Athens', { days: 3, maxTemps: [32, 34, 33], uv: [10, 10, 10] })
    ];
    const result = pack({
      weatherDataArray, tripDuration: 15,
      formDestinations: ['London', 'Paris', 'Rome', 'Berlin', 'Athens'],
      dailyDestinations: Array(15).fill(0).map((_, i) => {
        const d = i % 5;
        return ['London', 'Paris', 'Rome', 'Berlin', 'Athens'][d];
      }),
      options: { countryCodes: ['GB', 'FR', 'IT', 'DE', 'GR'] }
    });

    expect(result.outfitCombinations).toHaveLength(15);
    const allNames = Object.values(result.list).flat().map(i => i.name);
    // Mixed outlets -> generic adapter
    expect(allNames).not.toContain('Travel Adapter (Type G outlets)');
    expect(allNames).toContain('Universal Travel Adapter');
    // Cold + rainy -> umbrella and cold layers
    expect(allNames).toContain('Compact Travel Umbrella');
    expect(allNames).toContain('Fleece Mid-Layer');
    // Sunny + UV -> sunglasses
    expect(allNames).toContain('Sunglasses');
  });

  it('handles rapid repeated generation (idempotency check)', () => {
    const weatherDataArray = [makeWeather('Anywhere', { days: 3 })];
    // Run 5 times; each result should have the same shape
    const results = Array.from({ length: 5 }, () =>
      pack({ weatherDataArray, tripDuration: 3, formDestinations: ['Anywhere'] })
    );

    results.forEach((r, i) => {
      expect(r.outfitCombinations).toHaveLength(3);
      expect(r.currentVolume).toBeGreaterThan(0);
      expect(r.currentWeight).toBeGreaterThan(0);
      // Same deterministic inputs -> same volume every time
      expect(r.currentVolume).toBe(results[0].currentVolume);
    });
  });

  it('handles empty wardrobe with no user items', () => {
    const weatherDataArray = [makeWeather('Anywhere', { days: 3 })];
    const result = pack({
      weatherDataArray, tripDuration: 3, formDestinations: ['Anywhere'],
      userWardrobe: []
    });

    expect(result.outfitCombinations).toHaveLength(3);
    // Should still produce a valid list from palette defaults alone
    const allItems = Object.values(result.list).flat();
    expect(allItems.length).toBeGreaterThan(5);
  });

  it('handles minimalist packing strategy for long trip', () => {
    const weatherDataArray = [makeWeather('Anywhere', { days: 14 })];
    const result = pack({
      weatherDataArray, tripDuration: 14, formDestinations: ['Anywhere'],
      packingStrategy: 'minimalist', laundryCycle: 3
    });

    expect(result.outfitCombinations).toHaveLength(14);
    // With extreme minimalism + 3-day laundry, only ~3-4 tops/bottoms
    const topCount = Object.values(result.list).flat().filter(i => i.id.startsWith('top')).length;
    expect(topCount).toBeLessThanOrEqual(5);
  });

  it('handles no-laundry 30-day trip (packs everything)', () => {
    const weatherDataArray = [makeWeather('Anywhere', { days: 30 })];
    const result = pack({
      weatherDataArray, tripDuration: 30, formDestinations: ['Anywhere'],
      laundryCycle: 999
    });

    expect(result.outfitCombinations).toHaveLength(30);
    const underwear = Object.values(result.list).flat().find(i => i.id === 'w1');
    expect(underwear.name).toBe('30x Pairs of Underwear');
  });

  it('deriveCube maps known activity-gear items and edge cases', () => {
    // Items with explicit cube
    expect(deriveCube({ cube: 'liquid', category: 'toiletries', name: 'Lotion', isLiquid: true })).toBe('liquid');
    // Clothes item without explicit cube
    expect(deriveCube({ category: 'clothes', name: 'Blue Shirt' })).toBe('main');
    // Underwear → base
    expect(deriveCube({ category: 'clothes', name: '5x Underwear' })).toBe('base');
    // Socks → base
    expect(deriveCube({ category: 'clothes', name: 'Wool socks' })).toBe('base');
    // Jacket → loose
    expect(deriveCube({ category: 'clothes', name: 'Leather Jacket' })).toBe('loose');
    // Shoes → loose
    expect(deriveCube({ category: 'clothes', name: 'Running Shoes' })).toBe('loose');
    // Tech → tech
    expect(deriveCube({ category: 'tech', name: 'Charger' })).toBe('tech');
    // Liquid toiletry → liquid
    expect(deriveCube({ category: 'toiletries', name: 'Shampoo', isLiquid: true })).toBe('liquid');
    // Dry toiletry → dry
    expect(deriveCube({ category: 'toiletries', name: 'Deodorant', isLiquid: false })).toBe('dry');
    // Documents → dry
    expect(deriveCube({ category: 'documents', name: 'Passport' })).toBe('dry');
    // Unknown category → main
    expect(deriveCube({ category: 'unknown', name: 'Widget' })).toBe('main');
  });

  it('all 12 palettes produce valid outfit combinations without fallback', () => {
    const allPalettes = ['quiet-luxury', 'gorpcore', 'scandi', 'streetwear', 'dark-academia', 'athleisure', 'bohemian', 'preppy', 'rock', 'whimsigoth', 'coastal', 'cottagecore'];
    allPalettes.forEach(key => {
      const weatherDataArray = [makeWeather('Anywhere', { days: 3 })];
      const result = pack({
        weatherDataArray, tripDuration: 3, formDestinations: ['Anywhere'],
        paletteKey: key
      });
      expect(result.outfitCombinations.length).toBeGreaterThanOrEqual(1);
      result.outfitCombinations.forEach(day => {
        expect(day.top).toBeTruthy();
        expect(day.bottom).toBeTruthy();
        expect(day.shoe).toBeTruthy();
      });
    });
  });

  it('yellow, pink, and purple wardrobe items can form outfits (regression: missing COLOR_MATCHES entries)', () => {
    const weatherDataArray = [makeWeather('Anywhere', { days: 3 })];
    // Each previously-excluded color gets one top + one bottom; all should
    // produce day outfits in the generated schedule.
    const userWardrobe = [
      { name: 'Yellow Linen Shirt', category: 'top', color: 'yellow', vol: 300, weight: 150 },
      { name: 'Khaki Chinos', category: 'bottom', color: 'khaki', vol: 800, weight: 400 },
      { name: 'Pink Silk Blouse', category: 'top', color: 'pink', vol: 200, weight: 100 },
      { name: 'Grey Trousers', category: 'bottom', color: 'grey', vol: 700, weight: 350 },
      { name: 'Purple Cashmere Sweater', category: 'top', color: 'purple', vol: 500, weight: 250 },
      { name: 'Black Jeans', category: 'bottom', color: 'black', vol: 800, weight: 400 }
    ];
    const result = pack({
      weatherDataArray, tripDuration: 3, formDestinations: ['Anywhere'],
      userWardrobe
    });

    // Each top should appear on at least one day's outfit
    const allTops = result.outfitCombinations.map(c => c.top);
    expect(allTops).toContain('Yellow Linen Shirt');
    expect(allTops).toContain('Pink Silk Blouse');
    expect(allTops).toContain('Purple Cashmere Sweater');
  });
});
