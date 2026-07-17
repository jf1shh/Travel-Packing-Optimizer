import React from 'react';

const CapacityBar = ({ currentVolume, currentWeight, maxVolume }) => {
  if (!maxVolume || maxVolume <= 0) return null;

  const percentage = Math.min(100, Math.round((currentVolume / maxVolume) * 100));
  
  let barColor = 'var(--accent-color)';
  if (percentage >= 90) barColor = '#f59e0b'; // warning orange
  if (percentage >= 100) barColor = '#ef4444'; // error red

  // Convert cm³ to Liters for display
  const currentLiters = (currentVolume / 1000).toFixed(1);
  const maxLiters = (maxVolume / 1000).toFixed(1);
  
  // Weight logic (10,000g = 10kg limit)
  const weightKg = (currentWeight / 1000).toFixed(1);
  const weightWarning = currentWeight >= 10000;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
      {weightWarning && (
        <div className="glass animate-slide-up" style={{ padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: '500', animationDelay: '0.3s' }}>
          <span>⚠️</span>
          <span>Budget Airline Warning: Estimated weight ({weightKg} kg) exceeds the standard 10 kg carry-on limit!</span>
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
