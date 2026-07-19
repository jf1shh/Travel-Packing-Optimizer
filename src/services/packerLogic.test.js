import { describe, it, expect } from 'vitest';
import { generatePackingList, doColorsMatch, deriveCube, PALETTES, ACTIVITY_GEAR } from './packerLogic';
import { getAdapterSuggestion } from '../utils/plugs';

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
  laundryCycle = 7,
  options = {}
}) => generatePackingList(
  weatherDataArray, tripDuration, gender, suitcaseVolume, paletteKey, travelMode,
  dailyActivities, userWardrobe, packingStrategy, techPorts, dailyDestinations,
  formDestinations, laundryCycle, options
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

describe('getAdapterSuggestion', () => {
  it('suggests a specific adapter for a single known country', () => {
    expect(getAdapterSuggestion(['GB'])).toContain('Type G');
  });

  it('suggests a specific adapter when all countries share a plug type', () => {
    expect(getAdapterSuggestion(['GB', 'IE'])).toContain('Type G');
  });

  it('falls back to universal for mixed, unknown, or missing countries', () => {
    expect(getAdapterSuggestion(['GB', 'FR'])).toBeNull();
    expect(getAdapterSuggestion(['XX'])).toBeNull();
    expect(getAdapterSuggestion([])).toBeNull();
    expect(getAdapterSuggestion([undefined])).toBeNull();
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

  it('has a palette for every Fashion Archetype option in the UI (regression: "streetwear" silently fell back to quiet-luxury)', () => {
    const uiOptions = ['quiet-luxury', 'gorpcore', 'scandi', 'streetwear', 'dark-academia', 'athleisure', 'bohemian'];
    uiOptions.forEach(key => {
      expect(PALETTES[key], `missing palette for UI option: ${key}`).toBeDefined();
    });
  });

  it('maps every activity gear item to a valid packing-list group key (regression: activity swap crashed indexing by category)', () => {
    const groupKeys = ['plane', 'main', 'base', 'loose', 'liquid', 'dry', 'tech'];
    Object.values(ACTIVITY_GEAR).forEach(gear => {
      gear.items.forEach(item => {
        expect(groupKeys).toContain(deriveCube(item));
      });
    });
  });

  it('rotates outfits across days and only packs garments the schedule actually uses', () => {
    const weatherDataArray = [makeWeather('Mildtown', { days: 6 })];
    const result = pack({ weatherDataArray, tripDuration: 6, formDestinations: ['Mildtown'] });

    const scheduledTops = result.outfitCombinations.map(c => c.top);
    // Constant weather used to repeat the single thermally-best outfit every day
    expect(new Set(scheduledTops).size).toBeGreaterThan(1);

    // Every packed top is actually worn on some day of the schedule
    const packedTops = Object.values(result.list).flat().filter(i => i.id.startsWith('top'));
    expect(packedTops.length).toBeGreaterThan(0);
    packedTops.forEach(item => {
      expect(scheduledTops).toContain(item.name);
    });
  });

  it('filters explicitly gendered palette pieces for the menswear style', () => {
    const weatherDataArray = [makeWeather('Anywhere', { days: 6 })];
    const result = pack({ weatherDataArray, tripDuration: 6, formDestinations: ['Anywhere'], gender: 'male' });

    const allNames = Object.values(result.list).flat().map(i => i.name);
    allNames.forEach(name => expect(name).not.toMatch(/skirt|dress|blouse|heels/i));
    result.outfitCombinations.forEach(day => {
      expect(day.bottom).not.toMatch(/skirt/i);
    });
  });

  it('enforces the 7kg carry-on weight limit as a hard constraint when flying', () => {
    const weatherDataArray = [makeWeather('Anywhere', { days: 3 })];
    // Two black bottoms (black color-matches the default shoe, so both get
    // scheduled): the big-volume one becomes the worn travel-day item and is
    // exempt from the weight budget; the heavy small one stays packed and
    // blows the 7kg budget on its own.
    const userWardrobe = [
      { name: 'Puffy Snow Pants', category: 'bottom', vol: 2000, weight: 500, color: 'black' },
      { name: 'Iron Jeans', category: 'bottom', vol: 300, weight: 8000, color: 'black' }
    ];

    const flying = pack({ weatherDataArray, tripDuration: 3, formDestinations: ['Anywhere'], travelMode: 'flying', userWardrobe });
    const train = pack({ weatherDataArray, tripDuration: 3, formDestinations: ['Anywhere'], travelMode: 'train', userWardrobe });

    const flyingIds = new Set(Object.values(flying.list).flat().map(i => i.id));
    const trainIds = new Set(Object.values(train.list).flat().map(i => i.id));

    // t5 (nail clippers) is a low-priority optional: it must be shed when
    // essentials alone exceed the flying weight budget, and kept on a train
    expect(trainIds.has('t5')).toBe(true);
    expect(flyingIds.has('t5')).toBe(false);
    // essentials survive regardless
    expect(flyingIds.has('t6')).toBe(true);
  });

  it('adds an umbrella for rainy forecasts and nothing sun-related for mild ones', () => {
    const weatherDataArray = [makeWeather('Rainville', { days: 3, precip: [10, 12, 8] })];
    const result = pack({ weatherDataArray, tripDuration: 3, formDestinations: ['Rainville'] });

    const allNames = Object.values(result.list).flat().map(i => i.name);
    expect(allNames).toContain('Compact Travel Umbrella');
    expect(allNames.some(n => n.toLowerCase().includes('sunscreen'))).toBe(false);
  });

  it('adds sun protection on high-UV trips without duplicating activity sunscreen', () => {
    const weatherDataArray = [makeWeather('Sunville', { days: 3, maxTemps: [22, 22, 22], uv: [8, 9, 8] })];
    const plain = pack({ weatherDataArray, tripDuration: 3, formDestinations: ['Sunville'] });
    const plainNames = Object.values(plain.list).flat().map(i => i.name);
    expect(plainNames).toContain('Sunglasses');
    expect(plainNames.filter(n => n.toLowerCase().includes('sunscreen'))).toHaveLength(1);

    // Beach days already carry reef-safe sunscreen; don't pack a second one
    const beach = pack({ weatherDataArray, tripDuration: 3, formDestinations: ['Sunville'], dailyActivities: ['beach', 'beach', 'beach'] });
    const beachNames = Object.values(beach.list).flat().map(i => i.name);
    expect(beachNames.filter(n => n.toLowerCase().includes('sunscreen'))).toHaveLength(1);
  });

  it('names the exact plug adapter when all destinations share an outlet type', () => {
    const weatherDataArray = [makeWeather('London', { days: 3 })];
    const uk = pack({ weatherDataArray, tripDuration: 3, formDestinations: ['London'], options: { countryCodes: ['GB'] } });
    const ukAdapter = Object.values(uk.list).flat().find(i => i.id === 'e2');
    expect(ukAdapter.name).toContain('Type G');

    const mixed = pack({ weatherDataArray, tripDuration: 3, formDestinations: ['London'], options: { countryCodes: ['GB', 'FR'] } });
    const mixedAdapter = Object.values(mixed.list).flat().find(i => i.id === 'e2');
    expect(mixedAdapter.name).toBe('Universal Travel Adapter');
  });

  it('decays the priority of repeatedly-removed items but never of essentials', () => {
    const weatherDataArray = [makeWeather('Anywhere', { days: 3 })];
    const result = pack({
      weatherDataArray, tripDuration: 3, formDestinations: ['Anywhere'],
      options: { itemPreferences: { 'Nail Clippers & Tweezers': 3, 'Deodorant': 5 } }
    });

    const allItems = Object.values(result.list).flat();
    expect(allItems.find(i => i.id === 't5').priority).toBe(2); // 5 - 3
    expect(allItems.find(i => i.id === 't2').priority).toBe(10); // essential, untouched
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
