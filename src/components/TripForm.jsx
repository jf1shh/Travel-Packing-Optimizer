import React, { useState, useEffect } from 'react';
import { geocodeLocation, fetchWeather } from '../services/api';

const TripForm = ({ onSubmit, isLoading, lengthUnit, toggleLengthUnit }) => {
  const [destinations, setDestinations] = useState(['']);
  
  const todayStr = new Date().toISOString().split('T')[0];
  const defaultEnd = new Date();
  defaultEnd.setDate(defaultEnd.getDate() + 2);
  const endStr = defaultEnd.toISOString().split('T')[0];
  
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(endStr);
  
  const [gender, setGender] = useState('other');
  const [palette, setPalette] = useState('quiet-luxury');
  const [travelMode, setTravelMode] = useState('flying');
  
  // Activities
  const [dailyActivities, setDailyActivities] = useState(Array(30).fill(''));
  
  // Daily Destinations & Weather
  const [dailyDestinations, setDailyDestinations] = useState(Array(30).fill(''));
  const [formWeatherData, setFormWeatherData] = useState({});
  const [isFetchingWeather, setIsFetchingWeather] = useState(false);

  useEffect(() => {
    const validDests = destinations.filter(d => d.trim().length > 2);
    if (validDests.length === 0) return;

    const fetchAll = async () => {
      setIsFetchingWeather(true);
      const newWeatherData = {};
      try {
        for (let dest of validDests) {
          const loc = await geocodeLocation(dest);
          const w = await fetchWeather(loc.latitude, loc.longitude, startDate, endDate);
          newWeatherData[dest] = w;
        }
        setFormWeatherData(newWeatherData);
      } catch (e) {
        console.error("Form weather fetch failed", e);
      }
      setIsFetchingWeather(false);
    };

    const debounceId = setTimeout(fetchAll, 1000);
    return () => clearTimeout(debounceId);
  }, [destinations, startDate, endDate]);
  
  // Suitcase states
  const [preset, setPreset] = useState('away-carry');
  const [packingStrategy, setPackingStrategy] = useState('standard');
  const [techPorts, setTechPorts] = useState('mixed');
  const [length, setLength] = useState('55');
  const [width, setWidth] = useState('34.8');
  const [height, setHeight] = useState('22.8');

  const handlePresetChange = (e) => {
    const val = e.target.value;
    setPreset(val);
    if (val === 'away-carry') { setLength('55'); setWidth('34.8'); setHeight('22.8'); }
    else if (val === 'rimowa-cabin') { setLength('55'); setWidth('40'); setHeight('23'); }
    else if (val === 'samsonite-check') { setLength('75'); setWidth('51'); setHeight('31'); }
    else if (val === 'monos-carry') { setLength('55.9'); setWidth('35.6'); setHeight('22.9'); }
    else if (val === 'travelpro-21') { setLength('59.7'); setWidth('36.8'); setHeight('22.9'); }
    else if (val === 'beis-roller') { setLength('58'); setWidth('40'); setHeight('25.4'); }
    else if (val === 'osprey-40') { setLength('55'); setWidth('35'); setHeight('23'); }
    else if (val === 'peak-45') { setLength('56'); setWidth('33'); setHeight('24'); }
  };

  const getDuration = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1);
  };
  const duration = getDuration();

  const updateDestination = (index, value) => {
    const newDest = [...destinations];
    newDest[index] = value;
    setDestinations(newDest);
  };

  const addDestination = () => {
    if (destinations.length < 5) {
      setDestinations([...destinations, '']);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validDestinations = destinations.filter(d => d.trim() !== '');
    if (validDestinations.length > 0) {
      onSubmit({ 
        destinations: validDestinations, 
        startDate,
        endDate,
        gender,
        palette,
        travelMode,
        dailyActivities: dailyActivities.slice(0, duration),
        dailyDestinations: dailyDestinations.slice(0, duration),
        formWeatherData,
        packingStrategy,
        techPorts,
        suitcaseVolume: (parseFloat(length) || 0) * (parseFloat(width) || 0) * (parseFloat(height) || 0) 
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="trip-form glass animate-slide-up">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        
        {/* Destinations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-secondary)' }}>Destinations</label>
          {destinations.map((dest, idx) => (
            <input 
              key={idx}
              type="text" 
              placeholder={idx === 0 ? "e.g., London, or 40.71, -74.00" : "Add another city..."}
              value={dest}
              onChange={(e) => updateDestination(idx, e.target.value)}
              required={idx === 0}
            />
          ))}
          {destinations.length < 5 && (
            <button 
              type="button" 
              onClick={addDestination}
              style={{ background: 'transparent', color: 'var(--accent-color)', border: '1px dashed var(--accent-color)', padding: '0.5rem', marginTop: '0.25rem' }}
            >
              + Add Destination
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="startDate" style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-secondary)' }}>Start Date</label>
            <input 
              id="startDate"
              type="date" 
              value={startDate}
              min={todayStr}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="endDate" style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-secondary)' }}>End Date</label>
            <input 
              id="endDate"
              type="date" 
              value={endDate}
              min={startDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>
        </div>
      </div>

      {/* Travel Mode */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label htmlFor="travelMode" style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-secondary)' }}>Travel Mode</label>
        <select id="travelMode" value={travelMode} onChange={(e) => setTravelMode(e.target.value)}>
          <option value="flying">✈️ Flying (Strict Airline Limits)</option>
          <option value="driving">🚗 Driving / Road Trip</option>
          <option value="train">🚂 Train / Bus</option>
          <option value="biking">🚴 Biking / Backpacking</option>
        </select>
      </div>

      {/* Bag Selection */}
      <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: 'var(--surface-color)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-secondary)', display: 'block', margin: 0 }}>Suitcase Optimization</label>
          <button 
            type="button" 
            className="theme-toggle" 
            onClick={toggleLengthUnit} 
            style={{ fontSize: '0.875rem', fontWeight: 'bold' }}
          >
            {lengthUnit}
          </button>
        </div>

        <select value={preset} onChange={handlePresetChange} style={{ marginBottom: '1rem' }}>
          <option value="away-carry">Away: The Carry-On {lengthUnit === 'in' ? '(21.7 x 13.7 x 9.0)' : '(55 x 34.8 x 22.8)'}</option>
          <option value="monos-carry">Monos: Carry-On {lengthUnit === 'in' ? '(22 x 14 x 9)' : '(55.9 x 35.6 x 22.9)'}</option>
          <option value="beis-roller">BÉIS: Carry-On Roller {lengthUnit === 'in' ? '(22.8 x 15.7 x 10)' : '(58 x 40 x 25.4)'}</option>
          <option value="travelpro-21">Travelpro: Platinum Elite 21" {lengthUnit === 'in' ? '(23.5 x 14.5 x 9)' : '(59.7 x 36.8 x 22.9)'}</option>
          <option value="rimowa-cabin">Rimowa: Cabin {lengthUnit === 'in' ? '(21.7 x 15.7 x 9.1)' : '(55 x 40 x 23)'}</option>
          <option value="osprey-40">Osprey: Farpoint 40L Backpack {lengthUnit === 'in' ? '(21.7 x 13.8 x 9.1)' : '(55 x 35 x 23)'}</option>
          <option value="peak-45">Peak Design: Travel Backpack 45L {lengthUnit === 'in' ? '(22 x 13 x 9.5)' : '(56 x 33 x 24)'}</option>
          <option value="samsonite-check">Samsonite: Check-In Large {lengthUnit === 'in' ? '(29.5 x 20.1 x 12.2)' : '(75 x 51 x 31)'}</option>
          <option value="custom">Custom Dimensions</option>
        </select>
        
        <div style={{ display: 'flex', gap: '0.5rem', width: '100%', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>L</span>
            <input 
              style={{ width: '100%', boxSizing: 'border-box' }} 
              type="number" 
              step="any"
              value={lengthUnit === 'in' ? (parseFloat(length) / 2.54).toFixed(1) : length} 
              onChange={(e) => { 
                const v = parseFloat(e.target.value) || 0;
                setLength(lengthUnit === 'in' ? v * 2.54 : v); 
                setPreset('custom'); 
              }} 
            />
          </div>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>W</span>
            <input 
              style={{ width: '100%', boxSizing: 'border-box' }} 
              type="number" 
              step="any"
              value={lengthUnit === 'in' ? (parseFloat(width) / 2.54).toFixed(1) : width} 
              onChange={(e) => { 
                const v = parseFloat(e.target.value) || 0;
                setWidth(lengthUnit === 'in' ? v * 2.54 : v); 
                setPreset('custom'); 
              }} 
            />
          </div>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>H</span>
            <input 
              style={{ width: '100%', boxSizing: 'border-box' }} 
              type="number" 
              step="any"
              value={lengthUnit === 'in' ? (parseFloat(height) / 2.54).toFixed(1) : height} 
              onChange={(e) => { 
                const v = parseFloat(e.target.value) || 0;
                setHeight(lengthUnit === 'in' ? v * 2.54 : v); 
                setPreset('custom'); 
              }} 
            />
          </div>
        </div>
      </div>

      {/* Daily Itinerary */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.75rem' }}>Daily Itinerary</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto', paddingRight: '0.5rem' }}>
          {Array.from({ length: duration }).map((_, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-color)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', gap: '0.5rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: '500', whiteSpace: 'nowrap' }}>Day {i + 1}</span>
                {(() => {
                  const dest = dailyDestinations[i] || destinations[0];
                  const weatherObj = formWeatherData[dest];
                  if (!weatherObj || !weatherObj.temperature_2m_max) return null;
                  const maxTemp = weatherObj.temperature_2m_max[i];
                  const rain = weatherObj.precipitation_sum[i];
                  if (maxTemp === undefined) return null;
                  
                  const isRain = rain > 2;
                  return (
                    <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', background: 'var(--bg-color)', borderRadius: '6px', whiteSpace: 'nowrap' }}>
                      {Math.round(maxTemp)}°C {isRain ? '🌧️' : '☀️'}
                    </span>
                  );
                })()}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {destinations.filter(d => d.trim() !== '').length > 1 && (
                  <select
                    value={dailyDestinations[i] || destinations[0]}
                    onChange={(e) => {
                      const newD = [...dailyDestinations];
                      newD[i] = e.target.value;
                      setDailyDestinations(newD);
                    }}
                    style={{ padding: '0.25rem 0.5rem', borderRadius: '6px', background: 'var(--bg-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', fontSize: '0.75rem', maxWidth: '100px' }}
                  >
                    {destinations.map((d, idx) => d.trim() !== '' && (
                      <option key={idx} value={d}>{d}</option>
                    ))}
                  </select>
                )}
                <select 
                  value={dailyActivities[i] || ''} 
                  onChange={(e) => {
                    const newArr = [...dailyActivities];
                    newArr[i] = e.target.value;
                    setDailyActivities(newArr);
                  }}
                  style={{ padding: '0.25rem 0.5rem', borderRadius: '6px', background: 'var(--bg-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', fontSize: '0.75rem', maxWidth: '140px' }}
                >
                <option value="">Casual / Standard</option>
                <option value="formal">Formal / Dinner</option>
                <option value="gym">Gym / Workout</option>
                <option value="beach">Beach / Pool</option>
                <option value="hike">Hiking / Trail</option>
                <option value="ski">Skiing / Snowboarding</option>
                <option value="business">Business / Meeting</option>
                <option value="nightout">Night Out / Clubbing</option>
              </select>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label htmlFor="gender" style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-secondary)' }}>Style</label>
          <select id="gender" value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="male">Menswear</option>
            <option value="female">Womenswear</option>
            <option value="other">Neutral</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label htmlFor="palette" style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-secondary)' }}>Fashion Archetype</label>
          <select id="palette" value={palette} onChange={(e) => setPalette(e.target.value)}>
            <option value="quiet-luxury">Quiet Luxury / Old Money</option>
            <option value="gorpcore">Gorpcore / Techwear</option>
            <option value="scandi">Minimalist Scandi</option>
            <option value="streetwear">Y2K Streetwear</option>
            <option value="dark-academia">Dark Academia</option>
            <option value="athleisure">Performance Athleisure</option>
            <option value="bohemian">Resort / Bohemian</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label htmlFor="strategy" style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-secondary)' }}>Packing Strategy</label>
          <select id="strategy" value={packingStrategy} onChange={(e) => setPackingStrategy(e.target.value)}>
            <option value="standard">Standard (Comfortable)</option>
            <option value="minimalist">Extreme Minimalist (Rewear Basics)</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label htmlFor="ports" style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-secondary)' }}>Tech Devices</label>
          <select id="ports" value={techPorts} onChange={(e) => setTechPorts(e.target.value)}>
            <option value="mixed">Mixed (USB-C, Lightning, etc)</option>
            <option value="usbc">All USB-C (Consolidate Cables)</option>
          </select>
        </div>
      </div>

      <button type="submit" disabled={isLoading} style={{ width: '100%', fontSize: '1.1rem', padding: '1rem' }}>
        {isLoading ? 'Optimizing...' : 'Generate Optimized List'}
      </button>
    </form>
  );
};

export default TripForm;
