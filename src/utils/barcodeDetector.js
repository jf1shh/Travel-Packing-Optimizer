// Barcode detection with a universal fallback.
//
// The native BarcodeDetector API (Shape Detection) only exists in
// Chromium browsers — it is NOT available in the Android WebView the
// Capacitor APK runs in, nor in iOS Safari, which made the scanner
// silently unusable in the packaged app. When the native API is missing
// (or reports no supported formats), we lazy-load the `barcode-detector`
// ponyfill (zxing-wasm) instead. The wasm binary is bundled and served
// from our own origin, keeping the app CSP-clean and fully offline.

// Formats that appear on luggage hang tags and retail box labels.
const FORMATS = ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'itf', 'qr_code'];

let detectorPromise = null;

async function createDetector() {
  // Prefer the native detector when it's real and usable.
  if ('BarcodeDetector' in window) {
    try {
      const supported = await window.BarcodeDetector.getSupportedFormats();
      if (supported && supported.length > 0) {
        const formats = FORMATS.filter(f => supported.includes(f));
        return new window.BarcodeDetector({ formats: formats.length ? formats : supported });
      }
    } catch {
      // fall through to the ponyfill
    }
  }

  // Ponyfill path: loaded on demand so browsers with native support
  // never download the wasm.
  const [{ BarcodeDetector, prepareZXingModule }, { default: wasmUrl }] = await Promise.all([
    import('barcode-detector/ponyfill'),
    import('zxing-wasm/reader/zxing_reader.wasm?url'),
  ]);
  prepareZXingModule({
    overrides: {
      locateFile: (path, prefix) => (path.endsWith('.wasm') ? wasmUrl : prefix + path),
    },
  });
  return new BarcodeDetector({ formats: FORMATS });
}

/**
 * Get a BarcodeDetector-compatible instance (native or zxing-wasm ponyfill).
 * Cached after the first call. Returns null only if both paths fail.
 */
export function getBarcodeDetector() {
  if (!detectorPromise) {
    detectorPromise = createDetector().catch(() => {
      detectorPromise = null; // allow a retry on the next open
      return null;
    });
  }
  return detectorPromise;
}
