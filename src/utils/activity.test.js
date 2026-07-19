import { describe, it, expect } from 'vitest';
import { guessActivityFromDestination, ACTIVITY_OPTIONS } from './activity';

describe('guessActivityFromDestination', () => {
  it('returns ski for ski resort destinations', () => {
    expect(guessActivityFromDestination('Aspen')).toBe('ski');
    expect(guessActivityFromDestination('Whistler')).toBe('ski');
    expect(guessActivityFromDestination('Chamonix')).toBe('ski');
    expect(guessActivityFromDestination('Vail')).toBe('ski');
    expect(guessActivityFromDestination('Banff')).toBe('ski');
    expect(guessActivityFromDestination('Niseko')).toBe('ski');
  });

  it('returns beach for tropical/coastal destinations', () => {
    expect(guessActivityFromDestination('Honolulu')).toBe('beach');
    expect(guessActivityFromDestination('Maui')).toBe('beach');
    expect(guessActivityFromDestination('Cancun')).toBe('beach');
    expect(guessActivityFromDestination('Maldives')).toBe('beach');
    expect(guessActivityFromDestination('Bali')).toBe('beach');
    expect(guessActivityFromDestination('Miami')).toBe('beach');
  });

  it('returns hike for nature/trek destinations', () => {
    expect(guessActivityFromDestination('Yosemite')).toBe('hike');
    expect(guessActivityFromDestination('Zion')).toBe('hike');
    expect(guessActivityFromDestination('Patagonia')).toBe('hike');
    expect(guessActivityFromDestination('Kilimanjaro')).toBe('hike');
  });

  it('returns nightout for party cities', () => {
    expect(guessActivityFromDestination('Vegas')).toBe('nightout');
    expect(guessActivityFromDestination('Mykonos')).toBe('nightout');
  });

  it('returns business for corporate terms', () => {
    expect(guessActivityFromDestination('business')).toBe('business');
    expect(guessActivityFromDestination('conference')).toBe('business');
    expect(guessActivityFromDestination('meeting')).toBe('business');
  });

  it('returns sightseeing for major city destinations', () => {
    expect(guessActivityFromDestination('London')).toBe('sightseeing');
    expect(guessActivityFromDestination('Paris')).toBe('sightseeing');
    expect(guessActivityFromDestination('Tokyo')).toBe('sightseeing');
    expect(guessActivityFromDestination('New York')).toBe('sightseeing');
    expect(guessActivityFromDestination('Barcelona')).toBe('sightseeing');
  });

  it('returns empty string for unknown destinations', () => {
    expect(guessActivityFromDestination('RandomTown')).toBe('');
    expect(guessActivityFromDestination('Springfield')).toBe('');
  });

  it('returns empty string for null/undefined/empty input', () => {
    expect(guessActivityFromDestination(null)).toBe('');
    expect(guessActivityFromDestination(undefined)).toBe('');
    expect(guessActivityFromDestination('')).toBe('');
  });

  it('is case-insensitive', () => {
    expect(guessActivityFromDestination('LONDON')).toBe('sightseeing');
    expect(guessActivityFromDestination('aspen')).toBe('ski');
    expect(guessActivityFromDestination('HoNoLuLu')).toBe('beach');
  });

  it('matches partial substrings in destination name', () => {
    // "snow" matches ski regex
    expect(guessActivityFromDestination('Snowmass')).toBe('ski');
    // "camp" matches hike regex
    expect(guessActivityFromDestination('Camp Verde')).toBe('hike');
    // "club" matches nightout regex
    expect(guessActivityFromDestination('Club Med')).toBe('nightout');
  });

  it('ski resorts take priority over city matches (aspen contains no city keywords)', () => {
    // Aspen is both a city name and a ski keyword; ski is checked first
    expect(guessActivityFromDestination('Aspen')).toBe('ski');
  });
});

describe('ACTIVITY_OPTIONS', () => {
  it('has 10 options', () => {
    expect(ACTIVITY_OPTIONS).toHaveLength(10);
  });

  it('first option is empty string (Casual / auto-guess)', () => {
    expect(ACTIVITY_OPTIONS[0]).toEqual({ value: '', label: '🚶 Casual' });
  });

  it('all values are strings', () => {
    ACTIVITY_OPTIONS.forEach(opt => {
      expect(typeof opt.value).toBe('string');
      expect(typeof opt.label).toBe('string');
    });
  });

  it('all non-empty values are unique', () => {
    const nonEmptyValues = ACTIVITY_OPTIONS.filter(o => o.value !== '').map(o => o.value);
    expect(new Set(nonEmptyValues).size).toBe(nonEmptyValues.length);
  });

  it('includes all expected activity types', () => {
    const values = ACTIVITY_OPTIONS.map(o => o.value);
    expect(values).toContain('sightseeing');
    expect(values).toContain('formal');
    expect(values).toContain('business');
    expect(values).toContain('beach');
    expect(values).toContain('hike');
    expect(values).toContain('ski');
    expect(values).toContain('nightout');
    expect(values).toContain('gym');
    expect(values).toContain('transit');
  });
});
