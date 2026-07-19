// GOV.UK Foreign Travel Advice API — free, no API key, public UK government data.
// Docs: https://content-api.publishing.service.gov.uk/reference.html
// Pattern: GET https://www.gov.uk/api/content/foreign-travel-advice/{country-slug}

const API_BASE = 'https://www.gov.uk/api/content/foreign-travel-advice';

// Map ISO 3166-1 alpha-2 country codes to GOV.UK travel advice slugs.
// GOV.UK uses hyphenated lowercase country names.
const COUNTRY_SLUGS = {
  AF: 'afghanistan', AL: 'albania', DZ: 'algeria', AO: 'angola', AR: 'argentina',
  AM: 'armenia', AU: 'australia', AT: 'austria', AZ: 'azerbaijan', BS: 'bahamas',
  BH: 'bahrain', BD: 'bangladesh', BB: 'barbados', BY: 'belarus', BE: 'belgium',
  BZ: 'belize', BJ: 'benin', BT: 'bhutan', BO: 'bolivia', BA: 'bosnia-and-herzegovina',
  BW: 'botswana', BR: 'brazil', BN: 'brunei', BG: 'bulgaria', BF: 'burkina-faso',
  BI: 'burundi', KH: 'cambodia', CM: 'cameroon', CA: 'canada', CV: 'cape-verde',
  CF: 'central-african-republic', TD: 'chad', CL: 'chile', CN: 'china',
  CO: 'colombia', KM: 'comoros', CG: 'congo', CD: 'democratic-republic-of-congo',
  CR: 'costa-rica', CI: "cote-d-ivoire", HR: 'croatia', CU: 'cuba', CY: 'cyprus',
  CZ: 'czech-republic', DK: 'denmark', DJ: 'djibouti', DM: 'dominica',
  DO: 'dominican-republic', EC: 'ecuador', EG: 'egypt', SV: 'el-salvador',
  GQ: 'equatorial-guinea', ER: 'eritrea', EE: 'estonia', SZ: 'eswatini',
  ET: 'ethiopia', FJ: 'fiji', FI: 'finland', FR: 'france', GA: 'gabon',
  GM: 'the-gambia', GE: 'georgia', DE: 'germany', GH: 'ghana', GR: 'greece',
  GD: 'grenada', GT: 'guatemala', GN: 'guinea', GW: 'guinea-bissau',
  GY: 'guyana', HT: 'haiti', HN: 'honduras', HU: 'hungary', IS: 'iceland',
  IN: 'india', ID: 'indonesia', IR: 'iran', IQ: 'iraq', IE: 'ireland',
  IL: 'israel', IT: 'italy', JM: 'jamaica', JP: 'japan', JO: 'jordan',
  KZ: 'kazakhstan', KE: 'kenya', KI: 'kiribati', KP: 'north-korea',
  KR: 'south-korea', KW: 'kuwait', KG: 'kyrgyzstan', LA: 'laos', LV: 'latvia',
  LB: 'lebanon', LS: 'lesotho', LR: 'liberia', LY: 'libya', LT: 'lithuania',
  LU: 'luxembourg', MG: 'madagascar', MW: 'malawi', MY: 'malaysia', MV: 'maldives',
  ML: 'mali', MT: 'malta', MH: 'marshall-islands', MR: 'mauritania', MU: 'mauritius',
  MX: 'mexico', FM: 'micronesia', MD: 'moldova', MC: 'monaco', MN: 'mongolia',
  ME: 'montenegro', MA: 'morocco', MZ: 'mozambique', MM: 'myanmar', NA: 'namibia',
  NR: 'nauru', NP: 'nepal', NL: 'netherlands', NZ: 'new-zealand', NI: 'nicaragua',
  NE: 'niger', NG: 'nigeria', MK: 'north-macedonia', NO: 'norway', OM: 'oman',
  PK: 'pakistan', PW: 'palau', PA: 'panama', PG: 'papua-new-guinea', PY: 'paraguay',
  PE: 'peru', PH: 'philippines', PL: 'poland', PT: 'portugal', QA: 'qatar',
  RO: 'romania', RU: 'russia', RW: 'rwanda', KN: 'st-kitts-and-nevis',
  LC: 'st-lucia', VC: 'st-vincent-and-the-grenadines', WS: 'samoa', SM: 'san-marino',
  ST: 'sao-tome-and-principe', SA: 'saudi-arabia', SN: 'senegal', RS: 'serbia',
  SC: 'seychelles', SL: 'sierra-leone', SG: 'singapore', SK: 'slovakia',
  SI: 'slovenia', SB: 'solomon-islands', SO: 'somalia', ZA: 'south-africa',
  SS: 'south-sudan', ES: 'spain', LK: 'sri-lanka', SD: 'sudan', SR: 'suriname',
  SE: 'sweden', CH: 'switzerland', SY: 'syria', TW: 'taiwan', TJ: 'tajikistan',
  TZ: 'tanzania', TH: 'thailand', TL: 'timor-leste', TG: 'togo', TO: 'tonga',
  TT: 'trinidad-and-tobago', TN: 'tunisia', TR: 'turkey', TM: 'turkmenistan',
  TV: 'tuvalu', UG: 'uganda', UA: 'ukraine', AE: 'united-arab-emirates',
  GB: 'united-kingdom', US: 'usa', UY: 'uruguay', UZ: 'uzbekistan',
  VU: 'vanuatu', VA: 'vatican-city', VE: 'venezuela', VN: 'vietnam',
  YE: 'yemen', ZM: 'zambia', ZW: 'zimbabwe', XK: 'kosovo', PS: 'the-occupied-palestinian-territories',
  // Common multi-word names
  HK: 'hong-kong', MO: 'macao',
};

/**
 * Fetch travel advisory for a country from GOV.UK.
 * @param {string} countryCode — ISO 3166-1 alpha-2 (e.g. 'TH', 'FR')
 * @returns {Promise<{title: string, summary: string, updated: string, url: string} | null>}
 */
export async function fetchTravelAdvisory(countryCode) {
  const slug = getSlug(countryCode);
  if (!slug) return null;

  try {
    const res = await fetch(`${API_BASE}/${slug}`);
    if (!res.ok) return null;
    const data = await res.json();

    // GOV.UK content API returns the full page with details hash
    const details = data?.details;
    const summary = extractSummary(details, data?.title);

    return {
      title: data?.title || `Travel advice for ${slug}`,
      summary: summary || 'Travel advisory available. Check the GOV.UK website for full details.',
      updated: data?.public_updated_at || null,
      url: `https://www.gov.uk/foreign-travel-advice/${slug}`,
      raw: data,
    };
  } catch {
    return null;
  }
}

/**
 * Map a country code to its GOV.UK travel advice slug.
 * @param {string} countryCode
 * @returns {string|null}
 */
export function getSlug(countryCode) {
  if (!countryCode) return null;
  return COUNTRY_SLUGS[countryCode.toUpperCase()] || null;
}

/**
 * Extract a readable summary from GOV.UK travel advice details.
 */
function extractSummary(details, _title) {
  if (!details) return null;

  // Try to get the current travel advice summary
  const summaryObj = details?.current_travel_advice || details?.summary;
  if (typeof summaryObj === 'string') return summaryObj;

  // Try to extract from parts array
  if (details?.parts) {
    const summaryPart = details.parts.find(p =>
      p.slug === 'summary' || p.title?.toLowerCase().includes('summary')
    );
    if (summaryPart?.body) {
      // Strip HTML tags for plain text display
      const text = String(summaryPart.body).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      return text.slice(0, 300) + (text.length > 300 ? '…' : '');
    }
  }

  return null;
}

/**
 * Get packing-relevant info from an advisory: health risks, safety level,
 * local laws that affect what you should pack.
 * @param {object} advisory - Result from fetchTravelAdvisory
 * @returns {{safety: string, health: string, localLaws: string}}
 */
export function extractPackingRelevance(advisory) {
  if (!advisory?.raw?.details) return { safety: '', health: '', localLaws: '' };

  const details = advisory.raw.details;
  const parts = details.parts || [];

  const findPart = (keyword) => {
    const match = parts.find(p =>
      (p.title || '').toLowerCase().includes(keyword) ||
      (p.slug || '').includes(keyword)
    );
    return match ? String(match.body || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 200) : '';
  };

  return {
    safety: findPart('safety'),
    health: findPart('health'),
    localLaws: findPart('local-laws'),
  };
}
