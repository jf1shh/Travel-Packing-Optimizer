import LZString from 'lz-string';

const WARDROBE_CATEGORIES = ['top', 'bottom', 'outer', 'shoe'];
const BULKINESS_VALUES = ['light', 'standard', 'bulky'];
const LIST_GROUP_KEYS = ['plane', 'main', 'base', 'loose', 'liquid', 'dry', 'tech'];

const asString = (v, fallback = '', max = 200) =>
  typeof v === 'string' ? v.slice(0, max) : fallback;
const asNumber = (v, fallback = 0, max = 1000000) =>
  (typeof v === 'number' && Number.isFinite(v)) ? Math.max(0, Math.min(max, v)) : fallback;
const isPlainObject = (v) => !!v && typeof v === 'object' && !Array.isArray(v);

/**
 * Validates a single wardrobe item from an untrusted share payload.
 * Returns a clean item or null. Share links are attacker-controllable
 * input; unvalidated objects persisted to localStorage previously meant a
 * crafted link could crash the app on every subsequent load.
 */
export const sanitizeWardrobeItem = (raw) => {
  if (!isPlainObject(raw)) return null;
  const name = asString(raw.name, '', 100).trim();
  if (!name) return null;
  return {
    id: asString(raw.id, `w-${Date.now()}-${Math.random()}`, 80),
    name,
    category: WARDROBE_CATEGORIES.includes(raw.category) ? raw.category : 'top',
    bulkiness: BULKINESS_VALUES.includes(raw.bulkiness) ? raw.bulkiness : 'standard',
    material: asString(raw.material, 'cotton', 30),
    color: asString(raw.color, 'black', 30),
    vol: asNumber(raw.vol, 400, 50000),
    weight: asNumber(raw.weight, 200, 50000)
  };
};

const sanitizeListItem = (raw) => {
  if (!isPlainObject(raw)) return null;
  const name = asString(raw.name, '', 150).trim();
  if (!name) return null;
  return {
    ...raw,
    id: asString(raw.id, `shared-${Math.random()}`, 80),
    name,
    category: asString(raw.category, 'clothes', 30),
    cube: asString(raw.cube, 'main', 30),
    checked: raw.checked === true,
    vol: asNumber(raw.vol, 0, 100000),
    weight: asNumber(raw.weight, 0, 100000),
    priority: asNumber(raw.priority, 5, 10)
  };
};

const sanitizeTripState = (raw) => {
  if (!isPlainObject(raw)) return null;
  const out = {};
  if (isPlainObject(raw.packingList)) {
    const list = {};
    LIST_GROUP_KEYS.forEach(key => {
      const arr = Array.isArray(raw.packingList[key]) ? raw.packingList[key] : [];
      list[key] = arr.map(sanitizeListItem).filter(Boolean).slice(0, 200);
    });
    out.packingList = list;
  }
  if (Array.isArray(raw.outfits)) {
    out.outfits = raw.outfits.filter(isPlainObject).slice(0, 60);
  }
  if (Array.isArray(raw.weatherDataArray)) {
    out.weatherDataArray = raw.weatherDataArray.filter(isPlainObject).slice(0, 10);
  }
  out.suitcaseVolume = asNumber(raw.suitcaseVolume, 0, 10000000);
  if (typeof raw.activePalette === 'string') out.activePalette = asString(raw.activePalette, 'quiet-luxury', 40);
  if (typeof raw.activeTravelMode === 'string') out.activeTravelMode = asString(raw.activeTravelMode, 'flying', 20);
  if (raw.tempUnit === 'C' || raw.tempUnit === 'F') out.tempUnit = raw.tempUnit;
  if (raw.lengthUnit === 'cm' || raw.lengthUnit === 'in') out.lengthUnit = raw.lengthUnit;
  return out;
};

/**
 * Encodes the wardrobe and trip state into a URL-safe string
 */
export const encodeTripData = (wardrobe, tripState) => {
  try {
    const payload = JSON.stringify({ w: wardrobe, s: tripState });
    return LZString.compressToEncodedURIComponent(payload);
  } catch (e) {
    console.error("Failed to encode trip data", e);
    return null;
  }
};

/**
 * Decodes a URL-safe string back into a validated { w, s } payload.
 * Returns null when the payload is missing, malformed, or contains
 * nothing usable after sanitization.
 */
export const decodeTripData = (encodedString) => {
  try {
    const decompressed = LZString.decompressFromEncodedURIComponent(encodedString);
    if (!decompressed) return null;
    const parsed = JSON.parse(decompressed);
    if (!isPlainObject(parsed)) return null;

    const wardrobe = Array.isArray(parsed.w)
      ? parsed.w.map(sanitizeWardrobeItem).filter(Boolean).slice(0, 300)
      : null;
    const tripState = sanitizeTripState(parsed.s);

    if ((!wardrobe || wardrobe.length === 0) && !tripState) return null;
    return { w: wardrobe && wardrobe.length > 0 ? wardrobe : null, s: tripState };
  } catch (e) {
    console.error("Failed to decode trip data", e);
    return null;
  }
};
