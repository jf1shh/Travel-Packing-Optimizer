import { describe, it, expect } from 'vitest';
import { encodeTripData, decodeTripData, sanitizeWardrobeItem } from './share';

describe('share encode/decode', () => {
  it('round-trips a valid wardrobe and trip state', () => {
    const wardrobe = [
      { id: 'w-1', name: 'Blue Jeans', category: 'bottom', bulkiness: 'standard', material: 'denim', color: 'blue', vol: 800, weight: 400 }
    ];
    const tripState = { packingList: { main: [{ id: 'top0', name: 'White Tee', category: 'clothes', cube: 'main', checked: false, vol: 300, weight: 150, priority: 9 }] }, suitcaseVolume: 43000, tempUnit: 'F' };

    const code = encodeTripData(wardrobe, tripState);
    expect(code).toBeTruthy();

    const decoded = decodeTripData(code);
    expect(decoded.w).toHaveLength(1);
    expect(decoded.w[0].name).toBe('Blue Jeans');
    expect(decoded.s.packingList.main[0].name).toBe('White Tee');
    expect(decoded.s.suitcaseVolume).toBe(43000);
    expect(decoded.s.tempUnit).toBe('F');
  });

  it('returns null for garbage or empty payloads', () => {
    expect(decodeTripData('not-a-real-payload')).toBeNull();
    expect(decodeTripData('')).toBeNull();
    expect(decodeTripData(encodeTripData('nonsense', 42))).toBeNull();
  });

  it('sanitizes hostile wardrobe items instead of persisting them as-is', () => {
    const hostile = [
      {},                                        // no name -> dropped
      { name: 12345 },                           // non-string name -> dropped
      { name: 'Ok Item', category: 'exploit', vol: 'zzz', weight: -50, bulkiness: '__proto__' }
    ];
    const decoded = decodeTripData(encodeTripData(hostile, null));

    expect(decoded.w).toHaveLength(1);
    expect(decoded.w[0].name).toBe('Ok Item');
    expect(decoded.w[0].category).toBe('top');       // unknown category coerced
    expect(decoded.w[0].bulkiness).toBe('standard'); // unknown bulkiness coerced
    expect(decoded.w[0].vol).toBe(400);              // non-numeric -> default
  });

  it('drops unknown packing-list groups and clamps numeric fields', () => {
    const tripState = {
      packingList: {
        main: [{ id: 'x', name: 'Thing', vol: 1e12, weight: 100, priority: 99 }],
        evilGroup: [{ name: 'Injected' }]
      }
    };
    const decoded = decodeTripData(encodeTripData(null, tripState));

    expect(decoded.s.packingList.evilGroup).toBeUndefined();
    expect(decoded.s.packingList.main[0].vol).toBe(100000); // clamped
    expect(decoded.s.packingList.main[0].priority).toBe(10); // clamped
  });
});

describe('sanitizeWardrobeItem', () => {
  it('truncates oversized strings', () => {
    const item = sanitizeWardrobeItem({ name: 'x'.repeat(500) });
    expect(item.name).toHaveLength(100);
  });

  it('preserves a valid evening tag and coerces anything else to day', () => {
    expect(sanitizeWardrobeItem({ name: 'Silk Top', time: 'evening' }).time).toBe('evening');
    expect(sanitizeWardrobeItem({ name: 'Tee', time: 'midnight' }).time).toBe('day');
    expect(sanitizeWardrobeItem({ name: 'Tee' }).time).toBe('day');
  });

  it('rejects non-objects', () => {
    expect(sanitizeWardrobeItem(null)).toBeNull();
    expect(sanitizeWardrobeItem('string')).toBeNull();
    expect(sanitizeWardrobeItem([1, 2])).toBeNull();
  });
});
