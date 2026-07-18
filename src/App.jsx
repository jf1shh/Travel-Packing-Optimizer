import React, { useState, useEffect } from 'react';
import { geocodeLocation, fetchWeather } from './services/api';
import { generatePackingList, ACTIVITY_GEAR } from './services/packerLogic';
import TripForm from './components/TripForm';
import CapsuleVisualizer from './components/CapsuleVisualizer';
import PackingList from './components/PackingList';
import VolumeChart from './components/VolumeChart';
import WardrobeManager from './components/WardrobeManager';
import { encodeTripData, decodeTripData } from './services/share';
import './index.css';

function App() {
  const [theme, setTheme] = useState('dark'); 
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
  const [wardrobe, setWardrobe] = useState(() => {
    const saved = localStorage.getItem('travelPackerWardrobe');
    return saved ? JSON.parse(saved) : [];
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
    const urlParams = new URLSearchParams(window.location.search);
    const shareCode = urlParams.get('share');
    if (shareCode) {
      const data = decodeTripData(shareCode);
      if (data) {
        if (data.w) {
          setWardrobe(data.w);
          localStorage.setItem('travelPackerWardrobe', JSON.stringify(data.w));
        }
        if (data.s) {
          localStorage.setItem('travelPackerState', JSON.stringify(data.s));
          alert("Shared trip loaded successfully! Click Generate to view the packing list.");
        }
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);


  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const toggleTempUnit = () => {
    setTempUnit(prev => prev === 'C' ? 'F' : 'C');
  };

  const toggleLengthUnit = () => {
    setLengthUnit(prev => prev === 'cm' ? 'in' : 'cm');
  };

  const handleGenerateList = async ({ destinations, startDate, endDate, gender, palette, travelMode, dailyActivities, dailyDestinations, formWeatherData, packingStrategy, techPorts, suitcaseVolume }) => {
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

      for (let i = 0; i < destinations.length; i++) {
        const dest = destinations[i];
        let weather = formWeatherData[dest];
        let locName = dest;
        if (!weather) {
          const location = await geocodeLocation(dest);
          weather = await fetchWeather(location.latitude, location.longitude, startDate, endDate);
          locName = [location.name, location.country].filter(Boolean).join(', ');
        }
        
        allWeatherData.push({
          locationName: locName,
          weather
        });
      }

      setWeatherDataArray(allWeatherData);

      // Unblock main thread to allow loading spinner to render
      await new Promise(resolve => setTimeout(resolve, 50));

      const result = generatePackingList(allWeatherData, duration, gender, suitcaseVolume, palette, travelMode, dailyActivities, wardrobe, packingStrategy, techPorts, dailyDestinations, destinations);
      
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

  const handleDeleteAllData = () => {
    if (window.confirm("Are you sure you want to completely delete all saved data, including your Wardrobe and Trip preferences? This cannot be undone.")) {
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
      const lower = name.toLowerCase();
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

    // 2. Inject Gear into Packing List if needed
    if (activityKey && ACTIVITY_GEAR[activityKey]) {
      const itemsToAdd = ACTIVITY_GEAR[activityKey].items;
      setPackingList(prev => {
        const newList = { ...prev };
        itemsToAdd.forEach(item => {
          // Check if item already exists to avoid duplicates
          const exists = newList[item.category].find(i => i.name === item.name);
          if (!exists) {
            newList[item.category] = [...newList[item.category], { ...item, id: `swap-${Date.now()}-${Math.random()}`, checked: false }];
          }
        });
        return newList;
      });
    }
  };


  const handleCopyShareLink = () => {
    const tripState = localStorage.getItem('travelPackerState') ? JSON.parse(localStorage.getItem('travelPackerState')) : null;
    const shareCode = encodeTripData(wardrobe, tripState);
    if (shareCode) {
      const url = new URL(window.location.href);
      url.searchParams.set('share', shareCode);
      navigator.clipboard.writeText(url.toString());
      alert("Share link copied to clipboard! Send this to your travel partner.");
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
          <CapacityBar currentVolume={currentVolume} currentWeight={currentWeight} maxVolume={suitcaseVolume} travelMode={activeTravelMode} />
        )}

        {packingList && (
          <div style={{ paddingBottom: '2rem' }}>
            <VolumeChart packingList={packingList} suitcaseVolume={suitcaseVolume} />
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
              marginBottom: '1rem',
              marginRight: '1rem'
            }}
          >
            🔗 Copy Share Link
          </button>
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
        </div>
      </main>
    </div>
  );
}

export default App;
