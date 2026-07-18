import React from 'react';

const LogisticsPreferences = ({
  gender, setGender,
  palette, setPalette,
  packingStrategy, setPackingStrategy,
  laundryCycle, setLaundryCycle,
  techPorts, setTechPorts
}) => {
  return (
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
          <option value="flexible">Flexible & Efficient</option>
          <option value="minimalist">Extreme Minimalist (Rewear Basics)</option>
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label htmlFor="laundry" style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-secondary)' }}>Laundry Plan</label>
        <select id="laundry" value={laundryCycle} onChange={(e) => setLaundryCycle(parseInt(e.target.value))}>
          <option value={3}>Wash every 3 days</option>
          <option value={5}>Wash every 5 days</option>
          <option value={7}>Wash every 7 days</option>
          <option value={10}>Wash every 10 days</option>
          <option value={14}>Wash every 14 days</option>
          <option value={999}>No Laundry (Pack it all)</option>
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
  );
};

export default LogisticsPreferences;
