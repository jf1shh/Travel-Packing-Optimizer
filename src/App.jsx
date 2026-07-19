import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { geocodeLocation, fetchWeather } from './services/api';
import { generatePackingList, ACTIVITY_GEAR, deriveCube } from './services/packerLogic';
import Header from './components/Header';
import CapacityBar from './components/CapacityBar';
import TripForm from './components/TripForm';
import CapsuleVisualizer from './components/CapsuleVisualizer';
import SuitcaseLayout from './components/SuitcaseLayout';
import PackingList from './components/PackingList';
const VolumeChart = React.lazy(() => import('./components/VolumeChart'));
import WardrobeManager from './components/WardrobeManager';
import { ConfirmDialog, CopyFallbackDialog, Toast } from './components/Dialogs';
import { Logger } from './services/logger';
import { encodeTripData, decodeTripData } from './services/share';
import { fetchExchangeRates, getCurrencyForCountry, convertCost, formatCurrency } from './services/currency';
import { fetchTravelAdvisory } from './services/advisory';
import { clearAllLocalData } from './services/db';
import { useT } from './i18n/context.jsx';
import { LANGUAGES } from './i18n/languages.js';
import './index.css';

const PREFS_KEY = 'travelPackerItemPrefs';

// How many times the user has removed each generated item from past lists;
// generation uses this to de-prioritize items they never actually pack.
const readItemPrefs = () => {
  try {
    const prefs = JSON.parse(localStorage.getItem(PREFS_KEY) || '{}');
    return prefs && typeof prefs === 'object' && !Array.isArray(prefs) ? prefs : {};
  } catch {
    return {};
  }
};

const recordItemRemoval = (name) => {
  try {
    const prefs = readItemPrefs();
    prefs[name] = (prefs[name] || 0) + 1;
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // preference tracking is best-effort
  }
};

function App() {
  const { t, lang, setLang } = useT();
  const [theme, setTheme] = useState(() => {
    // Honour saved preference first, then OS-level prefers-color-scheme
    const saved = localStorage.getItem('travelPackerTheme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // State
  const [weatherDataArray, setWeatherDataArray] = useState(null);
  const [packingList, setPackingList] = useState(null);
  const [suitcaseVolume, setSuitcaseVolume] = useState(0);
  const [outfits, setOutfits] = useState(null);
  const [activePalette, setActivePalette] = useState('quiet-luxury');
  const [activeTravelMode, setActiveTravelMode] = useState('flying');
  const [tempUnit, setTempUnit] = useState('C');
  const [lengthUnit, setLengthUnit] = useState('cm');
  const [tripStartDate, setTripStartDate] = useState(null);
  const [isWardrobeOpen, setIsWardrobeOpen] = useState(false);
  const [exchangeRates, setExchangeRates] = useState(null);
  const [advisories, setAdvisories] = useState(null);
  const [showFloatingButton, setShowFloatingButton] = useState(false);

  // ── In-app dialogs/toast (replace native alert/confirm/prompt) ──────────
  const [toast, setToast] = useState(null); // { message, type }
  const [shareConfirmData, setShareConfirmData] = useState(null); // { data, message }
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [copyFallbackUrl, setCopyFallbackUrl] = useState(null);

  // ── Floating generate button: show when scrolled past the form ──────────
  useEffect(() => {
    const handleScroll = () => {
      const formEl = document.querySelector('.trip-form');
      if (!formEl) return;
      const formBottom = formEl.getBoundingClientRect().bottom;
      setShowFloatingButton(formBottom < -50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToGenerate = () => {
    const btn = document.querySelector('.trip-form button[type="submit"]');
    if (btn) {
      btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
      btn.focus();
    }
  };
  const [wardrobe, setWardrobe] = useState(() => {
    // Guarded: corrupted storage here previously crashed the app on every
    // load, with no way to reach "Delete All My Data" to recover.
    try {
      const saved = localStorage.getItem('travelPackerWardrobe');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  // ── Wardrobe name → item lookup for photo previews ────────────────────
  const wardrobeLookup = useMemo(() => {
    const map = {};
    (wardrobe || []).forEach(item => {
      if (item && item.name) map[item.name] = item;
    });
    return map;
  }, [wardrobe]);

  // Derived State (Dynamic Recalculation)
  const currentVolume = packingList ? Object.values(packingList).flat().filter(i => i.category !== 'plane').reduce((sum, item) => sum + (item.vol || 0), 0) : 0;
  const currentWeight = packingList ? Object.values(packingList).flat().filter(i => i.category !== 'plane').reduce((sum, item) => sum + (item.weight || 0), 0) : 0;

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('travelPackerState');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.packingList) setPackingList(parsed.packingList);
        if (parsed.outfits) setOutfits(parsed.outfits);
        if (parsed.weatherDataArray) setWeatherDataArray(parsed.weatherDataArray);
        if (parsed.suitcaseVolume) setSuitcaseVolume(parsed.suitcaseVolume);
        if (parsed.activePalette) setActivePalette(parsed.activePalette);
        if (parsed.activeTravelMode) setActiveTravelMode(parsed.activeTravelMode);
        if (parsed.tempUnit) setTempUnit(parsed.tempUnit);
        if (parsed.lengthUnit) setLengthUnit(parsed.lengthUnit);
      } catch (e) {
        console.error("Failed to parse local storage", e);
      }
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    if (packingList) {
      localStorage.setItem('travelPackerState', JSON.stringify({
        packingList,
        outfits,
        weatherDataArray,
        suitcaseVolume,
        activePalette,
        activeTravelMode,
        tempUnit,
        lengthUnit
      }));
    }
  }, [packingList, outfits, weatherDataArray, suitcaseVolume, activePalette, activeTravelMode, tempUnit, lengthUnit]);

  useEffect(() => {
    localStorage.setItem('travelPackerWardrobe', JSON.stringify(wardrobe));
  }, [wardrobe]);

  useEffect(() => {
    // Share payloads travel in the URL fragment (never sent to the server);
    // the query-param form is still read for old links.
    const hash = window.location.hash;
    const shareCode = hash.startsWith('#share=')
      ? hash.slice('#share='.length)
      : new URLSearchParams(window.location.search).get('share');
    // Clean URL either way
    window.history.replaceState({}, document.title, window.location.pathname);
    if (!shareCode) return;

    const data = decodeTripData(shareCode);
    if (data) {
      // Store the raw ingredients rather than a baked message string: this
      // effect runs once on mount, before the async i18n translation JSON
      // has necessarily finished loading, so t() would return the untranslated
      // key. Computing the message at render time (below) instead means it
      // reflects whatever translations are loaded by the time this actually
      // renders, and updates automatically once loading finishes.
      setShareConfirmData({ data, sharedCount: data.w ? data.w.length : 0 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleConfirmShareLoad = () => {
    const { data } = shareConfirmData;
    if (data.w) {
      setWardrobe(data.w);
      localStorage.setItem('travelPackerWardrobe', JSON.stringify(data.w));
    }
    if (data.s) {
      localStorage.setItem('travelPackerState', JSON.stringify(data.s));
      setToast({ message: t('app.shareLoaded'), type: 'success' });
    }
    setShareConfirmData(null);
  };


  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('travelPackerTheme', next);
      return next;
    });
  };

  const toggleTempUnit = () => {
    setTempUnit(prev => prev === 'C' ? 'F' : 'C');
  };

  const toggleLengthUnit = () => {
    setLengthUnit(prev => prev === 'cm' ? 'in' : 'cm');
  };

  const handleGenerateList = async ({ destinations, startDate, endDate, gender, palette, travelMode, dailyActivities, dailyDestinations, formWeatherData, destinationCountries = {}, packingStrategy, techPorts, suitcaseVolume, laundryCycle = 7 }) => {
    setIsLoading(true);
    setError(null);
    setWeatherDataArray(null);
    setPackingList(null);
    setOutfits(null);
    setSuitcaseVolume(suitcaseVolume);
    setActivePalette(palette);
    setActiveTravelMode(travelMode);
    setTripStartDate(startDate);
    
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const duration = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1);

      let allWeatherData = [];
      const countryCodes = [];

      for (let i = 0; i < destinations.length; i++) {
        const dest = destinations[i];
        let weather = formWeatherData[dest];
        let countryCode = destinationCountries[dest];
        if (!weather) {
          const location = await geocodeLocation(dest);
          countryCode = location.country_code;
          weather = await fetchWeather(location.latitude, location.longitude, startDate, endDate);
        }
        countryCodes.push(countryCode);

        // Always key by the raw typed destination string, not the geocoded
        // canonical name — dailyDestinations/formDestinations only ever
        // contain the raw string, so a canonical-name key would silently
        // fail to match and fall back to the wrong day's weather.
        allWeatherData.push({
          locationName: dest,
          weather
        });
      }

      setWeatherDataArray(allWeatherData);

      // Unblock main thread to allow loading spinner to render
      await new Promise(resolve => setTimeout(resolve, 50));

      const result = generatePackingList(allWeatherData, duration, gender, suitcaseVolume, palette, travelMode, dailyActivities, wardrobe, packingStrategy, techPorts, dailyDestinations, destinations, laundryCycle, { countryCodes, itemPreferences: readItemPrefs() });
      
      setPackingList(result.list);
      setOutfits(result.outfitCombinations);

      // ── Fetch currency rates for destination countries ──────────
      try {
        const currencies = [...new Set(countryCodes.map(cc => getCurrencyForCountry(cc)).filter(Boolean))];
        if (currencies.length > 0) {
          const ratesData = await fetchExchangeRates('USD', currencies);
          setExchangeRates({ base: 'USD', rates: ratesData.rates, currencies });
        }
      } catch { /* currency fetch is best-effort */ }

      // ── Fetch travel advisories ─────────────────────────────────
      try {
        const uniqueCC = [...new Set(countryCodes.filter(Boolean))];
        const advisoryResults = await Promise.all(
          uniqueCC.slice(0, 3).map(async (cc) => {
            const adv = await fetchTravelAdvisory(cc);
            return adv ? { countryCode: cc, ...adv } : null;
          })
        );
        const valid = advisoryResults.filter(Boolean);
        if (valid.length > 0) setAdvisories(valid);
      } catch { /* advisory fetch is best-effort */ }
      
    } catch (err) {
      setError(err.message || t('app.generateError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setWeatherDataArray(null);
    setPackingList(null);
    setOutfits(null);
    setSuitcaseVolume(0);
    setExchangeRates(null);
    setAdvisories(null);
    localStorage.removeItem('travelPackerState');
  };

  const handleDeleteAllData = () => setShowDeleteConfirm(true);

  const confirmDeleteAllData = async () => {
    setShowDeleteConfirm(false);
    await clearAllLocalData(); // wipes IndexedDB (wardrobe photos + crash logs)
    localStorage.clear();
    window.location.reload();
  };

  const toggleItem = (category, itemId) => {
    setPackingList(prev => {
      const updatedCategory = [...prev[category]];
      const itemIndex = updatedCategory.findIndex(i => i.id === itemId);
      if (itemIndex > -1) {
        updatedCategory[itemIndex] = {
          ...updatedCategory[itemIndex],
          checked: !updatedCategory[itemIndex].checked
        };
      }
      return { ...prev, [category]: updatedCategory };
    });
  };

  const handleRemoveItem = (category, itemId) => {
    const removedItem = packingList?.[category]?.find(i => i.id === itemId);
    if (removedItem) recordItemRemoval(removedItem.name);
    setPackingList(prev => {
      const updatedCategory = prev[category].filter(i => i.id !== itemId);
      return { ...prev, [category]: updatedCategory };
    });
  };

  const handleAddItem = (category, name, weight) => {
    const newItem = {
      id: `custom-${Date.now()}`,
      category,
      name,
      checked: false,
      vol: 500, // Custom items default to 500cm3 so they don't break the volume bar
      weight: parseInt(weight) || 0,
      priority: 10,
      isEssential: true
    };
    
    setPackingList(prev => {
      const updatedCategory = [...prev[category], newItem];
      return { ...prev, [category]: updatedCategory };
    });

    // Fashion Sync: If they add clothes, inject it into the Capsule Visualizer!
    if (category === 'clothes' && outfits) {
      const lower = String(name).toLowerCase();
      let slot = null;
      if (lower.includes('shirt') || lower.includes('top') || lower.includes('sweater') || lower.includes('tee') || lower.includes('hoodie')) slot = 'top';
      else if (lower.includes('pant') || lower.includes('jean') || lower.includes('short') || lower.includes('skirt') || lower.includes('trouser')) slot = 'bottom';
      else if (lower.includes('jacket') || lower.includes('coat') || lower.includes('blazer') || lower.includes('windbreaker') || lower.includes('shell')) slot = 'outer';
      else if (lower.includes('shoe') || lower.includes('boot') || lower.includes('sneaker') || lower.includes('loafer')) slot = 'shoe';
      
      if (slot) {
        setOutfits(prev => {
          if (!prev || prev.length === 0) return prev;
          const newOutfits = [...prev];
          newOutfits[0] = { ...newOutfits[0], [slot]: name };
          return newOutfits;
        });
      }
    }
  };

  const handleActivitySwap = (dayIndex, activityKey) => {
    // 1. Update the Outfit in the Visualizer
    setOutfits(prev => {
      const newOutfits = [...prev];
      if (activityKey && ACTIVITY_GEAR[activityKey]) {
        const gear = ACTIVITY_GEAR[activityKey].outfit;
        newOutfits[dayIndex] = {
          ...newOutfits[dayIndex],
          activity: activityKey,
          top: gear.top,
          bottom: gear.bottom,
          shoe: gear.shoe,
          outer: gear.outer
        };
      } else {
        newOutfits[dayIndex] = {
          ...newOutfits[dayIndex],
          activity: ''
        };
      }
      return newOutfits;
    });

    // 2. Inject Gear into Packing List if needed. The list is keyed by cube
    // group (plane/main/base/loose/liquid/dry/tech), not by item category --
    // indexing by category here previously crashed the whole app.
    if (activityKey && ACTIVITY_GEAR[activityKey]) {
      const itemsToAdd = ACTIVITY_GEAR[activityKey].items;
      setPackingList(prev => {
        const newList = { ...prev };
        itemsToAdd.forEach(item => {
          const groupKey = deriveCube(item);
          const group = newList[groupKey] || [];
          // Check if item already exists to avoid duplicates
          const exists = group.find(i => i.name === item.name);
          if (!exists) {
            newList[groupKey] = [...group, { ...item, id: `swap-${Date.now()}-${Math.random()}`, checked: false, cube: groupKey }];
          }
        });
        return newList;
      });
    }
  };


  const handleCopyShareLink = () => {
    let tripState = null;
    try {
      tripState = JSON.parse(localStorage.getItem('travelPackerState') || 'null');
    } catch {
      tripState = null;
    }
    const shareCode = encodeTripData(wardrobe, tripState);
    if (shareCode) {
      // Fragment, not query param: fragments are never sent to the server,
      // so the payload can't land in request logs.
      const url = `${window.location.origin}${window.location.pathname}#share=${shareCode}`;
      navigator.clipboard.writeText(url).then(
        () => setToast({ message: t('app.shareCopied'), type: 'success' }),
        () => setCopyFallbackUrl(url)
      );
    } else {
      setToast({ message: t('app.shareFailed'), type: 'error' });
    }
  };

  return (
    <div className="app-container">
      {packingList && (
        <Header theme={theme} toggleTheme={toggleTheme} onOpenWardrobe={() => setIsWardrobeOpen(true)} />
      )}
      
      <main>
        {/* ── Hero: visible before packing list is generated ───────── */}
        {!packingList && (
          <div className="hero animate-fade-in">
            <div className="hero-orb" />
            {/* Title + controls in one row: title left, controls right */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1rem', position: 'relative' }}>
              <h1 className="gradient-text" style={{ margin: 0, fontSize: 'clamp(1.25rem, 4vw, 1.75rem)', textAlign: 'left' }}>{t('app.title')}</h1>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
                <select
                  value={lang}
                  onChange={(e) => setLang(e.target.value)}
                  style={{
                    padding: '0.35rem 0.5rem', borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--surface-color)',
                    color: 'var(--text-primary)', cursor: 'pointer',
                    fontSize: '0.8rem', maxWidth: '100px', width: 'auto',
                  }}
                  aria-label="Select language"
                >
                  {LANGUAGES.map(l => (
                    <option key={l.code} value={l.code}>{l.native}</option>
                  ))}
                </select>
                <button 
                  onClick={() => setIsWardrobeOpen(true)}
                  style={{ padding: '0.4rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--surface-color)', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', boxShadow: 'none', whiteSpace: 'nowrap' }}
                >
                  👕 {t('app.myCloset')}
                </button>
                <button 
                  className="theme-toggle" 
                  onClick={toggleTheme}
                  aria-label={t('common.toggleTheme')}
                >
                  {theme === 'light' ? '🌙' : '☀️'}
                </button>
              </div>
            </div>
            <p className="tagline">{t('app.tagline')}</p>
            <div className="hero-badges">
              <span className="hero-badge">🌤️ Weather-aware</span>
              <span className="hero-badge">👗 12 styles</span>
              <span className="hero-badge">🧳 77 airlines</span>
              <span className="hero-badge">🌍 11 languages</span>
              <span className="hero-badge">📸 Photo outfits</span>
              <span className="hero-badge">🔒 100% private</span>
            </div>
          </div>
        )}
        <TripForm 
          onSubmit={handleGenerateList} 
          isLoading={isLoading} 
          lengthUnit={lengthUnit} 
          toggleLengthUnit={toggleLengthUnit} 
          tempUnit={tempUnit}
          toggleTempUnit={toggleTempUnit}
        />
        
        {error && (
          <div className="glass animate-slide-up" style={{ padding: '1rem', color: '#ef4444', marginBottom: '1rem', border: '1px solid #ef4444' }}>
            {error}
          </div>
        )}

        {outfits && (              <CapsuleVisualizer outfits={outfits} setOutfits={setOutfits} wardrobe={wardrobe} palette={activePalette} onActivityChange={handleActivitySwap} startDate={tripStartDate} wardrobeMap={wardrobeLookup} />
        )}

        {suitcaseVolume > 0 && packingList && (
          <CapacityBar currentVolume={currentVolume} currentWeight={currentWeight} maxVolume={suitcaseVolume} travelMode={activeTravelMode} packingList={packingList} />
        )}

        {packingList && (
          <div style={{ paddingBottom: '2rem' }}>
            <Suspense fallback={<div style={{ textAlign: 'center', padding: '2rem' }}>{t('app.loadingChart')}</div>}>
              <VolumeChart packingList={packingList} suitcaseVolume={suitcaseVolume} />
            </Suspense>
            <PackingList 
              packingList={packingList} 
              toggleItem={toggleItem} 
              handleRemoveItem={handleRemoveItem}
              handleAddItem={handleAddItem}
            />
            {suitcaseVolume > 0 && (
              <SuitcaseLayout
                packingList={packingList}
                suitcaseDims={{ l: 55, w: 35, h: 22 }}
              />
            )}
            {/* ── Trip Wallet: currency exchange ───────────────────── */}
            {exchangeRates && exchangeRates.currencies.length > 0 && (
              <div className="glass animate-slide-up" style={{ padding: '1.25rem', marginTop: '1.5rem' }}>
                <h4 style={{ margin: '0 0 0.75rem', fontSize: '1rem' }}>💱 {t('app.tripWallet')}</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  {exchangeRates.currencies.map(curr => {
                    const rate = exchangeRates.rates[curr];
                    if (!rate) return null;
                    return (
                      <div key={curr} style={{
                        backgroundColor: 'var(--surface-color)', padding: '0.5rem 0.75rem',
                        borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600,
                        display: 'flex', gap: '0.5rem', alignItems: 'center',
                      }}>
                        <span style={{ color: 'var(--accent-color)' }}>1 USD =</span>
                        <span>{formatCurrency(rate, curr)}</span>
                      </div>
                    );
                  })}
                </div>
                <details style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <summary style={{ cursor: 'pointer', fontWeight: 500 }}>{t('app.estimatedCosts')}</summary>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {exchangeRates.currencies.map(curr => {
                      const rate = exchangeRates.rates[curr];
                      if (!rate) return null;
                      const costs = ['laundry', 'coffee', 'meal', 'toiletries', 'sunscreen'];
                      return costs.map(key => {
                        const c = convertCost(key, rate, curr);
                        return (
                          <div key={`${curr}-${key}`} style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>{
                              key === 'laundry' ? '🧺 Laundry' :
                              key === 'coffee' ? '☕ Coffee' :
                              key === 'meal' ? '🍽️ Meal' :
                              key === 'toiletries' ? '🧴 Toiletries' :
                              '🧴 Sunscreen'
                            }</span>
                            <span style={{ fontWeight: 500 }}>{c.display}</span>
                          </div>
                        );
                      });
                    })}
                  </div>
                </details>
              </div>
            )}

            {/* ── Travel advisories ────────────────────────────────── */}
            {advisories && advisories.length > 0 && (
              <div className="glass animate-slide-up" style={{ padding: '1.25rem', marginTop: '1.5rem' }}>
                <h4 style={{ margin: '0 0 0.75rem', fontSize: '1rem' }}>🛡️ {t('app.travelAdvisories')}</h4>
                {advisories.map(adv => (
                  <div key={adv.countryCode} style={{
                    marginBottom: '0.75rem', padding: '0.75rem',
                    backgroundColor: 'var(--surface-color)', borderRadius: '8px',
                    fontSize: '0.8rem',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--accent-color)' }}>
                        {adv.countryCode}
                      </span>
                      <a href={adv.url} target="_blank" rel="noopener noreferrer" style={{
                        color: 'var(--text-secondary)', fontSize: '0.75rem',
                        textDecoration: 'underline',
                      }}>{t('app.fullAdvisory')} →
                      </a>
                    </div>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {adv.summary.length > 250 ? adv.summary.slice(0, 250) + '…' : adv.summary}
                    </p>
                    {adv.updated && (
                      <div style={{ marginTop: '0.35rem', fontSize: '0.7rem', opacity: 0.6 }}>{t('app.updated')}: {new Date(adv.updated).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
              <button 
                onClick={handleReset} 
                style={{ 
                  background: 'transparent', 
                  color: '#ef4444', 
                  border: '1px solid #ef4444', 
                  padding: '0.75rem 2rem', 
                  fontWeight: '600',
                  boxShadow: 'none'
                }}>{t('app.clearData')}
              </button>
            </div>
          </div>
        )}

        <WardrobeManager 
          wardrobe={wardrobe} 
          setWardrobe={setWardrobe} 
          isOpen={isWardrobeOpen} 
          onClose={() => setIsWardrobeOpen(false)} 
        />

        <div style={{ marginTop: '4rem', padding: '2rem 0', borderTop: '1px solid var(--border-color)', textAlign: 'center', opacity: 0.7 }}>
          <h4 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>{t('app.dataPrivacy')}</h4>
          <p style={{ fontSize: '0.875rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>{t('app.localOnly')}
          </p>
          <div style={{ marginBottom: '1rem' }}>
            <button 
              onClick={handleCopyShareLink}
              style={{ 
                background: 'transparent', 
                color: 'var(--primary-color)', 
                border: '1px solid var(--primary-color)', 
                padding: '0.5rem 1rem', 
                borderRadius: '8px',
                fontSize: '0.875rem',
                cursor: 'pointer',
                marginRight: '1rem'
              }}>🔗 {t('app.copyShareLink')}
            </button>
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <button 
              onClick={handleDeleteAllData}
              style={{ 
                background: 'transparent', 
                color: '#ef4444', 
                border: '1px solid #ef4444', 
                padding: '0.5rem 1rem', 
                borderRadius: '8px',
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}>{t('app.deleteAllData')}
            </button>
            <button 
              onClick={() => Logger.exportLogs()} 
              style={{ 
                background: 'transparent', 
                color: 'var(--text-secondary)', 
                border: '1px solid var(--border-color)', 
                padding: '0.5rem 1rem', 
                borderRadius: '8px',
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}>{t('app.downloadLogs')}
            </button>
          </div>
        </div>
      </main>

      {/* Floating generate button — appears when scrolled past the form */}
      {showFloatingButton && !packingList && (
        <button className="floating-btn" onClick={scrollToGenerate}>
          ⚡ {t('app.generateList')}
        </button>
      )}

      {shareConfirmData && (
        <ConfirmDialog
          title={t('app.shareConfirmTitle')}
          message={shareConfirmData.sharedCount > 0
            ? t('app.shareConfirmItems').replace('{wardrobe}', wardrobe.length).replace('{shared}', shareConfirmData.sharedCount)
            : t('app.shareConfirmNoItems')}
          confirmLabel={t('common.confirm')}
          cancelLabel={t('common.cancel')}
          onConfirm={handleConfirmShareLoad}
          onCancel={() => setShareConfirmData(null)}
        />
      )}

      {showDeleteConfirm && (
        <ConfirmDialog
          title={t('app.deleteConfirmTitle')}
          message={t('app.deleteConfirm')}
          confirmLabel={t('common.delete')}
          cancelLabel={t('common.cancel')}
          danger
          onConfirm={confirmDeleteAllData}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}

      {copyFallbackUrl && (
        <CopyFallbackDialog
          title={t('app.shareClipboardFailTitle')}
          message={t('app.shareClipboardFail')}
          value={copyFallbackUrl}
          closeLabel={t('common.close')}
          onClose={() => setCopyFallbackUrl(null)}
        />
      )}

      {toast && (
        <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />
      )}
    </div>
  );
}

export default App;
