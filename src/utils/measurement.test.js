import { describe, it, expect } from 'vitest';
import {
  pixelDistance,
  calibrateScale,
  pixelsToCm,
  estimateHeight,
  measureFromTaps,
  formatDimensions,
  REFERENCE_CARD_MM,
  REFERENCE_A4_MM,
} from './measurement';

describe('pixelDistance', () => {
  it('returns 0 for identical points', () => {
    expect(pixelDistance({ x: 10, y: 20 }, { x: 10, y: 20 })).toBe(0);
  });

  it('computes horizontal distance', () => {
    expect(pixelDistance({ x: 0, y: 0 }, { x: 100, y: 0 })).toBe(100);
  });

  it('computes vertical distance', () => {
    expect(pixelDistance({ x: 0, y: 0 }, { x: 0, y: 50 })).toBe(50);
  });

  it('computes diagonal distance (3-4-5 triangle)', () => {
    expect(pixelDistance({ x: 0, y: 0 }, { x: 300, y: 400 })).toBe(500);
  });

  it('handles negative coordinates', () => {
    expect(pixelDistance({ x: -10, y: -10 }, { x: -10, y: -30 })).toBe(20);
  });

  it('handles fractional coordinates', () => {
    const dist = pixelDistance({ x: 1.5, y: 2.5 }, { x: 4.5, y: 6.5 });
    expect(dist).toBeCloseTo(5, 1);
  });
});

describe('calibrateScale', () => {
  it('computes mm-per-pixel from reference object', () => {
    // Credit card long edge (85.6mm) is 200px → 0.428 mm/px
    expect(calibrateScale(200, 85.6)).toBeCloseTo(0.428, 3);
  });

  it('returns 0 for zero-pixel input (division-by-zero guard)', () => {
    expect(calibrateScale(0, 85.6)).toBe(0);
  });

  it('returns 0 for negative pixel input', () => {
    expect(calibrateScale(-50, 85.6)).toBe(0);
  });

  it('defaults to credit card width', () => {
    const result = calibrateScale(100);
    expect(result).toBeCloseTo(0.856, 3);
  });

  it('works with A4 paper as reference', () => {
    // A4 long edge (297mm) is 500px → 0.594 mm/px
    expect(calibrateScale(500, REFERENCE_A4_MM.height)).toBeCloseTo(0.594, 3);
  });
});

describe('pixelsToCm', () => {
  it('converts pixels to cm using scale', () => {
    // 500px × 0.1 mm/px = 50mm = 5.0cm
    expect(pixelsToCm(500, 0.1)).toBe(5.0);
  });

  it('returns 0 for zero pixels', () => {
    expect(pixelsToCm(0, 0.1)).toBe(0);
  });

  it('returns 0 for zero scale', () => {
    expect(pixelsToCm(500, 0)).toBe(0);
  });

  it('returns 0 for negative inputs', () => {
    expect(pixelsToCm(-100, 0.1)).toBe(0);
    expect(pixelsToCm(100, -0.1)).toBe(0);
  });

  it('rounds to 1 decimal place', () => {
    // 123px × 0.428 mm/px = 52.644mm = 5.2644cm → 5.3cm
    expect(pixelsToCm(123, 0.428)).toBe(5.3);
  });
});

describe('estimateHeight', () => {
  it('estimates height as ~65% of width', () => {
    expect(estimateHeight(35.6)).toBeCloseTo(23.1, 0);
  });

  it('returns 0 for zero width', () => {
    expect(estimateHeight(0)).toBe(0);
  });

  it('produces a value between 50-80% of width for typical suitcase widths', () => {
    [30, 35, 40, 45, 50].forEach(w => {
      const h = estimateHeight(w);
      expect(h).toBeGreaterThanOrEqual(w * 0.5);
      expect(h).toBeLessThanOrEqual(w * 0.8);
    });
  });
});

describe('measureFromTaps (full pipeline)', () => {
  it('computes dimensions from known tap coordinates', () => {
    // Card: 200px long edge = 85.6mm → scale = 0.428 mm/px
    // Suitcase L: 300px → 128.4mm → 12.8cm
    // Suitcase W: 200px → 85.6mm → 8.6cm
    // Height: 8.6 × 0.65 = 5.6cm
    const result = measureFromTaps(
      { x: 0, y: 0 }, { x: 200, y: 0 },   // card edge (200px)
      { x: 0, y: 0 }, { x: 300, y: 0 },   // suitcase L (300px)
      { x: 0, y: 0 }, { x: 200, y: 0 },   // suitcase W (200px)
    );

    expect(result.scaleMmPerPx).toBeCloseTo(0.428, 3);
    expect(result.lengthCm).toBe(12.8);
    expect(result.widthCm).toBe(8.6);
    expect(result.heightCm).toBeGreaterThan(0);
  });

  it('handles diagonal measurements', () => {
    // Card at an angle (same pixel length)
    const result = measureFromTaps(
      { x: 0, y: 0 }, { x: 100, y: 173.2 },   // ~200px card diagonal
      { x: 0, y: 0 }, { x: 200, y: 0 },        // suitcase L
      { x: 0, y: 0 }, { x: 150, y: 0 },        // suitcase W
    );

    expect(result.lengthCm).toBeGreaterThan(0);
    expect(result.widthCm).toBeGreaterThan(0);
    expect(result.scaleMmPerPx).toBeGreaterThan(0);
  });

  it('returns zero dimensions for zero-length measurements', () => {
    const result = measureFromTaps(
      { x: 0, y: 0 }, { x: 200, y: 0 },
      { x: 0, y: 0 }, { x: 0, y: 0 },    // zero L
      { x: 0, y: 0 }, { x: 0, y: 0 },    // zero W
    );
    expect(result.lengthCm).toBe(0);
    expect(result.widthCm).toBe(0);
  });

  it('works with custom reference dimensions', () => {
    // Use A4 long edge (297mm) as reference
    const result = measureFromTaps(
      { x: 0, y: 0 }, { x: 500, y: 0 },
      { x: 0, y: 0 }, { x: 300, y: 0 },
      { x: 0, y: 0 }, { x: 200, y: 0 },
      297  // A4 long edge
    );
    expect(result.scaleMmPerPx).toBeCloseTo(0.594, 3);
    expect(result.lengthCm).toBeCloseTo(17.8, 0);
    expect(result.widthCm).toBeCloseTo(11.9, 0);
  });
});

describe('formatDimensions', () => {
  it('converts numeric dimensions to string format', () => {
    const dims = { lengthCm: 55.0, widthCm: 34.8, heightCm: 22.8 };
    const result = formatDimensions(dims);
    expect(result.length).toBe('55');
    expect(result.width).toBe('34.8');
    expect(result.height).toBe('22.8');
  });

  it('works with zeroes', () => {
    const result = formatDimensions({ lengthCm: 0, widthCm: 0, heightCm: 0 });
    expect(result.length).toBe('0');
    expect(result.width).toBe('0');
    expect(result.height).toBe('0');
  });
});

describe('REFERENCE_CARD_MM', () => {
  it('has ISO 7810 ID-1 dimensions', () => {
    expect(REFERENCE_CARD_MM.width).toBe(85.60);
    expect(REFERENCE_CARD_MM.height).toBe(53.98);
  });
});
