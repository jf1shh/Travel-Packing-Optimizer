// IEC wall-plug types by ISO 3166-1 alpha-2 country code, for the
// destination-aware adapter suggestion. Not exhaustive -- unknown
// countries simply fall back to the generic universal adapter.
export const PLUG_TYPES = {
  US: 'A/B', CA: 'A/B', MX: 'A/B', JP: 'A/B', PH: 'A/B/C', TW: 'A/B',
  GB: 'G', IE: 'G', MT: 'G', CY: 'G', SG: 'G', HK: 'G', MY: 'G', AE: 'G', QA: 'G', KE: 'G',
  FR: 'C/E', BE: 'C/E', PL: 'C/E', CZ: 'C/E', SK: 'C/E', MA: 'C/E',
  DE: 'C/F', NL: 'C/F', ES: 'C/F', PT: 'C/F', AT: 'C/F', GR: 'C/F', HU: 'C/F',
  RO: 'C/F', SE: 'C/F', NO: 'C/F', FI: 'C/F', IS: 'C/F', TR: 'C/F', KR: 'C/F',
  ID: 'C/F', EG: 'C/F', RU: 'C/F',
  CH: 'C/J', IT: 'C/F/L', DK: 'C/E/F/K',
  AU: 'I', NZ: 'I', CN: 'A/C/I', AR: 'C/I',
  IN: 'C/D/M', ZA: 'C/M/N', BR: 'C/N', TH: 'A/B/C/O', IL: 'C/H', VN: 'A/C', SA: 'A/B/G'
};

/**
 * Returns a destination-specific adapter suggestion, or null when the
 * generic universal adapter is the right call (no/unknown countries,
 * or destinations with different outlet types).
 */
export const getAdapterSuggestion = (countryCodes = []) => {
  if (!countryCodes) return null;
  const valid = Array.isArray(countryCodes) ? countryCodes : [];
  const known = [...new Set(valid.filter(Boolean).map(c => String(c).toUpperCase()))];
  if (known.length === 0) return null;
  const plugSets = known.map(cc => PLUG_TYPES[cc]);
  if (plugSets.some(p => !p)) return null;
  const unique = [...new Set(plugSets)];
  if (unique.length !== 1) return null;
  return `Travel Adapter (Type ${unique[0]} outlets)`;
};
