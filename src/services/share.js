import LZString from 'lz-string';

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
 * Decodes a URL-safe string back into wardrobe and trip state
 */
export const decodeTripData = (encodedString) => {
  try {
    const decompressed = LZString.decompressFromEncodedURIComponent(encodedString);
    if (!decompressed) return null;
    return JSON.parse(decompressed);
  } catch (e) {
    console.error("Failed to decode trip data", e);
    return null;
  }
};
