import React, { useState, useEffect, Suspense } from 'react';
import { geocodeLocation, fetchWeather } from './services/api';
import { generatePackingList, ACTIVITY_GEAR, deriveCube } from './services/packerLogic';
import Header from './components/Header';
import CapacityBar from './components/CapacityBar';
import TripForm from './components/TripForm';
import CapsuleVisualizer from './components/CapsuleVisualizer';
import PackingList from './components/PackingList';
const VolumeChart = React.lazy(() => import('./components/VolumeChart'));
import WardrobeManager from './components/WardrobeManager';
import { Logger } from './services/logger';
import { encodeTripData, decodeTripData } from './services/share';
import { clearAllLocalData } from './services/db';
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
  const [showFloatingButton, setShowFloatingButton] = useState(false);

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
    if (!shareCode) return;

    const data = decodeTripData(shareCode);
    if (data) {
      const sharedCount = data.w ? data.w.length : 0;
      const message = sharedCount > 0
        ? `Load shared trip data? This will replace your closet (currently ${wardrobe.length} items) with ${sharedCount} shared items and overwrite your saved trip settings.`
        : 'Load shared trip data? This will overwrite your saved trip settings.';
      if (window.confirm(message)) {
        if (data.w) {
          setWardrobe(data.w);
          localStorage.setItem('travelPackerWardrobe', JSON.stringify(data.w));
        }
        if (data.s) {
          localStorage.setItem('travelPackerState', JSON.stringify(data.s));
          alert("Shared trip loaded successfully! Click Generate to view the packing list.");
        }
      }
    }
    // Clean URL either way
    window.history.replaceState({}, document.title, window.location.pathname);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


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
      
    } catch (err) {
      setError(err.message || "Failed to generate plan. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setWeatherDataArray(null);
    setPackingList(null);
    setOutfits(null);
    setSuitcaseVolume(0);
    localStorage.removeItem('travelPackerState');
  };

  const handleDeleteAllData = async () => {
    if (window.confirm("Are you sure you want to completely delete all saved data, including your Wardrobe and Trip preferences? This cannot be undone.")) {
      await clearAllLocalData(); // wipes IndexedDB (wardrobe photos + crash logs)
      localStorage.clear();
      window.location.reload();
    }
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
        () => alert("Share link copied to clipboard! Send this to your travel partner."),
        () => window.prompt("Clipboard unavailable -- copy this share link manually:", url)
      );
    } else {
      alert("Failed to generate share link.");
    }
  };

  return (
    <div className="app-container">
      <Header theme={theme} toggleTheme={toggleTheme} onOpenWardrobe={() => setIsWardrobeOpen(true)} />
      
      <main>
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

        {outfits && (
          <CapsuleVisualizer outfits={outfits} setOutfits={setOutfits} wardrobe={wardrobe} palette={activePalette} onActivityChange={handleActivitySwap} startDate={tripStartDate} />
        )}

        {suitcaseVolume > 0 && packingList && (
          <CapacityBar currentVolume={currentVolume} currentWeight={currentWeight} maxVolume={suitcaseVolume} travelMode={activeTravelMode} packingList={packingList} />
        )}

        {packingList && (
          <div style={{ paddingBottom: '2rem' }}>
            <Suspense fallback={<div style={{ textAlign: 'center', padding: '2rem' }}>Loading Chart...</div>}>
              <VolumeChart packingList={packingList} suitcaseVolume={suitcaseVolume} />
            </Suspense>
            <PackingList 
              packingList={packingList} 
              toggleItem={toggleItem} 
              handleRemoveItem={handleRemoveItem}
              handleAddItem={handleAddItem}
            />
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
                }}
              >
                Clear Data & Start Over
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
          <h4 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>Data & Privacy</h4>
          <p style={{ fontSize: '0.875rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
            This app runs 100% locally on your device. We do not store or transmit your data to any databases.
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
              }}
            >
              🔗 Copy Share Link
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
              }}
            >
              Delete All My Data
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
              }}
            >
              Download Diagnostic Logs
            </button>
          </div>
        </div>
      </main>

      {/* Floating generate button — appears when scrolled past the form */}
      {showFloatingButton && !packingList && (
        <button
          onClick={scrollToGenerate}
          style={{
            position: 'fixed',
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 900,
            padding: '12px 28px',
            fontSize: '0.95rem',
            fontWeight: 700,
            borderRadius: '999px',
            background: 'var(--accent-gradient)',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 24px rgba(37, 99, 235, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateX(-50%) translateY(-2px)';
            e.target.style.boxShadow = '0 6px 32px rgba(37, 99, 235, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateX(-50%)';
            e.target.style.boxShadow = '0 4px 24px rgba(37, 99, 235, 0.4)';
          }}
        >
          ⚡ Generate List
        </button>
      )}
    </div>
  );
}

export default App;
