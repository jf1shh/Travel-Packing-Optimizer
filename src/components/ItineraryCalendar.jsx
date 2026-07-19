import React from 'react';
import { guessActivityFromDestination, ACTIVITY_OPTIONS } from '../utils/activity';

const ItineraryCalendar = ({
  duration,
  destinations,
  startDate,
  dailyDestinations,
  setDailyDestinations,
  dailyActivities,
  setDailyActivities,
  formWeatherData,
  tempUnit,
  toggleTempUnit
}) => {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <label style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-primary)', margin: 0 }}>Itinerary & Forecast</label>
        {toggleTempUnit && (
          <button 
            type="button"
            className="theme-toggle" 
            onClick={toggleTempUnit}
            style={{ fontSize: '1rem', fontWeight: 'bold', padding: '0.25rem 0.5rem' }}
            title="Toggle Temperature Unit"
          >
            °{tempUnit}
          </button>
        )}
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', paddingBottom: '1rem' }}>
        {Array.from({ length: duration }).map((_, i) => {
          const dest = dailyDestinations[i] || destinations[0] || 'Unknown';
          const weatherObj = formWeatherData[dest];
          
          const dDate = new Date(startDate);
          dDate.setDate(dDate.getDate() + i);
          const dateStr = dDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
          
          let maxTempC = null;
          let minTempC = null;
          let rain = 0;
          let icon = '⛅';

          if (weatherObj && weatherObj.temperature_2m_max && weatherObj.temperature_2m_max[i] !== undefined) {
            maxTempC = Math.round(weatherObj.temperature_2m_max[i]);
            minTempC = Math.round(weatherObj.temperature_2m_min[i]);
            rain = weatherObj.precipitation_sum[i];
            
            if (rain > 5) icon = '🌧️';
            else if (maxTempC < 15) icon = '❄️';
            else if (maxTempC > 25) icon = '☀️';
          }

          const max = maxTempC !== null ? (tempUnit === 'F' ? Math.round(maxTempC * 9/5 + 32) : maxTempC) : '--';
          const min = minTempC !== null ? (tempUnit === 'F' ? Math.round(minTempC * 9/5 + 32) : minTempC) : '--';

          return (
            <div key={i} className="glass" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--accent-color)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Day {i + 1}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{dateStr}</span>
              </div>
              
              <div style={{ textAlign: 'center', margin: '0.5rem 0' }}>
                <div style={{ fontSize: '2.5rem', lineHeight: '1' }}>{icon}</div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'baseline', marginTop: '0.5rem' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{max}°</span>
                  <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>{min}°</span>
                </div>
                {rain > 0 ? (
                  <div style={{ fontSize: '0.75rem', color: 'var(--accent-color)', marginTop: '0.25rem' }}>{rain.toFixed(1)}mm rain</div>
                ) : (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>0mm rain</div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: 'auto' }}>
                {destinations.filter(d => d.trim() !== '').length > 1 && (
                  <select
                    value={dailyDestinations[i] || destinations[0]}
                    onChange={(e) => {
                      const newD = [...dailyDestinations];
                      newD[i] = e.target.value;
                      setDailyDestinations(newD);
                    }}
                    style={{ padding: '0.35rem', borderRadius: '6px', background: 'var(--bg-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', fontSize: '0.75rem', width: '100%' }}
                  >
                    {destinations.map((d, idx) => d.trim() !== '' && (
                      <option key={idx} value={d}>{d}</option>
                    ))}
                  </select>
                )}
                <div className="activity-tags-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', paddingBottom: '0.5rem', marginTop: '0.25rem' }}>
                  {ACTIVITY_OPTIONS.map(opt => {
                    const guessed = dailyActivities[i] === null ? guessActivityFromDestination(dailyDestinations[i] || destinations[0]) : null;
                    const isSelected = dailyActivities[i] === opt.value || (dailyActivities[i] === null && guessed === opt.value) || (dailyActivities[i] === null && guessed === '' && opt.value === '');
                    
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          const newArr = [...dailyActivities];
                          if (isSelected) {
                            // Toggle off: revert Casual (empty) pill to auto-guess,
                            // all other pills to explicit-none.
                            newArr[i] = opt.value === '' ? null : '';
                          } else {
                            newArr[i] = opt.value;
                          }
                          setDailyActivities(newArr);
                        }}
                        style={{
                          background: isSelected ? 'var(--accent-color)' : 'rgba(255,255,255,0.05)',
                          color: isSelected ? '#fff' : 'var(--text-secondary)',
                          border: `1px solid ${isSelected ? 'var(--accent-color)' : 'rgba(255,255,255,0.1)'}`,
                          padding: '0.35rem 0.75rem',
                          borderRadius: '16px',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          transition: 'all 0.2s',
                          boxShadow: isSelected ? '0 2px 4px rgba(0,0,0,0.2)' : 'none'
                        }}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ItineraryCalendar;
