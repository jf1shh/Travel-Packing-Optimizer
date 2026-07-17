import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import TripForm from './components/TripForm';
import WeatherWidget from './components/WeatherWidget';
import PackingList from './components/PackingList';
import CapacityBar from './components/CapacityBar';
import CapsuleVisualizer from './components/CapsuleVisualizer';
import { geocodeLocation, fetchWeather } from './services/api';
import { generatePackingList, ACTIVITY_GEAR } from './services/packerLogic';
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

  // Derived State (Dynamic Recalculation)
  const currentVolume = packingList ? Object.values(packingList).flat().reduce((sum, item) => sum + (item.vol || 0), 0) : 0;
  const currentWeight = packingList ? Object.values(packingList).flat().reduce((sum, item) => sum + (item.weight || 0), 0) : 0;

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

  const handleGenerateList = async ({ destinations, startDate, endDate, gender, palette, travelMode, activities, suitcaseVolume }) => {
    setIsLoading(true);
    setError(null);
    setWeatherDataArray(null);
    setPackingList(null);
    setOutfits(null);
    setSuitcaseVolume(suitcaseVolume);
    setActivePalette(palette);
    setActiveTravelMode(travelMode);
    
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const duration = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1);

      let allWeatherData = [];

      for (let i = 0; i < destinations.length; i++) {
        const location = await geocodeLocation(destinations[i]);
        const weather = await fetchWeather(location.latitude, location.longitude, startDate, endDate);
        
        const locName = [location.name, location.country].filter(Boolean).join(', ');
        
        allWeatherData.push({
          locationName: locName,
          weather
        });
      }

      setWeatherDataArray(allWeatherData);

      const result = generatePackingList(allWeatherData, duration, gender, suitcaseVolume, palette, travelMode, activities);
      
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

  return (
    <div className="app-container">
      <Header theme={theme} toggleTheme={toggleTheme} />
      
      <main>
        <TripForm onSubmit={handleGenerateList} isLoading={isLoading} lengthUnit={lengthUnit} toggleLengthUnit={toggleLengthUnit} />
        
        {error && (
          <div className="glass animate-slide-up" style={{ padding: '1rem', color: '#ef4444', marginBottom: '1rem', border: '1px solid #ef4444' }}>
            {error}
          </div>
        )}

        {weatherDataArray && (
          <WeatherWidget weatherDataArray={weatherDataArray} tempUnit={tempUnit} toggleTempUnit={toggleTempUnit} />
        )}

        {outfits && (
          <CapsuleVisualizer outfits={outfits} palette={activePalette} onActivityChange={handleActivitySwap} />
        )}

        {suitcaseVolume > 0 && packingList && (
          <CapacityBar currentVolume={currentVolume} currentWeight={currentWeight} maxVolume={suitcaseVolume} travelMode={activeTravelMode} />
        )}

        {packingList && (
          <div style={{ paddingBottom: '2rem' }}>
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
      </main>
    </div>
  );
}

export default App;
