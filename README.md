# Travel Packing Optimizer

A mathematical packing assistant that builds weather-aware capsule wardrobes. Enter your destinations, dates, travel mode, and style preference — the engine generates a day-by-day outfit schedule and an optimized packing list that fits your suitcase.

## Features

- **Weather-proof outfits** — live forecasts + 3-year climate normals for trips beyond 16 days
- **Laundry cycle math** — 5-day laundry on a 30-day trip? You pack 5 days of clothes, not 30
- **Two-constraint knapsack** — volume *and* 7 kg carry-on weight limit when flying
- **12 fashion archetypes** — Quiet Luxury, Gorpcore, Scandi, Streetwear, Dark Academia, Athleisure, Bohemian, Prep, Rock, Whimsigoth, Coastal, Cottagecore — each with color-matched palettes
- **Activity-aware** — tag days as Beach/Hike/Ski/Formal/etc. and get the right gear
- **Digital closet** — add your real clothes with AI background removal (on-device)
- **Airline baggage compliance** — 77 airlines, live suitcase validation against carry-on limits
- **Suitcase scanner** — credit-card calibrated measurement + barcode scanner with 44-model database
- **Photo outfit previews** — your actual wardrobe photos appear next to daily outfit combos
- **Group trip sync** — live collaborative check-off across browser tabs via BroadcastChannel
- **Visual suitcase layout** — draggable proportional packing cubes showing exactly how full your bag is
- **Zip/postal code support** — type "90210" or "SW1A 1AA" and get accurate weather via a Nominatim fallback when Open-Meteo's geocoder doesn't recognize the code
- **Destination autocomplete** — real-time suggestions dropdown as you type, keyboard-navigable
- **Currency converter** — live exchange rates + estimated local costs (laundry, coffee, meals)
- **Travel advisories** — GOV.UK safety summaries per destination country
- **11 languages** — auto-detected from your OS, RTL support for Arabic
- **100% local** — no accounts, no servers. Weather from Open-Meteo (free, no API key)
- **PWA** — install to home screen, works offline. Strict Content-Security-Policy

## Quick start

```bash
npm install
npm run dev      # start dev server
npm test         # 210 tests
npm run lint     # Oxlint
npm run build    # production build with PWA + CSP
```

## How it works

1. You enter destinations, dates, suitcase size, laundry cycle, and fashion style
2. The app fetches real weather for your trip dates
3. A capsule wardrobe is built from your chosen archetype (or your digital closet items)
4. The engine assigns a color-matched outfit to every day, rotating garments and respecting laundry cycles
5. Weather triggers extras: umbrella for rain, sunscreen for UV, fleece for cold
6. Everything is knapsack-packed into your suitcase — essentials always survive, optionals are pruned if space runs out

## Architecture

| File | Role |
|---|---|
| `packerLogic.js` | Core engine — outfit generation, knapsack, weather injection, color matching |
| `App.jsx` | Root orchestrator — state, persistence, theme, share links |
| `api.js` | Open-Meteo weather/geocoding + autocomplete, with Nominatim zip/postal fallback and offline cache |
| `airlineBaggage.js` | 77-airline dataset with carry-on compliance validation |
| `suitcaseDatabase.js` | 44-model barcode/name lookup |
| `currency.js` / `advisory.js` | Frankfurter exchange rates + GOV.UK travel advisories (free, no key) |
| `share.js` | LZ-String compressed share links with full input sanitization |
| `db.js` | IndexedDB photo storage with quota checking |
| `logger.js` | On-device crash logger with error export |
| `i18n/` | 11 languages with lazy-loaded JSON, browser auto-detect, RTL |
| Components | `TripForm`, `PackingList`, `CapsuleVisualizer`, `OutfitEditor`, `WardrobeManager`, `SuitcaseScanner`, `SuitcaseLayout`, `ItineraryCalendar`, `VolumeChart`, `CapacityBar`, `LogisticsPreferences` |

## Privacy

Everything runs on your device. No accounts, no databases, no telemetry. The only network calls are to Open-Meteo (weather, geocoding, autocomplete), Nominatim (postal/zip code fallback), Frankfurter (currency), GOV.UK (travel advisories), and img.ly's CDN (one-time AI model download). The production build enforces this with a Content-Security-Policy allowlisting exactly those hosts.
