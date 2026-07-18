import React from 'react';

const CapacityBar = ({ currentVolume, currentWeight, maxVolume, travelMode, packingList }) => {
  if (!maxVolume || maxVolume <= 0) return null;

  const percentage = Math.min(100, Math.round((currentVolume / maxVolume) * 100));
  
  let barColor = 'var(--accent-color)';
  if (percentage >= 90) barColor = '#f59e0b'; // warning orange
  if (percentage >= 100) barColor = '#ef4444'; // error red

  // Convert cm³ to Liters for display
  const currentLiters = (currentVolume / 1000).toFixed(1);
  const maxLiters = (maxVolume / 1000).toFixed(1);
  
  // Weight logic (7,000g = 7kg budget airline limit)
  const weightKg = (currentWeight / 1000).toFixed(1);
  const weightWarning = currentWeight > 7000 && travelMode === 'flying';

  // Find heaviest non-essential items
  let heaviestItems = [];
  if (weightWarning && packingList) {
    let allItems = [];
    Object.values(packingList).forEach(catArray => {
      catArray.forEach(item => {
        if (!item.isEssential && !item.isWorn) {
          allItems.push(item);
        }
      });
    });
    heaviestItems = allItems.sort((a, b) => b.weight - a.weight).slice(0, 2);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
      {weightWarning && (
        <div className="glass animate-slide-up" style={{ padding: '1.25rem', backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid #ef4444', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: '0.75rem', animationDelay: '0.3s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 'bold', color: '#ef4444' }}>
            <span>⚠️</span>
            <span>Budget Airline Warning: Estimated weight ({weightKg} kg) exceeds the standard 7 kg carry-on limit!</span>
          </div>
          {heaviestItems.length > 0 && (
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Consider removing these heavy non-essential items:
              <ul style={{ margin: '0.5rem 0 0 1.5rem', padding: 0 }}>
                {heaviestItems.map(item => (
                  <li key={item.id}>
                    <strong>{item.name}</strong> - {(item.weight / 1000).toFixed(1)}kg
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      
      <div className="glass animate-slide-up" style={{ padding: '1.5rem', animationDelay: '0.45s' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Suitcase Capacity</h3>
          <span style={{ fontWeight: '600', color: percentage >= 100 ? '#ef4444' : 'inherit' }}>
            {percentage}% Full
          </span>
        </div>
        
        <div style={{ width: '100%', backgroundColor: 'var(--border-color)', borderRadius: '999px', height: '12px', overflow: 'hidden' }}>
          <div 
            style={{ 
              height: '100%', 
              width: `${percentage}%`, 
              backgroundColor: barColor,
              transition: 'width 0.5s ease-out, background-color 0.3s ease'
            }} 
          />
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          <span>Used: {currentLiters} L</span>
          <span>Total: {maxLiters} L</span>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', fontSize: '0.875rem' }}>
          <span>Estimated Bag Weight:</span>
          <span style={{ fontWeight: 'bold', color: weightWarning ? '#ef4444' : 'inherit' }}>
            {weightKg} kg / {(currentWeight * 0.00220462).toFixed(1)} lbs
          </span>
        </div>
      </div>
    </div>
  );
};

export default CapacityBar;
