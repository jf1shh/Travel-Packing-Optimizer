import React from 'react';

const SuitcaseSelector = ({ 
  preset, setPreset, 
  length, setLength, 
  width, setWidth, 
  height, setHeight, 
  lengthUnit, toggleLengthUnit 
}) => {

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

  return (
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
  );
};

export default SuitcaseSelector;
