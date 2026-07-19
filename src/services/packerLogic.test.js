import { describe, it, expect } from 'vitest';
import { generatePackingList, doColorsMatch } from './packerLogic';

const makeWeather = (locationName, { maxTemps, minTemps, precip, days = 5 } = {}) => ({
  locationName,
  weather: {
    time: Array.from({ length: days }, (_, i) => `2026-01-${String(i + 1).padStart(2, '0')}`),
    temperature_2m_max: maxTemps || Array(days).fill(20),
    temperature_2m_min: minTemps || Array(days).fill(10),
    precipitation_sum: precip || Array(days).fill(0)
  }
});

// Fixed arg order for generatePackingList so each test only varies what it cares about
const pack = ({
  weatherDataArray,
  tripDuration,
  suitcaseVolume = 0,
  gender = 'other',
  paletteKey = 'quiet-luxury',
  travelMode = 'flying',
  dailyActivities = [],
  userWardrobe = [],
  packingStrategy = 'standard',
  techPorts = 'mixed',
  dailyDestinations = [],
  formDestinations,
  laundryCycle = 7
}) => generatePackingList(
  weatherDataArray, tripDuration, gender, suitcaseVolume, paletteKey, travelMode,
  dailyActivities, userWardrobe, packingStrategy, techPorts, dailyDestinations,
  formDestinations, laundryCycle
);

describe('doColorsMatch', () => {
  it('treats identical colors as matching', () => {
    expect(doColorsMatch('black', 'black')).toBe(true);
  });

  it('is case-insensitive', () => {
    expect(doColorsMatch('Black', 'WHITE')).toBe(true);
  });

  it('treats a missing color as matching anything (fail-open)', () => {
    expect(doColorsMatch(null, 'black')).toBe(true);
    expect(doColorsMatch('black', undefined)).toBe(true);
  });

  it('is symmetric', () => {
    expect(doColorsMatch('black', 'white')).toBe(doColorsMatch('white', 'black'));
    expect(doColorsMatch('grey', 'red')).toBe(doColorsMatch('red', 'grey'));
  });

  it('rejects colors with no listed relationship', () => {
    expect(doColorsMatch('purple', 'yellow')).toBe(false);
  });
});

describe('generatePackingList', () => {
  it('returns one outfit combination per day of the trip (regression: outfitCombinations was previously always empty)', () => {
    const weatherDataArray = [makeWeather('Testville', { days: 4 })];
    const result = pack({ weatherDataArray, tripDuration: 4, formDestinations: ['Testville'] });

    expect(result.outfitCombinations).toHaveLength(4);
    result.outfitCombinations.forEach((day, i) => {
      expect(day.day).toBe(i + 1);
      expect(day.top).toBeTruthy();
      expect(day.bottom).toBeTruthy();
      expect(day.shoe).toBeTruthy();
    });
  });

  it('injects a fleece mid-layer and rain shell when the trip has a cold day', () => {
    const weatherDataArray = [makeWeather('Reykjavik', { days: 3, maxTemps: [5, 5, 5] })];
    const result = pack({ weatherDataArray, tripDuration: 3, formDestinations: ['Reykjavik'] });

    const allNames = Object.values(result.list).flat().map(i => i.name);
    expect(allNames).toContain('Fleece Mid-Layer');
    expect(allNames).toContain('Rain Shell / Windbreaker');
  });

  it('does not inject cold-weather layers on an all-warm trip', () => {
    const weatherDataArray = [makeWeather('Miami', { days: 3, maxTemps: [30, 30, 30] })];
    const result = pack({ weatherDataArray, tripDuration: 3, formDestinations: ['Miami'] });

    const allNames = Object.values(result.list).flat().map(i => i.name);
    expect(allNames).not.toContain('Fleece Mid-Layer');
    expect(allNames).not.toContain('Rain Shell / Windbreaker');
  });

  it('caps base-layer clothing counts at the laundry cycle, not the full trip duration', () => {
    const weatherDataArray = [makeWeather('Anywhere', { days: 10 })];
    const result = pack({ weatherDataArray, tripDuration: 10, formDestinations: ['Anywhere'], laundryCycle: 5 });

    const allItems = Object.values(result.list).flat();
    const underwear = allItems.find(i => i.id === 'w1');
    const socks = allItems.find(i => i.id === 'w2');

    expect(underwear.name).toBe('5x Pairs of Underwear');
    expect(socks.name).toBe('5x Pairs of Socks');
    // a 10-day trip on a 5-day wash cycle needs detergent
    expect(allItems.some(i => i.name.includes('Laundry Detergent'))).toBe(true);
  });

  it('does not pack laundry detergent when the trip is shorter than the wash cycle', () => {
    const weatherDataArray = [makeWeather('Anywhere', { days: 3 })];
    const result = pack({ weatherDataArray, tripDuration: 3, formDestinations: ['Anywhere'], laundryCycle: 7 });

    const allItems = Object.values(result.list).flat();
    expect(allItems.some(i => i.name.includes('Laundry Detergent'))).toBe(false);
  });

  it('prunes optional items under a tight suitcase but never drops essential or worn items', () => {
    const weatherDataArray = [makeWeather('Anywhere', { days: 5 })];

    const roomy = pack({ weatherDataArray, tripDuration: 5, formDestinations: ['Anywhere'], suitcaseVolume: 0 });
    const roomyItems = Object.values(roomy.list).flat();
    const essentialIds = new Set(roomyItems.filter(i => i.isWorn || i.isEssential).map(i => i.id));

    // Unconstrained volume is deterministic for fixed inputs -- constrain to roughly a
    // third of it, comfortably small enough to force real pruning either way.
    const tightSuitcase = Math.round(roomy.currentVolume / 3);
    const tight = pack({ weatherDataArray, tripDuration: 5, formDestinations: ['Anywhere'], suitcaseVolume: tightSuitcase });
    const tightItems = Object.values(tight.list).flat();
    const tightIds = new Set(tightItems.map(i => i.id));

    for (const id of essentialIds) {
      expect(tightIds.has(id)).toBe(true);
    }
    expect(tightItems.length).toBeLessThan(roomyItems.length);
  });

  it('excludes worn (travel-day) items from the reported suitcase volume', () => {
    const weatherDataArray = [makeWeather('Anywhere', { days: 5 })];
    const result = pack({ weatherDataArray, tripDuration: 5, formDestinations: ['Anywhere'] });

    const wornVolume = result.list.plane.reduce((s, i) => s + i.vol, 0);
    const allVolume = Object.values(result.list).flat().reduce((s, i) => s + i.vol, 0);

    expect(result.list.plane.length).toBeGreaterThan(0);
    expect(wornVolume).toBeGreaterThan(0);
    expect(result.currentVolume).toBe(allVolume - wornVolume);
  });
});
