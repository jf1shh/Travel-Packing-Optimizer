# Travel Packing Optimizer

An intelligent, mathematical packing assistant built with React and Vite. It takes the guesswork out of packing by factoring in weather, trip duration, travel modes, luggage limits, and your personal digital closet.

## Features

### 🧠 Smart Packing Engine

- **Mathematical Laundry Cycle Prediction:** Tell the app how often you plan to wash your clothes (e.g., every 5 days). Even if you are traveling for a month, the app mathematically restricts your packing list so you never bring more than 5 days worth of clothes. It automatically adds travel detergent and "👕 Laundry Day" badges to your itinerary.
- **Weather-Proof Outfits:** Checks the actual live forecast for your exact travel dates and destinations, building outfits that keep you warm in the snow and cool in the sun. Beyond the ~16-day forecast horizon, it blends in averaged climate normals from the last three years.
- **Weight & Volume Knapsack:** When flying, the algorithm treats the 7 kg carry-on limit as a hard constraint alongside suitcase volume — a two-constraint knapsack — so you never get surprised at the gate.
- **Outfit Rotation:** Garments rotate across days (resetting on laundry days) and only clothes that actually appear in your day-by-day outfit schedule get packed. No dead weight from clothes the engine never planned for you to wear.
- **Destination-Aware Extras:** Rainy days add a compact umbrella. High-UV days add sunscreen and sunglasses. And if all your destinations share one outlet type, the app names the exact plug adapter (e.g., "Type G") instead of a generic universal adapter.
- **Learns Your Preferences:** Items you repeatedly remove from generated lists get quietly de-prioritized in future trips — tracked entirely on your device.

### 👗 Fashion & Style

- **12 Fashion Archetypes:** Quiet Luxury, Gorpcore, Scandi Minimalist, Streetwear, Dark Academia, Athleisure, Bohemian, Ivy League Prep, Rock Chic, Whimsigoth, Coastal Maritime, and Cottagecore — each with a curated palette of tops, bottoms, outerwear, and shoes in mathematically-compatible colors.
- **Drag-and-Drop Outfit Editor:** Don't like what the algorithm suggested? Open the visual canvas and drag your favorite jacket over to swap it out manually. Full ARIA accessibility annotations for screen readers.
- **Activity-Aware Dressing:** Tag each day with an activity (Sightseeing, Formal, Beach, Hike, Ski, Night Out, Gym, Transit) and the engine injects the right gear — hiking pants, snow gear, swimsuits, or business attire.
- **Smart Location Detection:** Type "Aspen" and the app auto-suggests Ski. Type "Honolulu" and it pre-selects Beach. Activities are toggleable day-by-day.

### 📸 Camera Scanning

- **Suitcase Photo Measurement:** Point your camera at your suitcase with a credit card on top. Tap the card edges for calibration, then tap the suitcase edges — the app computes real-world dimensions (L × W × H) using pixel-scale math. All processing is local, nothing is uploaded.
- **Barcode Scanner:** Switch to Barcode mode and the app auto-detects UPC-A, EAN-13, Code 128, and QR codes right from the live camera feed. If your suitcase barcode matches one of 44 known models (Away, Rimowa, Samsonite, Monos, Travelpro, BÉIS, Osprey, Peak Design, Tumi, and more), the model and dimensions are auto-populated.
- **Brand Search:** No barcode match? Type any brand name and pick from a searchable database of popular suitcases with verified dimensions.

### 🧳 Digital Closet & AI

- **AI Background Removal:** Take a photo of your actual clothes on your bed. An on-device AI model instantly removes the messy background and saves a clean catalog image to your digital closet — processed entirely on your device, never uploaded.
- **Wardrobe Manager:** Slide-out panel for adding, editing, and organizing your digital closet items with bulk-text parsing. Type "3 black tees, 2 denim jeans" and the parser creates all the items at once.

### 📊 Visual Feedback

- **Interactive Donut Chart:** See exactly how full your suitcase is by volume, broken down by packing cube group.
- **Packing Progress Bar:** Check items off as you pack. An animated progress bar shows "12/25 items packed" and turns green with "🎉 All packed!" when complete.
- **Capacity Bar:** Live volume and weight tracking with 7 kg carry-on warning.
- **Day-by-Day Itinerary Calendar:** Visual calendar showing your trip with weather icons, activity tags, and laundry day markers.
- **Floating Generate Button:** A sticky "⚡ Generate List" pill appears when you scroll past the form — tap to scroll back and regenerate without hunting for the button.
- **Auto Dark/Light Mode:** Respects your OS color scheme on first visit. Your manual toggle preference is remembered.

### 🔒 Privacy & Sharing

- **100% Local First:** Your travel plans, wardrobe photos, and closet data stay entirely on your device. The only outbound calls are to the free, public [Open-Meteo](https://open-meteo.com/) weather API (no account, no API key) and a one-time model download from img.ly's CDN for background removal.
- **Secure Share Links:** Share your trip with friends via a compressed URL. The payload lives in the URL fragment — your browser never sends it to any server. Incoming share payloads are fully sanitized before being persisted.
- **PWA & Offline:** Install to your home screen. Works offline. Production build ships with a Content-Security-Policy.

---

## FAQ

### How does the packing list actually get generated?

1. You tell the app **where you're going, when, and what kind of traveler you are** — your destinations, dates, travel mode (flying/driving/train), suitcase size, laundry cycle, and fashion style.
2. The app fetches **real weather forecasts** for your destinations and dates from Open-Meteo (a free, public weather service — no API key needed).
3. A **capsule wardrobe** is built from your chosen fashion archetype's palette. Each archetype has a curated set of tops, bottoms, outerwear, and shoes in colors that mathematically match each other. If you have items in your digital closet, those get preferred over the defaults.
4. The engine **assigns an outfit to every day** of your trip. It rotates garments, respects laundry cycles (it won't pack 30 shirts for a 30-day trip if you're doing laundry every 5 days), and injects specialized gear for activity days (hiking pants, ski jackets, swimsuits).
5. **Weather-driven extras** are added — umbrella for rain, sunscreen and sunglasses for high UV, fleece layers for cold days.
6. The final list is **packed into a virtual suitcase** using a two-constraint knapsack algorithm: it must fit within your suitcase's physical volume AND stay under the 7 kg weight limit if you're flying. Essentials (passport, medications) are always kept; optional items are pruned if space runs out.

### What is a "capsule wardrobe" and how does the color matching work?

A capsule wardrobe is a small collection of clothes where almost everything goes with everything else — you can grab any top, any bottom, and they'll look good together.

The app achieves this with a **color compatibility table**. Each palette only uses colors that are mathematically compatible — black goes with white, grey, beige; navy goes with white, khaki, olive; and so on. The engine uses bipartite matching to pair tops with bottoms so every day's outfit is color-coordinated. Every color in the table (14 total: black, navy, white, grey, beige, khaki, olive, brown, blue, red, green, yellow, pink, purple) has a defined set of compatible partners.

### How does the suitcase scanner work?

**Measure mode:** You place a standard credit card (85.60 × 53.98 mm — any ISO ID-1 card works) on top of your suitcase and take a photo. The app asks you to tap both ends of the card (to calibrate — "this many pixels = 85.6 mm"), then both ends of the suitcase's length and width. From the pixel ratios, it computes the real-world dimensions. Height is estimated from common suitcase proportions. All math runs in the browser — your photo never leaves your device.

**Barcode mode:** Using Chrome's built-in `BarcodeDetector` API, the app scans the live camera feed for UPC-A, EAN-13, Code 128, and QR barcodes. When a barcode is detected, it looks up the number in a database of 44 suitcase models. If there's a match, the brand, model, and dimensions are auto-populated. If not, you can search by brand name. Barcode scanning requires Chrome/Chromium; other browsers see a friendly fallback with the brand search.

### How accurate is the suitcase measurement?

The measurement is as accurate as your taps. The credit card provides a known reference (85.60 mm), and from that, the pixel-to-millimeter scale is calculated. If you tap precisely on the card edges and suitcase edges, the result should be within ~1-2 cm. You can always fine-tune the numbers manually after scanning. The height is estimated from the width (most suitcases are ~65% as tall as they are wide), so measuring from a side-view photo would be more accurate for unusual shapes.

### Does the app work offline?

Yes — it's a Progressive Web App (PWA). Once loaded, it works offline. Weather data is fetched when you're online. The AI background removal model downloads once and runs entirely on-device.

### Is my data safe?

Yes. Everything stays on your device. Your wardrobe photos, trip plans, and closet data are stored in your browser's localStorage and IndexedDB. The app makes exactly two kinds of network calls: (1) Open-Meteo for weather forecasts (by city name — no account, no personal data), and (2) a one-time download of the AI model from img.ly's CDN. The production build enforces this with a strict Content-Security-Policy. The Android build disables OS cloud backup.

### Why are there 12 fashion archetypes? Can I add my own?

The 12 archetypes cover the most distinct and recognizable fashion aesthetics: Quiet Luxury, Gorpcore, Scandi Minimalist, Streetwear, Dark Academia, Athleisure, Bohemian, Ivy League Prep, Rock Chic, Whimsigoth, Coastal Maritime, and Cottagecore. Each has its own color palette and garment types. You can add your own clothes to the Digital Closet, and the engine will prefer your items over the palette defaults whenever the colors match.

### What does the laundry cycle setting actually do?

If you set your laundry cycle to 5 days, the engine will never pack more than 5 days' worth of tops, bottoms, underwear, or socks — even for a 30-day trip. It assumes you'll wash and re-wear. It also adds travel detergent packets to your packing list and marks laundry days on your itinerary calendar. Set it to "No Laundry" (999) and it'll pack one pair of underwear per day.

---

## Installation

```bash
npm install
npm run dev
```

- `npm test` — 157 Vitest tests covering the packing algorithm, measurement math, barcode database, plug adapters, activity detection, share sanitization, parser, and randomized fuzz tests
- `npm run lint` — Oxlint (zero-config JS linter)
- `npm run build` — Production Vite build with PWA service worker and CSP injection

## Architecture

| File | Role |
|---|---|
| `App.jsx` | Root orchestrator — state management, localStorage persistence, theme auto-detection, floating generate button, share-link parsing |
| `packerLogic.js` | Mathematical packing engine — outfit generation, knapsack optimization, weather-driven item injection, palette-to-outfit matching |
| `measurement.js` | Pixel-scale math for camera-based suitcase measurement using credit card calibration |
| `suitcaseDatabase.js` | 44-model lookup table with barcode prefix matching and brand search |
| `SuitcaseScanner.jsx` | Full-screen camera scanner with Measure (photo + calibration) and Barcode (live detection + brand search) modes |
| `WardrobeManager.jsx` | Slide-out digital closet UI with AI background removal and bulk-text item parsing |
| `CapsuleVisualizer.jsx` | Day-by-day outfit preview with activity-swap interaction |
| `OutfitEditor.jsx` | Drag-and-drop canvas for manual outfit customization (full ARIA accessibility) |
| `VolumeChart.jsx` | Recharts donut chart for suitcase volume visualization |
| `CapacityBar.jsx` | Live volume/weight bar with 7 kg warning |
| `PackingList.jsx` | Categorized checklist with animated progress bar, copy-to-clipboard, fold tips, and custom item add |
| `ItineraryCalendar.jsx` | Wrapping calendar with weather icons, toggleable activity tags, and laundry markers |
| `LogisticsPreferences.jsx` | Traveler profile configuration (gender, palette, packing strategy, laundry cycle) |
| `TripForm.jsx` | Main trip input form with .ics calendar import |
| `SuitcaseSelector.jsx` | Suitcase preset picker with scan button and L×W×H inputs |
| `api.js` | Open-Meteo weather fetch and geocoding |
| `share.js` | LZ-String compressed share-link encode/decode with full input sanitization |
| `db.js` | IndexedDB wrapper for local photo storage |
| `logger.js` | On-device crash logger (stores to IndexedDB, never phones home) |
| `activity.js` | Destination → activity auto-detection (Aspen → Ski, Honolulu → Beach, etc.) |
| `plugs.js` | IEC wall-plug type lookup by country code |
| `itemStats.js` | Volume/weight defaults per clothing category and bulkiness |
| `parser.js` | Bulk-text parser for "3 black tees, 2 denim jeans" → structured wardrobe items |

## Privacy & Deployment

This app is configured as a Progressive Web App (PWA) and can be deployed to GitHub Pages or any static host. It works seamlessly offline and can be installed to your device's home screen.

**Privacy-First:** All computations, including AI background removal and algorithm optimizations, run locally on your device. Your wardrobe photos and trip data never touch a remote database. The production build ships a Content-Security-Policy that restricts network access to the two services the app legitimately uses (Open-Meteo weather and the img.ly model CDN), and the Android build disables OS cloud backup of app data.
