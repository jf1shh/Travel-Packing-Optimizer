import React from 'react';
import { checkBaggageCompliance } from '../utils/airlineBaggage';
import { useT } from '../i18n/context.jsx';

const SuitcaseSelector = ({ 
  preset, setPreset, 
  length, setLength, 
  width, setWidth, 
  height, setHeight, 
  lengthUnit, toggleLengthUnit,
  onOpenScanner,
  scannedModel,
  airlineCode
}) => {
  const { t } = useT();

  // ── Airline baggage compliance check ──────────────────────────────────
  const compliance = airlineCode
    ? checkBaggageCompliance(
        { l: parseFloat(length) || 0, w: parseFloat(width) || 0, h: parseFloat(height) || 0 },
        airlineCode
      )
    : null;

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
        <label style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-secondary)', display: 'block', margin: 0 }}>{t('suitcase.title')}</label>
        <button 
          type="button" 
          className="theme-toggle" 
          onClick={toggleLengthUnit} 
          style={{ fontSize: '0.875rem', fontWeight: 'bold' }}
        >
          {lengthUnit}
        </button>
      </div>

      {/* ── Airline carry-on compliance warning ────────────────────────── */}
      {compliance && !compliance.compliant && (
        <div style={{
          marginBottom: '0.75rem',
          padding: '0.75rem 1rem',
          borderRadius: '10px',
          backgroundColor: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          fontSize: '0.8rem',
          color: '#ef4444',
        }}>              <div style={{ fontWeight: 600, marginBottom: '0.35rem' }}>
                ⚠️ {t('suitcase.exceedsLimits').replace('{airline}', compliance.airline.name)}
              </div>
          {compliance.warnings.map((w, i) => (
            <div key={i} style={{ opacity: 0.85 }}>{w}</div>
          ))}
          {!compliance.airline.carryOnInBasic && (              <div style={{ marginTop: '0.35rem', opacity: 0.7, fontStyle: 'italic' }}>
                {t('suitcase.carryOnExtraNote').replace('{airline}', compliance.airline.name)}
              </div>
          )}
        </div>
      )}
      {compliance && compliance.compliant && (
        <div style={{
          marginBottom: '0.75rem',
          padding: '0.5rem 1rem',
          borderRadius: '10px',
          backgroundColor: 'rgba(34, 197, 94, 0.08)',
          border: '1px solid rgba(34, 197, 94, 0.2)',
          fontSize: '0.8rem',
          color: '#22c55e',
          fontWeight: 500,
        }}>
          ✅ {t('suitcase.fitsLimits').replace('{airline}', compliance.airline.name).replace('{dims}', compliance.airline.carryOn.l + '×' + compliance.airline.carryOn.w + '×' + compliance.airline.carryOn.h)}
        </div>
      )}

      {onOpenScanner && (
        <button
          type="button"
          onClick={onOpenScanner}
          style={{
            width: '100%',
            marginBottom: '0.75rem',
            padding: '0.75rem 1rem',
            fontSize: '0.9rem',
            fontWeight: 600,
            borderRadius: '10px',
            border: scannedModel ? '2px solid #22c55e' : '2px dashed var(--accent-color)',
            backgroundColor: scannedModel ? 'rgba(34,197,94,0.08)' : 'transparent',
            color: scannedModel ? '#22c55e' : 'var(--accent-color)',
            cursor: 'pointer',
            boxShadow: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = scannedModel ? 'rgba(34,197,94,0.12)' : 'rgba(59, 130, 246, 0.08)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = scannedModel ? 'rgba(34,197,94,0.08)' : 'transparent';
          }}
        >
          <span style={{ fontSize: '1.2rem' }}>{scannedModel ? '✅' : '📸'}</span>
          {scannedModel ? `Identified: ${scannedModel}` : t('suitcase.scanButton')}
        </button>
      )}

      <select value={preset} onChange={handlePresetChange} style={{ marginBottom: '1rem' }}>
        <option value="away-carry">Away: The Carry-On {lengthUnit === 'in' ? '(21.7 x 13.7 x 9.0)' : '(55 x 34.8 x 22.8)'}</option>
        <option value="monos-carry">Monos: Carry-On {lengthUnit === 'in' ? '(22 x 14 x 9)' : '(55.9 x 35.6 x 22.9)'}</option>
        <option value="beis-roller">BÉIS: Carry-On Roller {lengthUnit === 'in' ? '(22.8 x 15.7 x 10)' : '(58 x 40 x 25.4)'}</option>
        <option value="travelpro-21">Travelpro: Platinum Elite 21" {lengthUnit === 'in' ? '(23.5 x 14.5 x 9)' : '(59.7 x 36.8 x 22.9)'}</option>
        <option value="rimowa-cabin">Rimowa: Cabin {lengthUnit === 'in' ? '(21.7 x 15.7 x 9.1)' : '(55 x 40 x 23)'}</option>
        <option value="osprey-40">Osprey: Farpoint 40L Backpack {lengthUnit === 'in' ? '(21.7 x 13.8 x 9.1)' : '(55 x 35 x 23)'}</option>
        <option value="peak-45">Peak Design: Travel Backpack 45L {lengthUnit === 'in' ? '(22 x 13 x 9.5)' : '(56 x 33 x 24)'}</option>
        <option value="samsonite-check">Samsonite: Check-In Large {lengthUnit === 'in' ? '(29.5 x 20.1 x 12.2)' : '(75 x 51 x 31)'}</option>          <option value="custom">{t('suitcase.custom')}</option>
      </select>
      
      <div style={{ display: 'flex', gap: '0.5rem', width: '100%', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t('suitcase.length')}</span>
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
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t('suitcase.width')}</span>
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
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t('suitcase.height')}</span>
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
