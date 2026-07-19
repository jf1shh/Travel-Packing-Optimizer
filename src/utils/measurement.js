// Measurement utilities for suitcase photo scanning.
// Uses a standard credit card (ISO/IEC 7810 ID-1: 85.60 × 53.98 mm) as
// the reference object for pixel-to-real-world scale calibration.
//
// Any ID-1 card works: credit card, driver's license, hotel key card, etc.

/** Physical dimensions of an ISO/IEC 7810 ID-1 card in millimetres. */
export const REFERENCE_CARD_MM = { width: 85.60, height: 53.98 };

/** Physical dimensions of an A4 sheet in millimetres (alternative reference). */
export const REFERENCE_A4_MM = { width: 210, height: 297 };

/**
 * Euclidean distance between two points in pixel space.
 * @param {{x: number, y: number}} p1
 * @param {{x: number, y: number}} p2
 * @returns {number} Distance in pixels
 */
export function pixelDistance(p1, p2) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate the scale factor from a reference object of known physical size.
 * @param {number} refPixelLength - Length of reference object in pixels (e.g. the long edge of a credit card)
 * @param {number} refRealMm - Known physical length in millimetres (default: credit card long edge = 85.60 mm)
 * @returns {number} Millimetres per pixel
 */
export function calibrateScale(refPixelLength, refRealMm = REFERENCE_CARD_MM.width) {
  if (refPixelLength <= 0) return 0;
  return refRealMm / refPixelLength;
}

/**
 * Convert a pixel measurement to centimetres using a calibration scale.
 * @param {number} pixelLength - Length in pixels
 * @param {number} mmPerPixel - Scale factor (mm per pixel)
 * @returns {number} Length in centimetres (rounded to 1 decimal)
 */
export function pixelsToCm(pixelLength, mmPerPixel) {
  if (mmPerPixel <= 0 || pixelLength <= 0) return 0;
  return Math.round((pixelLength * mmPerPixel) / 10 * 10) / 10;
}

/**
 * Estimate the height of a suitcase from its width, using common proportions.
 * Most carry-on suitcases have H ≈ 0.60–0.70 × W.
 * @param {number} widthCm - Measured width in cm
 * @returns {number} Estimated height in cm (rounded to 1 decimal)
 */
export function estimateHeight(widthCm) {
  return Math.round(widthCm * 0.65 * 10) / 10;
}

/**
 * Full measurement pipeline: from pixel taps to centimetre dimensions.
 * @param {{x: number, y: number}} cardP1 - First tap on reference card edge
 * @param {{x: number, y: number}} cardP2 - Second tap on reference card edge
 * @param {{x: number, y: number}} suitcaseL1 - First tap on suitcase length edge
 * @param {{x: number, y: number}} suitcaseL2 - Second tap on suitcase length edge
 * @param {{x: number, y: number}} suitcaseW1 - First tap on suitcase width edge
 * @param {{x: number, y: number}} suitcaseW2 - Second tap on suitcase width edge
 * @param {number} [refRealMm=85.60] - Known reference object dimension in mm
 * @returns {{ lengthCm: number, widthCm: number, heightCm: number, scaleMmPerPx: number }}
 */
export function measureFromTaps(
  cardP1, cardP2,
  suitcaseL1, suitcaseL2,
  suitcaseW1, suitcaseW2,
  refRealMm = REFERENCE_CARD_MM.width
) {
  const cardPx = pixelDistance(cardP1, cardP2);
  const scale = calibrateScale(cardPx, refRealMm);

  const lengthCm = pixelsToCm(pixelDistance(suitcaseL1, suitcaseL2), scale);
  const widthCm = pixelsToCm(pixelDistance(suitcaseW1, suitcaseW2), scale);
  const heightCm = estimateHeight(widthCm);

  return { lengthCm, widthCm, heightCm, scaleMmPerPx: scale };
}

/**
 * Convert centimetre dimensions (from scanner) back to the mm values
 * the rest of the app uses internally.
 * @param {{lengthCm: number, widthCm: number, heightCm: number}} dims
 * @returns {{length: string, width: string, height: string}} String values in cm (app's internal format)
 */
export function formatDimensions(dims) {
  return {
    length: String(dims.lengthCm),
    width: String(dims.widthCm),
    height: String(dims.heightCm),
  };
}
