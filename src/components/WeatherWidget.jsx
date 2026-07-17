import React from 'react';

const WeatherWidget = ({ weatherDataArray, tempUnit, toggleTempUnit }) => {
  if (!weatherDataArray || weatherDataArray.length === 0) return null;

  const getDayName = (dateStr) => {
    const [y, m, d] = dateStr.split('-');
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
  };

  const getIcon = (rain, maxTemp) => {
    if (rain > 5) return '🌧️';
    if (maxTemp < 15) return '❄️';
    if (maxTemp > 25) return '☀️';
    return '⛅';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '1.5rem' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Trip Forecast</h2>
        <button 
          className="theme-toggle" 
          onClick={toggleTempUnit}
          style={{ fontSize: '1rem', fontWeight: 'bold' }}
        >
          °{tempUnit}
        </button>
      </div>

      {weatherDataArray.map((cityData, cityIdx) => {
        const { locationName, weather } = cityData;
        if (!weather || !weather.temperature_2m_max) return null;
        
        const { time, temperature_2m_max, temperature_2m_min, precipitation_sum } = weather;

        return (
          <div key={cityIdx} className="glass animate-slide-up" style={{ padding: '1.5rem', animationDelay: '0.4s' }}>
            <div style={{ marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Forecast for {locationName}</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>Duration of your trip</p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
              {time.map((dateStr, idx) => {
                const maxC = Math.round(temperature_2m_max[idx]);
                const minC = Math.round(temperature_2m_min[idx]);
                const max = tempUnit === 'F' ? Math.round(maxC * 9/5 + 32) : maxC;
                const min = tempUnit === 'F' ? Math.round(minC * 9/5 + 32) : minC;
                
                const rain = precipitation_sum[idx].toFixed(1);
                const icon = getIcon(rain, maxC);

                return (
                  <a 
                    key={dateStr} 
                    href={`https://www.google.com/search?q=weather+in+${encodeURIComponent(locationName)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`Verify forecast for ${locationName}`}
                    style={{ 
                      minWidth: '100px', 
                      padding: '1rem', 
                      backgroundColor: 'var(--surface-color)', 
                      borderRadius: '12px',
                      border: '1px solid var(--border-color)',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                      textDecoration: 'none',
                      color: 'inherit',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>{getDayName(dateStr)}</div>
                    <div style={{ fontSize: '2rem' }}>{icon}</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)' }}>{max}°</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{min}°</div>
                    {rain > 0 ? (
                      <div style={{ fontSize: '0.75rem', color: 'var(--accent-color)' }}>{rain}mm</div>
                    ) : (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>0mm</div>
                    )}
                  </a>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default WeatherWidget;
