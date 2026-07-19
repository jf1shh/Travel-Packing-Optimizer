// Frankfurter currency exchange API — free, no API key, open-source.
// Data sourced from 84 central banks (European Central Bank primary).
// Docs: https://www.frankfurter.app/

const API_BASE = 'https://api.frankfurter.dev/v1';

/** Currency codes mapped to common travel destinations */
export const COUNTRY_CURRENCY = {
  US: 'USD', GB: 'GBP', FR: 'EUR', DE: 'EUR', IT: 'EUR', ES: 'EUR', NL: 'EUR',
  BE: 'EUR', AT: 'EUR', PT: 'EUR', GR: 'EUR', IE: 'EUR', FI: 'EUR',
  JP: 'JPY', CN: 'CNY', KR: 'KRW', IN: 'INR', SG: 'SGD', TH: 'THB',
  VN: 'VND', MY: 'MYR', PH: 'PHP', ID: 'IDR', HK: 'HKD', TW: 'TWD',
  AU: 'AUD', NZ: 'NZD', CA: 'CAD', MX: 'MXN', BR: 'BRL', AR: 'ARS',
  CL: 'CLP', CO: 'COP', PE: 'PEN', ZA: 'ZAR', KE: 'KES', EG: 'EGP',
  MA: 'MAD', AE: 'AED', QA: 'QAR', SA: 'SAR', TR: 'TRY', RU: 'RUB',
  CH: 'CHF', SE: 'SEK', NO: 'NOK', DK: 'DKK', PL: 'PLN', CZ: 'CZK',
  HU: 'HUF', RO: 'RON', IS: 'ISK', IL: 'ILS',
};

/**
 * Fetch latest exchange rates for a base currency.
 * @param {string} from - Base currency code (e.g. 'USD')
 * @param {string[]} [to] - Target currency codes (e.g. ['EUR', 'GBP']). Omit for all.
 * @returns {Promise<{base: string, date: string, rates: object}>}
 */
export async function fetchExchangeRates(from = 'USD', to = []) {
  const params = to.length > 0 ? `?from=${from}&to=${to.join(',')}` : `?from=${from}`;
  const res = await fetch(`${API_BASE}/latest${params}`);
  if (!res.ok) throw new Error(`Frankfurter API error: ${res.status}`);
  return res.json();
}

/**
 * Get the local currency for a country code.
 * @param {string} countryCode — ISO 3166-1 alpha-2 (e.g. 'JP', 'FR')
 * @returns {string|null} Currency code or null if unknown
 */
export function getCurrencyForCountry(countryCode) {
  if (!countryCode) return null;
  const cc = countryCode.toUpperCase();
  return COUNTRY_CURRENCY[cc] || null;
}

/**
 * Format a number as currency.
 * @param {number} amount
 * @param {string} currencyCode
 * @returns {string}
 */
export function formatCurrency(amount, currencyCode) {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode }).format(amount);
  } catch {
    return `${currencyCode} ${amount.toFixed(2)}`;
  }
}

/** Typical tourist costs in USD (rough estimates for wallet display) */
export const TYPICAL_COSTS_USD = {
  laundry: 8,       // laundromat wash + dry
  taxi: 15,         // short taxi ride
  meal: 18,         // mid-range restaurant meal
  coffee: 4,        // coffee
  water: 1.50,      // bottled water
  toiletries: 6,    // basic toiletries (shampoo, toothpaste)
  sim: 10,          // local SIM card
  sunscreen: 8,     // sunscreen bottle
};

/**
 * Convert a typical cost to destination currency using exchange rate.
 * @param {string} key — key from TYPICAL_COSTS_USD
 * @param {number} rate — exchange rate (dest per 1 USD)
 * @param {string} currencyCode
 * @returns {{usd: number, converted: number, label: string}}
 */
export function convertCost(key, rate, currencyCode) {
  const usd = TYPICAL_COSTS_USD[key] || 0;
  return {
    usd,
    converted: Math.round(usd * rate * 100) / 100,
    label: key,
    display: formatCurrency(usd * rate, currencyCode),
  };
}
