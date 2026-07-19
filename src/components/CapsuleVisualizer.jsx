import React, { useState, useEffect, useRef } from 'react';
import OutfitEditor from './OutfitEditor';
import { ACTIVITY_OPTIONS } from '../utils/activity';
import { useT } from '../i18n/context.jsx';
import { getItemImage } from '../services/db';

const OutfitItemPhoto = ({ itemName, wardrobeMap }) => {
  const [img, setImg] = useState(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    if (!wardrobeMap || !itemName) return;
    // Find the wardrobe item whose name matches the outfit piece
    const match = Object.values(wardrobeMap).find(w => w.name === itemName);
    if (match && match.id) {
      getItemImage(match.id).then(data => {
        if (data && mounted.current) setImg(data);
      });
    }
    return () => { mounted.current = false; };
  }, [itemName, wardrobeMap]);

  if (!img) return null;
  return (
    <img
      src={img}
      alt={itemName}
      style={{
        width: 44, height: 44, objectFit: 'contain',
        borderRadius: 6, border: '1px solid var(--border-color)',
        background: 'rgba(255,255,255,0.05)', flexShrink: 0,
      }}
    />
  );
};

const CapsuleVisualizer = ({ outfits, setOutfits, wardrobe, palette, onActivityChange, startDate, wardrobeMap }) => {
  const { t } = useT();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [editingDayIndex, setEditingDayIndex] = useState(null);

  const handleSaveOutfit = (editedOutfit) => {
    setOutfits(prev => {
      const newOutfits = [...prev];
      newOutfits[editingDayIndex] = editedOutfit;
      return newOutfits;
    });
    setEditingDayIndex(null);
  };

  const handleExportICS = () => {
    if (!startDate) return;
    let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Travel Packing Optimizer//NONSGML v1.0//EN\n";
    
    outfits.forEach((o, index) => {
       const evDate = new Date(startDate);
       evDate.setDate(evDate.getDate() + index);
       
       const dtStart = evDate.toISOString().replace(/[-:]/g, '').split('T')[0];
       const evEnd = new Date(evDate);
       evEnd.setDate(evEnd.getDate() + 1);
       const dtEnd = evEnd.toISOString().replace(/[-:]/g, '').split('T')[0];
       
       const actStr = o.activity ? o.activity.charAt(0).toUpperCase() + o.activity.slice(1) : 'Trip Day';
       const summary = `${actStr} (${o.weather}, ${o.temp}°)`;
       
       const description = `Outfit:\nTop: ${o.top}\nBottom: ${o.bottom}\nShoes: ${o.shoe}${o.outer ? '\nOuter: ' + o.outer : ''}`;
       
       icsContent += "BEGIN:VEVENT\n";
       icsContent += `DTSTART;VALUE=DATE:${dtStart}\n`;
       icsContent += `DTEND;VALUE=DATE:${dtEnd}\n`;
       icsContent += `SUMMARY:${summary}\n`;
       icsContent += `DESCRIPTION:${description.replace(/\n/g, '\\n')}\n`;
       icsContent += "END:VEVENT\n";
    });
    
    icsContent += "END:VCALENDAR";
    
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', 'travel-itinerary.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!outfits || outfits.length === 0) return null;

  const outfit = outfits[currentIndex];
  
  const paletteColors = {
    'quiet-luxury': { main: '#d4af37', sec: '#f5deb3' },
    'gorpcore': { main: '#f97316', sec: '#475569' },
    'scandi': { main: '#e2e8f0', sec: '#94a3b8' },
    'streetwear': { main: '#8b5cf6', sec: '#22c55e' },
    'dark-academia': { main: '#78350f', sec: '#9f1239' },
    'athleisure': { main: '#06b6d4', sec: '#171717' },
    'bohemian': { main: '#d97706', sec: '#9a3412' },
    'preppy': { main: '#1e3a8a', sec: '#b8860b' },
    'rock': { main: '#dc2626', sec: '#0a0a0a' },
    'whimsigoth': { main: '#6b21a8', sec: '#0a0a0a' },
    'coastal': { main: '#1e3a8a', sec: '#d4b886' },
    'cottagecore': { main: '#4d7c0f', sec: '#a0522d' }
  };
  
  const color = paletteColors[palette] || paletteColors['quiet-luxury'];

  const getItemColor = (itemName, fallbackColor) => {
    if (!itemName) return fallbackColor;
    const lower = String(itemName).toLowerCase();
    
    if (lower.includes('cashmere') || lower.includes('silk') || lower.includes('polo')) return '#d4af37';
    if (lower.includes('gore-tex') || lower.includes("arc'teryx") || lower.includes('technical')) return '#f97316';
    if (lower.includes('denim') || lower.includes('knit') || lower.includes('raw')) return '#64748b';
    if (lower.includes('vintage') || lower.includes('mesh') || lower.includes('parachute')) return '#8b5cf6';
    if (lower.includes('leather') || lower.includes('black')) return '#171717';
    if (lower.includes('tweed') || lower.includes('corduroy') || lower.includes('plaid')) return '#78350f';
    if (lower.includes('performance') || lower.includes('athletic') || lower.includes('running')) return '#06b6d4';
    if (lower.includes('linen') || lower.includes('crochet') || lower.includes('flowy') || lower.includes('peasant')) return '#d97706';

    if (lower.includes('olive')) return '#4d7c0f'; 
    if (lower.includes('beige') || lower.includes('tan') || lower.includes('khaki')) return '#d4b886'; 
    if (lower.includes('brown')) return '#78350f';
    if (lower.includes('navy')) return '#1e3a8a';
    if (lower.includes('charcoal')) return '#171717';
    if (lower.includes('grey') || lower.includes('gray')) return '#94a3b8';
    if (lower.includes('white') || lower.includes('cream')) return '#e2e8f0'; 
    return fallbackColor;
  };

  const nextOutfit = () => setCurrentIndex((prev) => (prev + 1) % outfits.length);
  const prevOutfit = () => setCurrentIndex((prev) => (prev - 1 + outfits.length) % outfits.length);

  const handleActivitySelect = (e) => {
    if (onActivityChange) {
      onActivityChange(currentIndex, e.target.value);
    }
  };

  return (
    <div className="glass animate-slide-up" style={{ padding: '1.5rem', marginBottom: '1.5rem', animationDelay: '0.4s' }}>
      {editingDayIndex !== null && (
        <OutfitEditor 
          dayOutfit={outfits[editingDayIndex]} 
          wardrobe={wardrobe} 
          onSave={handleSaveOutfit} 
          onCancel={() => setEditingDayIndex(null)} 
        />
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.25rem', margin: 0 }}>{t('capsule.title')}</h3>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {startDate && (
            <button onClick={handleExportICS} style={{ background: 'transparent', border: '1px solid var(--accent-color)', color: 'var(--accent-color)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}>
              📅 {t('capsule.exportIcs')}
            </button>
          )}
          <button onClick={() => setEditingDayIndex(currentIndex)} style={{ background: 'transparent', border: '1px solid var(--accent-color)', color: 'var(--accent-color)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}>              ✏️ {t('capsule.edit')}
          </button>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            {currentIndex + 1} {t('capsule.ofCount').split('{n}')[0]}{outfits.length}{t('capsule.ofCount').split('{total}')[1] || ''}
          </span>
        </div>
      </div>

      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '1.5rem',
        backgroundColor: 'var(--surface-color)',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: '-50%', left: '-20%', width: '150%', height: '200%', background: `linear-gradient(135deg, ${color.main}11, ${color.sec}11)`, zIndex: 0, transform: 'rotate(-10deg)' }} />

        <button onClick={prevOutfit} style={{ zIndex: 1, padding: '0.5rem 1rem' }}>◀</button>
        
        <div style={{ zIndex: 1, textAlign: 'center', flex: 1 }}>
          <h4 style={{ color: color.main, marginBottom: '0.25rem', fontSize: '1.2rem', fontWeight: 'bold' }}>{outfit.name}</h4>
          
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem', fontWeight: '500' }}>
            {outfit.temp !== undefined ? `${Math.round(outfit.temp)}° • ${outfit.weather}` : ''}
            
            {outfit.isLaundryDay && (
              <div style={{ marginTop: '0.5rem', display: 'inline-block', background: 'var(--accent-color)', color: '#fff', padding: '0.2rem 0.5rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                👕 {t('capsule.laundryDay')}
              </div>
            )}
            
            <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
              <span>{t('capsule.activity')}:</span>
              <select
                onChange={handleActivitySelect}
                value={outfit.activity || ''}
                style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', background: 'var(--surface-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', fontSize: '0.75rem', outline: 'none' }}
              >
                {/* Same option set as the itinerary calendar pills -- this
                    dropdown previously omitted sightseeing and transit */}
                {ACTIVITY_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
            {outfit.outer && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', border: `2px solid ${getItemColor(outfit.outer, color.main)}`, borderRadius: '8px', fontSize: '0.875rem', width: 'fit-content' }}>
                <OutfitItemPhoto itemName={outfit.outer} wardrobeMap={wardrobeMap} />
                <span>{outfit.outer}</span>
              </div>
            )}
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', border: `2px solid ${getItemColor(outfit.top, color.sec)}`, borderRadius: '8px', fontSize: '0.875rem', width: 'fit-content' }}>
              <OutfitItemPhoto itemName={outfit.top} wardrobeMap={wardrobeMap} />
              <span>{outfit.top}</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', border: `2px solid ${getItemColor(outfit.bottom, color.main)}`, borderRadius: '8px', fontSize: '0.875rem', width: 'fit-content' }}>
              <OutfitItemPhoto itemName={outfit.bottom} wardrobeMap={wardrobeMap} />
              <span>{outfit.bottom}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0.75rem', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
              <OutfitItemPhoto itemName={outfit.shoe} wardrobeMap={wardrobeMap} />
              + {outfit.shoe}
            </div>
          </div>
        </div>

        <button onClick={nextOutfit} style={{ zIndex: 1, padding: '0.5rem 1rem' }}>▶</button>
      </div>
    </div>
  );
};

export default CapsuleVisualizer;
