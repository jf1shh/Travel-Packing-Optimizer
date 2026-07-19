import { describe, it, expect } from 'vitest';
import { averageDailies, mergeDailies } from './api';

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
