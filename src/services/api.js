const GEO_INDEX_KEY = 'geo_cache_index';
const MAX_GEO_CACHE = 40;
const FORECAST_HORIZON_DAYS = 15; // Open-Meteo forecasts ~16 days out
const CLIMATE_YEARS = 3; // years of history averaged for far-future trips

const toDateStr = (d) => d.toISOString().split('T')[0];
const addDays = (d, n) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};
const shiftYears = (dateStr, n) => {
  const d = new Date(dateStr);
  d.setFullYear(d.getFullYear() + n);
  return toDateStr(d);
};
const requestedTimes = (startStr, endStr) => {
  const out = [];
  let d = new Date(startStr);
  const end = new Date(endStr);
  while (d <= end) {
    out.push(toDateStr(d));
    d = addDays(d, 1);
  }
  return out;
};

// Keep the geocode cache bounded (it previously grew forever, one entry
// per string ever typed into the destination box).
const rememberGeoKey = (key) => {
  try {
    const idx = JSON.parse(localStorage.getItem(GEO_INDEX_KEY) || '[]');
    const next = idx.filter(k => k !== key);
    next.push(key);
    while (next.length > MAX_GEO_CACHE) {
      localStorage.removeItem(next.shift());
    }
    localStorage.setItem(GEO_INDEX_KEY, JSON.stringify(next));
  } catch {
    // cache bookkeeping is best-effort
  }
};

const COORD_REGEX = /^\s*(-?\d+(\.\d+)?)\s*,\s*(-?\d+(\.\d+)?)\s*$/;

/**
 * Live destination suggestions for the autocomplete dropdown. Uses only
 * Open-Meteo's geocoding search (never Nominatim -- its usage policy
 * explicitly forbids client-side autocomplete: "you must not implement
 * such a service on the client side using the API",
 * https://operations.osmfoundation.org/policies/nominatim/).
 */
export const searchLocations = async (query, count = 5) => {
  const trimmed = (query || '').trim();
  if (trimmed.length < 2 || COORD_REGEX.test(trimmed)) return [];
  try {
    const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(trimmed)}&count=${count}&language=en&format=json`);
    const data = await response.json();
    return Array.isArray(data.results) ? data.results : [];
  } catch {
    return [];
  }
};

/**
 * Fallback geocoder for postal/zip codes Open-Meteo doesn't recognize.
 * Open-Meteo's geocoder already resolves many well-known postcodes (e.g.
 * US "90210" -> Beverly Hills, indexed directly on the city entry), but
 * returns nothing for formats like UK ("SW1A 1AA") or Canadian codes.
 * Nominatim (OpenStreetMap) covers those -- used here only as a one-off
 * lookup when Open-Meteo already came back empty, never on every
 * keystroke, keeping well within Nominatim's 1 req/sec policy and its
 * ban on client-side autocomplete. The browser's default Referer header
 * (the app's own origin) satisfies the policy's "identify your
 * application" requirement, since JS cannot set a custom User-Agent.
 *
 * Known limitation: bare numeric postcodes are ambiguous worldwide (a
 * "90210" also exists as a village postcode in Ukraine) and Nominatim's
 * free-text search can return the wrong country for those. This path
 * only runs when Open-Meteo has nothing, so common numeric codes (which
 * Open-Meteo already resolves correctly) never reach it in practice.
 */
export const geocodeViaNominatim = async (locationName) => {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationName)}&format=jsonv2&addressdetails=1&limit=1`);
    if (!response.ok) return null;
    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    const item = data[0];
    const address = item.address || {};
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
    return {
      latitude: lat,
      longitude: lon,
      name: address.city || address.town || address.village || address.municipality
        || (item.display_name ? item.display_name.split(',')[0] : locationName),
      country: address.country || 'Unknown',
      country_code: address.country_code ? address.country_code.toUpperCase() : undefined
    };
  } catch {
    return null;
  }
};

export const geocodeLocation = async (locationName) => {
  try {
    // Check if user inputted raw coordinates e.g., "40.71, -74.00"
    const match = locationName.match(COORD_REGEX);
    if (match) {
      return {
        latitude: parseFloat(match[1]),
        longitude: parseFloat(match[3]),
        name: `${match[1]}, ${match[3]}`,
        country: 'Coordinates'
      };
    }

    const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(locationName)}&count=1&language=en&format=json`);
    const data = await response.json();
    let result = data.results && data.results.length > 0 ? data.results[0] : null;

    // Zip/postal code fallback: Open-Meteo found nothing, try Nominatim.
    if (!result) {
      result = await geocodeViaNominatim(locationName);
    }

    if (result) {
      localStorage.setItem('geo_' + locationName, JSON.stringify(result));
      rememberGeoKey('geo_' + locationName);
      return result; // Returns { latitude, longitude, name, country, country_code }
    }
    throw new Error('Location not found');
  } catch (error) {
    const cached = localStorage.getItem('geo_' + locationName);
    if (cached) return JSON.parse(cached);
    console.error("Geocoding Error:", error);
    throw error;
  }
};

/**
 * Element-wise average of several daily-weather objects (used to build a
 * climate estimate from multiple past years instead of sampling a single,
 * possibly anomalous, year). Exported for tests.
 */
export const averageDailies = (dailies) => {
  const valid = (dailies || []).filter(d => d && Array.isArray(d.time) && d.time.length > 0);
  if (valid.length === 0) return null;
  const len = Math.min(...valid.map(d => d.time.length));
  const avgKey = (key) => Array.from({ length: len }, (_, i) => {
    const vals = valid.map(d => d[key]?.[i]).filter(v => typeof v === 'number');
    if (vals.length === 0) return null;
    return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
  });
  const out = {
    time: valid[0].time.slice(0, len),
    temperature_2m_max: avgKey('temperature_2m_max'),
    temperature_2m_min: avgKey('temperature_2m_min'),
    precipitation_sum: avgKey('precipitation_sum')
  };
  if (valid.some(d => Array.isArray(d.uv_index_max))) out.uv_index_max = avgKey('uv_index_max');
  return out;
};

/**
 * Concatenates two daily-weather objects (near-term forecast + far-term
 * climate estimate), padding keys one side lacks. Exported for tests.
 */
export const mergeDailies = (a, b) => {
  if (!a) return b;
  if (!b) return a;
  const keys = ['time', 'temperature_2m_max', 'temperature_2m_min', 'precipitation_sum', 'uv_index_max'];
  const out = {};
  keys.forEach(k => {
    const av = Array.isArray(a[k]) ? a[k] : null;
    const bv = Array.isArray(b[k]) ? b[k] : null;
    if (!av && !bv) return;
    out[k] = [
      ...(av || Array(a.time.length).fill(null)),
      ...(bv || Array(b.time.length).fill(null))
    ];
  });
  return out;
};

const fetchForecast = async (lat, lon, startStr, endStr) => {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,uv_index_max&timezone=auto&start_date=${startStr}&end_date=${endStr}`;
  const response = await fetch(url);
  const data = await response.json();
  if (data.error) throw new Error(data.reason || 'Weather API Error');
  if (!data.daily) throw new Error('Weather data not available for these dates');
  return data.daily;
};

const fetchClimateEstimate = async (lat, lon, startStr, endStr) => {
  const dailies = [];
  for (let y = 1; y <= CLIMATE_YEARS; y++) {
    const hs = shiftYears(startStr, -y);
    const he = shiftYears(endStr, -y);
    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto&start_date=${hs}&end_date=${he}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.daily) dailies.push(data.daily);
    } catch {
      // one bad year shouldn't sink the whole estimate
    }
  }
  const avg = averageDailies(dailies);
  if (!avg) throw new Error('Climate estimate unavailable');
  // Relabel the historical dates as the actual trip dates
  const req = requestedTimes(startStr, endStr);
  const len = Math.min(avg.time.length, req.length);
  const sliced = { time: req.slice(0, len) };
  ['temperature_2m_max', 'temperature_2m_min', 'precipitation_sum', 'uv_index_max'].forEach(k => {
    if (Array.isArray(avg[k])) sliced[k] = avg[k].slice(0, len);
  });
  return sliced;
};

export const fetchWeather = async (lat, lon, startDateStr, endDateStr) => {
  // Cache key includes the dates so an offline fallback never serves a
  // different trip's weather for these coordinates.
  const cacheKey = `weather_${lat}_${lon}_${startDateStr}_${endDateStr}`;
  try {
    const today = new Date();
    const horizonEnd = addDays(today, FORECAST_HORIZON_DAYS);
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    const diffDays = Math.ceil((start - today) / (1000 * 60 * 60 * 24));

    let daily;
    if (diffDays > 14) {
      // Future trip well past the forecast horizon: climate estimate
      // averaged over the last few years.
      daily = await fetchClimateEstimate(lat, lon, startDateStr, endDateStr);
    } else if (end <= horizonEnd) {
      daily = await fetchForecast(lat, lon, startDateStr, endDateStr);
    } else {
      // Trip straddles the forecast horizon: real forecast for the near
      // window, climate estimate for the remainder (previously this whole
      // request errored out and fell back to fake 20°/10° data).
      const splitStr = toDateStr(horizonEnd);
      const nearDaily = await fetchForecast(lat, lon, startDateStr, splitStr);
      let farDaily = null;
      try {
        farDaily = await fetchClimateEstimate(lat, lon, toDateStr(addDays(horizonEnd, 1)), endDateStr);
      } catch {
        // near-term forecast alone is still useful
      }
      daily = mergeDailies(nearDaily, farDaily);
    }

    localStorage.setItem(cacheKey, JSON.stringify(daily));
    return daily;
  } catch (error) {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      console.log("Using cached offline weather for", lat, lon);
      return JSON.parse(cached);
    }
    console.error("Weather Fetch Error and no cache:", error);
    // Deep fallback so app doesn't crash on airplane mode without cache
    return {
      time: [startDateStr],
      temperature_2m_max: [20],
      temperature_2m_min: [10],
      precipitation_sum: [0]
    };
  }
};
