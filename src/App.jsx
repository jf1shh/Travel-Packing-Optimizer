import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import TripForm from './components/TripForm';
import WeatherWidget from './components/WeatherWidget';
import PackingList from './components/PackingList';
import CapacityBar from './components/CapacityBar';
import CapsuleVisualizer from './components/CapsuleVisualizer';
import { geocodeLocation, fetchWeather } from './services/api';
import { generatePackingList } from './services/packerLogic';
import './index.css';

function App() {
  const [theme, setTheme] = useState('dark'); 
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // State
  const [weatherDataArray, setWeatherDataArray] = useState(null);
  const [packingList, setPackingList] = useState(null);
  const [currentVolume, setCurrentVolume] = useState(0);
  const [suitcaseVolume, setSuitcaseVolume] = useState(0);
  const [outfits, setOutfits] = useState(null);
  const [activePalette, setActivePalette] = useState('navy-grey');
  const [tempUnit, setTempUnit] = useState('C');
  const [lengthUnit, setLengthUnit] = useState('cm');

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('travelPackerState');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.packingList) setPackingList(parsed.packingList);
        if (parsed.outfits) setOutfits(parsed.outfits);
        if (parsed.weatherDataArray) setWeatherDataArray(parsed.weatherDataArray);
        if (parsed.currentVolume) setCurrentVolume(parsed.currentVolume);
        if (parsed.suitcaseVolume) setSuitcaseVolume(parsed.suitcaseVolume);
        if (parsed.activePalette) setActivePalette(parsed.activePalette);
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
        currentVolume,
        suitcaseVolume,
        activePalette,
        tempUnit,
        lengthUnit
      }));
    }
  }, [packingList, outfits, weatherDataArray, currentVolume, suitcaseVolume, activePalette, tempUnit, lengthUnit]);

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

  const handleGenerateList = async ({ destinations, startDate, endDate, gender, palette, activities, suitcaseVolume }) => {
    setIsLoading(true);
    setError(null);
    setWeatherDataArray(null);
    setPackingList(null);
    setOutfits(null);
    setSuitcaseVolume(suitcaseVolume);
    setActivePalette(palette);
    
    try {
      // Calculate duration in days (inclusive)
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

      const result = generatePackingList(allWeatherData, duration, gender, suitcaseVolume, palette, activities);
      
      setPackingList(result.list);
      setCurrentVolume(result.currentVolume);
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
    setCurrentVolume(0);
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
          <CapsuleVisualizer outfits={outfits} palette={activePalette} />
        )}

        {suitcaseVolume > 0 && packingList && (
          <CapacityBar currentVolume={currentVolume} maxVolume={suitcaseVolume} />
        )}

        {packingList && (
          <div style={{ paddingBottom: '2rem' }}>
            <PackingList packingList={packingList} toggleItem={toggleItem} />
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
