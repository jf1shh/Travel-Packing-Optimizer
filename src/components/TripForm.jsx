import React, { useState, useEffect } from 'react';
import { geocodeLocation, fetchWeather } from '../services/api';
import { guessActivityFromDestination } from '../utils/activity';
import SuitcaseSelector from './SuitcaseSelector';
import SuitcaseScanner from './SuitcaseScanner';
import ItineraryCalendar from './ItineraryCalendar';
import LogisticsPreferences from './LogisticsPreferences';
import { getAllAirlines, getRegions } from '../utils/airlineBaggage';
import { useT } from '../i18n/context.jsx';

const TripForm = ({ onSubmit, isLoading, lengthUnit, toggleLengthUnit, tempUnit = 'C', toggleTempUnit }) => {
  const { t } = useT();
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
  const [dailyActivities, setDailyActivities] = useState(Array(30).fill(null));
  
  // Daily Destinations & Weather
  const [dailyDestinations, setDailyDestinations] = useState(Array(30).fill(''));
  const [formWeatherData, setFormWeatherData] = useState({});
  const [formCountries, setFormCountries] = useState({});
  const [isFetchingWeather, setIsFetchingWeather] = useState(false);

  useEffect(() => {
    const validDests = destinations.filter(d => d.trim().length > 2);
    if (validDests.length === 0) return;

    const fetchAll = async () => {
      setIsFetchingWeather(true);
      const newWeatherData = {};
      const newCountries = {};
      // Per-destination error isolation: one failed lookup shouldn't
      // discard the results of the destinations that did resolve.
      for (let dest of validDests) {
        try {
          const loc = await geocodeLocation(dest);
          const w = await fetchWeather(loc.latitude, loc.longitude, startDate, endDate);
          newWeatherData[dest] = w;
          newCountries[dest] = loc.country_code;
        } catch (e) {
          console.error(`Form weather fetch failed for "${dest}"`, e);
        }
      }
      setFormWeatherData(newWeatherData);
      setFormCountries(newCountries);
      setIsFetchingWeather(false);
    };

    const debounceId = setTimeout(fetchAll, 1000);
    
  return () => clearTimeout(debounceId);
  }, [destinations, startDate, endDate]);
  
  // Suitcase states
  const [preset, setPreset] = useState('away-carry');
  const [packingStrategy, setPackingStrategy] = useState('standard');
  const [techPorts, setTechPorts] = useState('mixed');
  const [laundryCycle, setLaundryCycle] = useState(7);
  const [length, setLength] = useState('55');
  const [width, setWidth] = useState('34.8');
  const [height, setHeight] = useState('22.8');

  // Scanner state
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannedModelName, setScannedModelName] = useState(null);
  const [airlineCode, setAirlineCode] = useState('');

  const handleScannedDimensions = (dims) => {
    setPreset(dims.preset || 'custom');
    setLength(dims.length);
    setWidth(dims.width);
    setHeight(dims.height);
    setScannedModelName(dims.model || null);
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

  const handleIcsUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      // Normalize line endings and unfold RFC 5545 folded lines
      // (continuation lines start with a space or tab)
      const text = String(event.target.result).replace(/\r\n/g, '\n').replace(/\n[ \t]/g, '');
      const lines = text.split('\n');
      
      let events = [];
      let currentEvent = null;
      
      lines.forEach(line => {
        line = line.trim();
        if (line === 'BEGIN:VEVENT') currentEvent = {};
        else if (line === 'END:VEVENT' && currentEvent) {
          events.push(currentEvent);
          currentEvent = null;
        } else if (currentEvent) {
          if (line.startsWith('DTSTART')) {
             const match = line.match(/:(\d{4})(\d{2})(\d{2})/);
             if (match) currentEvent.start = `${match[1]}-${match[2]}-${match[3]}`;
          }
          if (line.startsWith('LOCATION:')) currentEvent.location = line.replace('LOCATION:', '');
          if (line.startsWith('SUMMARY:')) currentEvent.summary = line.replace('SUMMARY:', '');
        }
      });
      
      const today = new Date().toISOString().split('T')[0];
      events = events.filter(ev => ev.start && ev.start >= today).sort((a,b) => a.start.localeCompare(b.start));
      
      if (events.length > 0) {
         setStartDate(events[0].start);
         const lastEventDate = events[events.length - 1].start;
         const endD = new Date(lastEventDate);
         endD.setDate(endD.getDate() + 1);
         setEndDate(endD.toISOString().split('T')[0]);
         
         const dests = [...new Set(events.filter(e => e.location).map(e => e.location.split(',')[0]))];
         if (dests.length > 0) {
            const paddedDests = dests.slice(0, 5);
            setDestinations(paddedDests);
         }
         
         const startD = new Date(events[0].start);
         const newDailyDest = Array(30).fill('');
         const newDailyAct = Array(30).fill('');
         
         events.forEach(ev => {
            const evDate = new Date(ev.start);
            const dayIndex = Math.max(0, Math.floor((evDate - startD) / (1000 * 60 * 60 * 24)));
            if (dayIndex < 30) {
               if (ev.location) newDailyDest[dayIndex] = ev.location.split(',')[0];
               
               const lowerSum = String(ev.summary || '').toLowerCase();
               if (lowerSum.match(/(meeting|business|conference|client)/)) newDailyAct[dayIndex] = 'business';
               else if (lowerSum.match(/(hike|trail|mountain|trek)/)) newDailyAct[dayIndex] = 'hike';
               else if (lowerSum.match(/(ski|snow|board)/)) newDailyAct[dayIndex] = 'ski';
               else if (lowerSum.match(/(dinner|formal|gala|wedding)/)) newDailyAct[dayIndex] = 'formal';
               else if (lowerSum.match(/(party|club|night out|drinks)/)) newDailyAct[dayIndex] = 'nightout';
               else if (lowerSum.match(/(beach|pool|swim)/)) newDailyAct[dayIndex] = 'beach';
               else if (lowerSum.match(/(tour|sightseeing|museum|walk)/)) newDailyAct[dayIndex] = 'sightseeing';
               else if (lowerSum.match(/(flight|train|transit|travel)/)) newDailyAct[dayIndex] = 'transit';
            }
         });
         
         setDailyDestinations(newDailyDest);
         setDailyActivities(newDailyAct);
      }
    };
    reader.readAsText(file);
    e.target.value = null;
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
        dailyActivities: dailyActivities.slice(0, duration).map((a, i) => {
          return a !== null ? a : guessActivityFromDestination(dailyDestinations[i] || destinations[0]);
        }),
        dailyDestinations: dailyDestinations.slice(0, duration),
        formWeatherData,
        destinationCountries: formCountries,
        packingStrategy,
        techPorts,
        laundryCycle,
        suitcaseVolume: (parseFloat(length) || 0) * (parseFloat(width) || 0) * (parseFloat(height) || 0) 
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="trip-form glass animate-slide-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{t('tripForm.title')}</h3>
        <label style={{ cursor: 'pointer', fontSize: '0.875rem', background: 'var(--primary-color)', color: 'white', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 'bold' }}>
          {t('tripForm.importIcs')}
          <input type="file" accept=".ics" onChange={handleIcsUpload} style={{ display: 'none' }} />
        </label>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-secondary)' }}>
            {t('tripForm.destinations')}
            {isFetchingWeather && <span style={{ marginLeft: '0.5rem', color: 'var(--accent-color)', fontWeight: 'normal' }}>{t('tripForm.fetchingWeather')}</span>}
          </label>
          {destinations.map((dest, idx) => (
            <input 
              key={idx}
              type="text" 
              placeholder={idx === 0 ? t('tripForm.destinationPlaceholder') : t('tripForm.addDestinationPlaceholder')}
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
              + {t('tripForm.addDestination')}
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="startDate" style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-secondary)' }}>{t('tripForm.startDate')}</label>
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
            <label htmlFor="endDate" style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-secondary)' }}>{t('tripForm.endDate')}</label>
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

      <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label htmlFor="travelMode" style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-secondary)' }}>{t('tripForm.travelMode')}</label>
        <select id="travelMode" value={travelMode} onChange={(e) => setTravelMode(e.target.value)}>
          <option value="flying">✈️ {t('tripForm.travelModeFlying')}</option>
          <option value="driving">🚗 {t('tripForm.travelModeDriving')}</option>
          <option value="train">🚂 {t('tripForm.travelModeTrain')}</option>
          <option value="biking">🚴 {t('tripForm.travelModeBiking')}</option>
        </select>
      </div>

      <div style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label htmlFor="airline" style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-secondary)' }}>
          {t('tripForm.airlineLabel')}
        </label>
        <select
          id="airline"
          value={airlineCode}
          onChange={(e) => setAirlineCode(e.target.value)}
        >
          <option value="">{t('tripForm.airlineNone')}</option>
          {getRegions().map(region => (
            <optgroup key={region} label={region}>
              {getAllAirlines(region).map(airline => (
                <option key={airline.code} value={airline.code}>
                  {airline.code} — {airline.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      <SuitcaseSelector 
        preset={preset} setPreset={setPreset}
        length={length} setLength={setLength}
        width={width} setWidth={setWidth}
        height={height} setHeight={setHeight}
        lengthUnit={lengthUnit} toggleLengthUnit={toggleLengthUnit}
        onOpenScanner={() => setIsScannerOpen(true)}
        scannedModel={scannedModelName}
        airlineCode={airlineCode}
      />

      <SuitcaseScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onDimensionsReady={handleScannedDimensions}
      />

      <ItineraryCalendar 
        duration={duration}
        destinations={destinations}
        startDate={startDate}
        dailyDestinations={dailyDestinations}
        setDailyDestinations={setDailyDestinations}
        dailyActivities={dailyActivities}
        setDailyActivities={setDailyActivities}
        formWeatherData={formWeatherData}
        tempUnit={tempUnit}
        toggleTempUnit={toggleTempUnit}
      />

      <LogisticsPreferences 
        gender={gender} setGender={setGender}
        palette={palette} setPalette={setPalette}
        packingStrategy={packingStrategy} setPackingStrategy={setPackingStrategy}
        laundryCycle={laundryCycle} setLaundryCycle={setLaundryCycle}
        techPorts={techPorts} setTechPorts={setTechPorts}
      />

      <button type="submit" disabled={isLoading} style={{ width: '100%', fontSize: '1.1rem', padding: '1rem' }}>
        {isLoading ? t('tripForm.optimizing') : t('tripForm.generate')}
      </button>
    </form>
  );
};

export default TripForm;
