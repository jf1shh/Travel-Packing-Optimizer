import { describe, it, expect } from 'vitest';
import { parseBulkText } from './parser';

describe('parseBulkText', () => {
  it('returns an empty array for empty or missing input', () => {
    expect(parseBulkText('')).toEqual([]);
    expect(parseBulkText(null)).toEqual([]);
  });

  it('parses a digit quantity into that many items with a matching category/material/color', () => {
    const items = parseBulkText('3 blue jeans');
    expect(items).toHaveLength(3);
    items.forEach(item => {
      expect(item.category).toBe('bottom');
      expect(item.material).toBe('denim');
      expect(item.color).toBe('blue');
    });
  });

  it('parses word-form quantities', () => {
    const items = parseBulkText('two black jackets');
    expect(items).toHaveLength(2);
    items.forEach(item => {
      expect(item.category).toBe('outer');
      expect(item.color).toBe('black');
    });
  });

  it('defaults to a quantity of 1 when none is specified', () => {
    const items = parseBulkText('grey wool sweater');
    expect(items).toHaveLength(1);
    expect(items[0].material).toBe('wool');
  });

  it('detects bulkiness keywords', () => {
    const [item] = parseBulkText('1 heavy winter coat');
    expect(item.bulkiness).toBe('bulky');
    expect(item.category).toBe('outer');
  });

  it('caps quantity at 20 to avoid runaway item counts on a typo', () => {
    const items = parseBulkText('50 pairs of socks');
    expect(items).toHaveLength(20);
  });

  it('splits multiple phrases on commas into separate items', () => {
    const items = parseBulkText('2 black shirts, 1 pair of hiking boots, 3 pairs of shorts');
    expect(items).toHaveLength(6); // 2 tops + 1 shoe + 3 bottoms
    expect(items.filter(i => i.category === 'top')).toHaveLength(2);
    expect(items.filter(i => i.category === 'shoe')).toHaveLength(1);
    expect(items.filter(i => i.category === 'bottom')).toHaveLength(3);
  });
});
