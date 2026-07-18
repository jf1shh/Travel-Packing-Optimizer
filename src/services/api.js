export const geocodeLocation = async (locationName) => {
  try {
    // Check if user inputted raw coordinates e.g., "40.71, -74.00"
    const coordRegex = /^\s*(-?\d+(\.\d+)?)\s*,\s*(-?\d+(\.\d+)?)\s*$/;
    const match = locationName.match(coordRegex);
    if (match) {
      return { 
        latitude: parseFloat(match[1]), 
        longitude: parseFloat(match[3]), 
        name: `${match[1]}, ${match[3]}`, 
        country: 'Coordinates' 
      };
    }

    const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(locationName)}&count=1&language=en&format=json`);
    const data = await response.json();
    if (data.results && data.results.length > 0) {
      localStorage.setItem('geo_' + locationName, JSON.stringify(data.results[0]));
      return data.results[0]; // Returns { latitude, longitude, name, country }
    }
    throw new Error('Location not found');
  } catch (error) {
    const cached = localStorage.getItem('geo_' + locationName);
    if (cached) return JSON.parse(cached);
    console.error("Geocoding Error:", error);
    throw error;
  }
};

export const fetchWeather = async (lat, lon, startDateStr, endDateStr) => {
  try {
    const start = new Date(startDateStr);
    const today = new Date();
    const diffDays = Math.ceil((start - today) / (1000 * 60 * 60 * 24));
    
    let url;
    if (diffDays > 14) {
      // Future trip > 14 days out. Use historical data from last year as a climate estimate.
      const lastYearStart = new Date(start);
      lastYearStart.setFullYear(lastYearStart.getFullYear() - 1);
      const lastYearEnd = new Date(endDateStr);
      lastYearEnd.setFullYear(lastYearEnd.getFullYear() - 1);
      
      const hs = lastYearStart.toISOString().split('T')[0];
      const he = lastYearEnd.toISOString().split('T')[0];
      
      url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto&start_date=${hs}&end_date=${he}`;
    } else {
      url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto&start_date=${startDateStr}&end_date=${endDateStr}`;
    }

    const response = await fetch(url);
    const data = await response.json();
    
    if (data.error) throw new Error(data.reason || 'Weather API Error');
    if (data.daily) {
      return data.daily;
    }
    throw new Error('Weather data not available for these dates');
  } catch (error) {
    console.error("Weather Fetch Error:", error);
    throw error;
  }
};
