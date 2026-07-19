// Lookup table of popular suitcase brands, models, and dimensions.
// Dimensions in cm (L × W × H). Used by the barcode scanner and brand search.
//
// Barcode prefixes are approximate — real UPC/EAN manufacturer prefixes vary.
// When a barcode is scanned, the full number is matched against known prefixes.
// If no match, the raw barcode is still shown and the user can search by brand.

const MODELS = [
  // ── Away ──────────────────────────────────────────────────────────────────
  { brand: 'Away', model: 'The Carry-On', l: 55.0, w: 34.8, h: 22.8, type: 'carry-on',
    preset: 'away-carry', upcPrefixes: ['81875802', '85000828'] },
  { brand: 'Away', model: 'The Bigger Carry-On', l: 57.7, w: 37.1, h: 24.1, type: 'carry-on',
    preset: 'custom', upcPrefixes: ['81875803'] },
  { brand: 'Away', model: 'The Medium', l: 66.0, w: 44.5, h: 27.9, type: 'check-in',
    preset: 'custom', upcPrefixes: ['81875804'] },
  { brand: 'Away', model: 'The Large', l: 73.7, w: 48.3, h: 30.5, type: 'check-in',
    preset: 'custom', upcPrefixes: ['81875805'] },

  // ── Rimowa ────────────────────────────────────────────────────────────────
  { brand: 'Rimowa', model: 'Essential Cabin', l: 55.0, w: 40.0, h: 23.0, type: 'carry-on',
    preset: 'rimowa-cabin', upcPrefixes: ['40564890'] },
  { brand: 'Rimowa', model: 'Essential Check-In L', l: 78.0, w: 51.0, h: 27.5, type: 'check-in',
    preset: 'custom', upcPrefixes: ['40564891'] },
  { brand: 'Rimowa', model: 'Original Cabin', l: 55.0, w: 40.0, h: 23.0, type: 'carry-on',
    preset: 'rimowa-cabin', upcPrefixes: [] },
  { brand: 'Rimowa', model: 'Classic Cabin', l: 55.0, w: 40.0, h: 23.0, type: 'carry-on',
    preset: 'rimowa-cabin', upcPrefixes: [] },

  // ── Samsonite ─────────────────────────────────────────────────────────────
  { brand: 'Samsonite', model: 'Freeform Carry-On Spinner', l: 55.0, w: 38.0, h: 23.0, type: 'carry-on',
    preset: 'custom', upcPrefixes: ['04372523'] },
  { brand: 'Samsonite', model: 'Winfield 3 DLX Carry-On', l: 55.9, w: 38.1, h: 22.9, type: 'carry-on',
    preset: 'custom', upcPrefixes: [] },
  { brand: 'Samsonite', model: 'Omni PC Carry-On', l: 55.9, w: 38.1, h: 22.9, type: 'carry-on',
    preset: 'custom', upcPrefixes: [] },
  { brand: 'Samsonite', model: 'Check-In Large', l: 75.0, w: 51.0, h: 31.0, type: 'check-in',
    preset: 'samsonite-check', upcPrefixes: ['04372524'] },

  // ── Monos ─────────────────────────────────────────────────────────────────
  { brand: 'Monos', model: 'Carry-On', l: 55.9, w: 35.6, h: 22.9, type: 'carry-on',
    preset: 'monos-carry', upcPrefixes: ['86000977'] },
  { brand: 'Monos', model: 'Carry-On Plus', l: 58.4, w: 38.1, h: 24.1, type: 'carry-on',
    preset: 'custom', upcPrefixes: [] },
  { brand: 'Monos', model: 'Check-In Medium', l: 66.0, w: 45.7, h: 27.9, type: 'check-in',
    preset: 'custom', upcPrefixes: [] },
  { brand: 'Monos', model: 'Check-In Large', l: 76.2, w: 50.8, h: 30.5, type: 'check-in',
    preset: 'custom', upcPrefixes: [] },

  // ── Travelpro ─────────────────────────────────────────────────────────────
  { brand: 'Travelpro', model: 'Platinum Elite Carry-On 21"', l: 59.7, w: 36.8, h: 22.9, type: 'carry-on',
    preset: 'travelpro-21', upcPrefixes: ['02567421'] },
  { brand: 'Travelpro', model: 'Platinum Elite Check-In 25"', l: 68.6, w: 45.7, h: 27.9, type: 'check-in',
    preset: 'custom', upcPrefixes: [] },
  { brand: 'Travelpro', model: 'Maxlite 5 Carry-On 21"', l: 58.4, w: 35.6, h: 22.9, type: 'carry-on',
    preset: 'custom', upcPrefixes: [] },
  { brand: 'Travelpro', model: 'Crew Versapack Carry-On 21"', l: 59.7, w: 36.8, h: 22.9, type: 'carry-on',
    preset: 'custom', upcPrefixes: [] },

  // ── BÉIS ──────────────────────────────────────────────────────────────────
  { brand: 'BÉIS', model: 'Carry-On Roller', l: 58.0, w: 40.0, h: 25.4, type: 'carry-on',
    preset: 'beis-roller', upcPrefixes: ['85001676'] },
  { brand: 'BÉIS', model: 'Check-In Roller 26"', l: 68.6, w: 45.7, h: 30.5, type: 'check-in',
    preset: 'custom', upcPrefixes: [] },
  { brand: 'BÉIS', model: 'Check-In Roller 29"', l: 76.2, w: 50.8, h: 33.0, type: 'check-in',
    preset: 'custom', upcPrefixes: [] },

  // ── Osprey (Backpacks) ────────────────────────────────────────────────────
  { brand: 'Osprey', model: 'Farpoint 40L', l: 55.0, w: 35.0, h: 23.0, type: 'backpack',
    preset: 'osprey-40', upcPrefixes: ['84513608'] },
  { brand: 'Osprey', model: 'Farpoint 55L', l: 65.0, w: 38.0, h: 28.0, type: 'backpack',
    preset: 'custom', upcPrefixes: [] },
  { brand: 'Osprey', model: 'Fairview 40L', l: 53.0, w: 35.0, h: 22.0, type: 'backpack',
    preset: 'custom', upcPrefixes: [] },
  { brand: 'Osprey', model: 'Porter 46L', l: 56.0, w: 36.0, h: 25.0, type: 'backpack',
    preset: 'custom', upcPrefixes: [] },

  // ── Peak Design ───────────────────────────────────────────────────────────
  { brand: 'Peak Design', model: 'Travel Backpack 45L', l: 56.0, w: 33.0, h: 24.0, type: 'backpack',
    preset: 'peak-45', upcPrefixes: ['81837302'] },
  { brand: 'Peak Design', model: 'Travel Backpack 30L', l: 53.0, w: 29.0, h: 20.0, type: 'backpack',
    preset: 'custom', upcPrefixes: [] },

  // ── Tumi ──────────────────────────────────────────────────────────────────
  { brand: 'Tumi', model: 'Alpha 3 Carry-On', l: 55.9, w: 40.6, h: 22.9, type: 'carry-on',
    preset: 'custom', upcPrefixes: ['74231541'] },
  { brand: 'Tumi', model: 'Alpha Bravo Esports Pro', l: 55.9, w: 38.1, h: 25.4, type: 'carry-on',
    preset: 'custom', upcPrefixes: [] },
  { brand: 'Tumi', model: '19 Degree Carry-On', l: 55.9, w: 40.6, h: 22.9, type: 'carry-on',
    preset: 'custom', upcPrefixes: [] },

  // ── Delsey ────────────────────────────────────────────────────────────────
  { brand: 'Delsey', model: 'Paris Carry-On', l: 55.0, w: 38.0, h: 25.0, type: 'carry-on',
    preset: 'custom', upcPrefixes: [] },
  { brand: 'Delsey', model: 'Helium Aero Carry-On', l: 54.6, w: 35.6, h: 22.9, type: 'carry-on',
    preset: 'custom', upcPrefixes: [] },

  // ── American Tourister ────────────────────────────────────────────────────
  { brand: 'American Tourister', model: 'Stratum XLT Carry-On', l: 55.9, w: 38.1, h: 22.9, type: 'carry-on',
    preset: 'custom', upcPrefixes: [] },
  { brand: 'American Tourister', model: 'Pop Max Softside 21"', l: 53.3, w: 35.6, h: 22.9, type: 'carry-on',
    preset: 'custom', upcPrefixes: [] },

  // ── Briggs & Riley ────────────────────────────────────────────────────────
  { brand: 'Briggs & Riley', model: 'Baseline Carry-On 21"', l: 55.9, w: 38.1, h: 22.9, type: 'carry-on',
    preset: 'custom', upcPrefixes: [] },
  { brand: 'Briggs & Riley', model: 'Torq Carry-On 21"', l: 55.9, w: 38.1, h: 22.9, type: 'carry-on',
    preset: 'custom', upcPrefixes: [] },

  // ── Away (additional) + others ────────────────────────────────────────────
  { brand: 'July', model: 'Carry-On', l: 55.0, w: 38.0, h: 21.5, type: 'carry-on',
    preset: 'custom', upcPrefixes: [] },
  { brand: 'July', model: 'Carry-On Pro', l: 55.0, w: 38.0, h: 21.5, type: 'carry-on',
    preset: 'custom', upcPrefixes: [] },
  { brand: 'Arlo Skye', model: 'The Carry-On', l: 56.0, w: 36.0, h: 23.0, type: 'carry-on',
    preset: 'custom', upcPrefixes: [] },
  { brand: 'Paravel', model: 'Aviator Carry-On', l: 55.9, w: 35.6, h: 22.9, type: 'carry-on',
    preset: 'custom', upcPrefixes: [] },
  { brand: 'Roam', model: 'The Carry-On', l: 55.9, w: 35.6, h: 22.9, type: 'carry-on',
    preset: 'custom', upcPrefixes: [] },
];

/**
 * Search for suitcases matching a barcode number.
 * Checks UPC/EAN prefix matches against the database.
 * @param {string} barcode - The decoded barcode number
 * @returns {{ brand: string, model: string, l: number, w: number, h: number, type: string, preset: string } | null}
 */
export function lookupByBarcode(barcode) {
  if (!barcode || barcode.length < 8) return null;
  const clean = barcode.replace(/[\s-]/g, '');

  // Try full match first, then prefix matching
  for (const m of MODELS) {
    for (const prefix of m.upcPrefixes) {
      if (clean === prefix || clean.startsWith(prefix) || prefix.startsWith(clean)) {
        return { brand: m.brand, model: m.model, l: m.l, w: m.w, h: m.h, type: m.type, preset: m.preset };
      }
    }
  }
  return null;
}

/**
 * Search for suitcases by brand name (case-insensitive, partial match).
 * @param {string} query - Brand name or model search query
 * @returns {Array<{ brand: string, model: string, l: number, w: number, h: number, type: string, preset: string }>}
 */
export function searchByBrand(query) {
  if (!query || query.trim().length < 2) return [];
  const q = query.toLowerCase().trim();
  const results = MODELS.filter(m =>
    m.brand.toLowerCase().includes(q) ||
    m.model.toLowerCase().includes(q)
  );
  // Deduplicate by brand+model
  const seen = new Set();
  return results.filter(r => {
    const key = `${r.brand}|${r.model}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 12);
}

/**
 * Get all unique brand names for autocomplete suggestions.
 * @returns {string[]}
 */
export function getAllBrands() {
  return [...new Set(MODELS.map(m => m.brand))].sort();
}

/**
 * Get all models for a specific brand.
 * @param {string} brand - Brand name (case-insensitive)
 * @returns {Array<{ brand: string, model: string, l: number, w: number, h: number, type: string, preset: string }>}
 */
export function getModelsForBrand(brand) {
  if (!brand) return [];
  const b = brand.toLowerCase().trim();
  return MODELS.filter(m => m.brand.toLowerCase() === b);
}

export { MODELS };
