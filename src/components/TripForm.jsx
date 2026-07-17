import React, { useState } from 'react';

const TripForm = ({ onSubmit, isLoading, lengthUnit, toggleLengthUnit }) => {
  const [destinations, setDestinations] = useState(['']);
  
  const todayStr = new Date().toISOString().split('T')[0];
  const defaultEnd = new Date();
  defaultEnd.setDate(defaultEnd.getDate() + 2);
  const endStr = defaultEnd.toISOString().split('T')[0];
  
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(endStr);
  
  const [gender, setGender] = useState('other');
  const [palette, setPalette] = useState('navy-grey');
  
  // Activities
  const [activities, setActivities] = useState({
    beach: false,
    hike: false,
    gym: false,
    formal: false
  });
  
  // Suitcase states
  const [preset, setPreset] = useState('away-carry');
  const [length, setLength] = useState('55');
  const [width, setWidth] = useState('34.8');
  const [height, setHeight] = useState('22.8');

  const handlePresetChange = (e) => {
    const val = e.target.value;
    setPreset(val);
    if (val === 'away-carry') { setLength('55'); setWidth('34.8'); setHeight('22.8'); }
    else if (val === 'rimowa-cabin') { setLength('55'); setWidth('40'); setHeight('23'); }
    else if (val === 'samsonite-check') { setLength('75'); setWidth('51'); setHeight('31'); }
  };

  const handleActivityToggle = (key) => {
    setActivities(prev => ({ ...prev, [key]: !prev[key] }));
  };

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
        activities,
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
          <option value="rimowa-cabin">Rimowa: Cabin {lengthUnit === 'in' ? '(21.7 x 15.7 x 9.1)' : '(55 x 40 x 23)'}</option>
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

      {/* Activities Grid */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.75rem' }}>Activities</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          {Object.entries({ beach: '🏖️ Beach/Swim', hike: '🥾 Hiking', gym: '💪 Gym/Workout', formal: '👔 Formal Event' }).map(([key, label]) => (
            <label key={key} className={`checkbox-wrapper ${activities[key] ? 'checked' : ''}`} style={{ margin: 0, padding: '0.75rem' }}>
              <input 
                type="checkbox" 
                checked={activities[key]}
                onChange={() => handleActivityToggle(key)}
              />
              <span className="checkbox-label" style={{ fontSize: '0.875rem' }}>{label}</span>
            </label>
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
          <label htmlFor="palette" style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-secondary)' }}>Capsule Palette</label>
          <select id="palette" value={palette} onChange={(e) => setPalette(e.target.value)}>
            <option value="navy-grey">Navy & Grey Classic</option>
            <option value="earth">Earth Tones</option>
            <option value="monochrome">Monochrome / Neutrals</option>
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
