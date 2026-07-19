import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useT } from '../i18n/context.jsx';

const FOLD_TIPS = {
  ranger: {
    title: 'The Ranger Roll',
    description: 'A military technique where you fold the clothes into a tight cylinder. This minimizes wrinkles and saves a massive amount of space.',
    icon: '🪖',
    image: import.meta.env.BASE_URL + 'ranger_roll.png'
  },
  konmari: {
    title: 'KonMari Fold',
    description: 'Fold clothes into neat little rectangles that stand upright. This allows you to see everything in your suitcase at a glance without digging.',
    icon: '✨',
    image: import.meta.env.BASE_URL + 'konmari_fold.png'
  },
  bundle: {
    title: 'Bundle Packing',
    description: 'Wrap clothing around a central core (like a packing cube of underwear) to prevent sharp creases. Essential for business trips.',
    icon: '👔',
    image: import.meta.env.BASE_URL + 'bundle_packing.png'
  },
  shoes: {
    title: 'Shoe Stuffing',
    description: 'Your shoes contain valuable empty volume! Stuff your socks and small items inside them to reclaim that space.',
    icon: '👞',
    image: import.meta.env.BASE_URL + 'shoe_stuffing.png'
  }
};

const PackingList = ({ packingList, toggleItem, handleRemoveItem, handleAddItem }) => {
  const { t } = useT();
  const [selectedTip, setSelectedTip] = useState(null);
  const [copied, setCopied] = useState(false);
  
  // Custom Add State
  const [addingCategory, setAddingCategory] = useState(null);
  const [newItemName, setNewItemName] = useState('');
  const [newItemWeight, setNewItemWeight] = useState('');

  if (!packingList) return null;

  const categories = [
    { key: 'plane', label: '✈️ ' + t('packingList.categoryPlane') },
    { key: 'main', label: '👕 ' + t('packingList.categoryMain') },
    { key: 'base', label: '🧦 ' + t('packingList.categoryBase') },
    { key: 'loose', label: '🧥 ' + t('packingList.categoryLoose') },
    { key: 'liquid', label: '🪥 ' + t('packingList.categoryLiquid') },
    { key: 'dry', label: '🧴 ' + t('packingList.categoryDry') },
    { key: 'tech', label: '🔌 ' + t('packingList.categoryTech') },
  ];

  const handleCopy = () => {
    let textToCopy = t('packingList.clipboardTitle') + "\n\n";
    categories.forEach(cat => {
      const items = packingList[cat.key];
      if (items && items.length > 0) {
        textToCopy += `${cat.label}\n`;
        items.forEach(item => {
          textToCopy += `- [${item.checked ? 'x' : ' '}] ${item.name}\n`;
        });
        textToCopy += '\n';
      }
    });
    
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const submitAddItem = (category) => {
    if (!newItemName.trim()) return;
    handleAddItem(category, newItemName, newItemWeight);
    setNewItemName('');
    setNewItemWeight('');
    setAddingCategory(null);
  };

  const liquidVolume = packingList && packingList.liquid ? packingList.liquid.reduce((sum, item) => sum + (item.vol || 0), 0) : 0;
  // Standard carry-on is around 40-50L. Let's say if volume < 60000, it's a carry-on.
  const totalSuitcaseVol = packingList ? Object.values(packingList).flat().filter(i => i.category !== 'plane').reduce((s, i) => s + (i.vol || 0), 0) : 0;
  const isCarryOn = totalSuitcaseVol < 60000;
  const showTSAAlert = isCarryOn && liquidVolume > 1000;

  // Packing progress: count checked vs total items (excluding 'plane' — worn items)
  const allPackable = packingList
    ? Object.entries(packingList).filter(([key]) => key !== 'plane').flatMap(([, items]) => items)
    : [];
  const totalItems = allPackable.length;
  const checkedItems = allPackable.filter(i => i.checked).length;
  const progressPercent = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;
  const isFullyPacked = totalItems > 0 && checkedItems === totalItems;

  return (
    <div className="packing-list animate-slide-up" style={{ animationDelay: '0.5s' }}>
      {showTSAAlert && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.5rem' }}>⚠️</span>
          <div>
            <strong>{t('packingList.tsaAlert').split(':')[0]}:</strong> {t('packingList.tsaAlert').split(': ').slice(1).join(': ').replace('{volume}', Math.round(liquidVolume))}
          </div>
        </div>
      )}

      {/* ── Packing progress bar ────────────────────────────────────────── */}
      {totalItems > 0 && (
        <div className="glass" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {isFullyPacked ? '🎉 ' + t('packingList.allPacked') : t('packingList.progress')}
            </span>
            <span style={{ fontSize: '0.8rem', fontWeight: 500, color: isFullyPacked ? '#22c55e' : 'var(--text-secondary)' }}>
              {checkedItems}/{totalItems} {t('packingList.items')} {isFullyPacked ? '✓' : ''}
            </span>
          </div>
          <div style={{
            width: '100%',
            height: 8,
            backgroundColor: 'rgba(255,255,255,0.08)',
            borderRadius: 999,
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${progressPercent}%`,
              height: '100%',
              borderRadius: 999,
              background: isFullyPacked
                ? 'linear-gradient(135deg, #22c55e, #10b981)'
                : 'var(--accent-gradient)',
              transition: 'width 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
            }} />
          </div>
        </div>
      )}
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{t('packingList.title')}</h2>
        <button 
          onClick={handleCopy}
          style={{
            background: 'var(--surface-color)',
            color: copied ? '#10b981' : 'var(--text-primary)',
            border: `1px solid ${copied ? '#10b981' : 'var(--border-color)'}`,
            padding: '0.5rem 1rem',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          {copied ? '✓ ' + t('packingList.copied') : '📋 ' + t('packingList.copy')}
        </button>
      </div>
      
      {categories.map((cat) => {
        const items = packingList[cat.key] || [];
        // Even if items is empty, we show the category so they can add items!
        
        return (
          <div key={cat.key} className="category-card glass">
            <h3>{cat.label}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {items.map((item) => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                  <label 
                    className={`checkbox-wrapper ${item.checked ? 'checked' : ''}`}
                    style={{ flex: 1, marginBottom: 0, padding: '0.5rem' }}
                  >
                    <input 
                      type="checkbox" 
                      checked={item.checked} 
                      onChange={() => toggleItem(cat.key, item.id)}
                    />
                    <span className="checkbox-label">{item.name}</span>
                  </label>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {item.fold && FOLD_TIPS[item.fold] && (
                      <button 
                        onClick={() => setSelectedTip(FOLD_TIPS[item.fold])}
                        style={{ 
                          background: 'transparent', 
                          border: '1px solid var(--accent-color)', 
                          color: 'var(--accent-color)',
                          padding: '0.25rem 0.5rem',
                          fontSize: '0.75rem',
                          borderRadius: '999px',
                          boxShadow: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                        }}
                      >
                        {FOLD_TIPS[item.fold].icon} {t('packingList.foldTip')}
                      </button>
                    )}
                    <button 
                      onClick={() => handleRemoveItem(cat.key, item.id)}
                      style={{ background: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer', padding: '0.25rem', fontSize: '1rem', boxShadow: 'none' }}
                      title={t('packingList.removeItem')}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
              
              {/* Add Custom Item UI */}
              <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem' }}>
                {addingCategory === cat.key ? (
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <input 
                      type="text" 
                      placeholder={t('packingList.itemNamePlaceholder')} 
                      value={newItemName}
                      onChange={e => setNewItemName(e.target.value)}
                      style={{ flex: 2, padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)', minWidth: '150px' }}
                    />
                    <input 
                      type="number" 
                      placeholder={t('packingList.weightPlaceholder')} 
                      value={newItemWeight}
                      onChange={e => setNewItemWeight(e.target.value)}
                      style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)', minWidth: '80px' }}
                    />
                    <button onClick={() => submitAddItem(cat.key)} style={{ padding: '0.5rem 1rem', background: 'var(--accent-color)', color: '#fff', borderRadius: '4px', border: 'none' }}>{t('packingList.add')}</button>
                    <button onClick={() => setAddingCategory(null)} style={{ padding: '0.5rem 1rem', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '4px' }}>{t('packingList.cancel')}</button>
                  </div>
                ) : (
                  <button 
                    onClick={() => { setAddingCategory(cat.key); setNewItemName(''); setNewItemWeight(''); }}
                    style={{ background: 'transparent', border: '1px dashed var(--accent-color)', color: 'var(--accent-color)', width: '100%', padding: '0.75rem', borderRadius: '8px', boxShadow: 'none', fontWeight: 'bold' }}
                  >
                    + {t('packingList.addCustom')}
                  </button>
                )}
              </div>

            </div>
          </div>
        );
      })}

      {selectedTip && createPortal(
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1.5rem'
        }}>
          <div className="glass" style={{
            backgroundColor: 'var(--surface-color)',
            padding: '2rem',
            maxWidth: '400px',
            width: '100%',
            position: 'relative',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <button 
              onClick={() => setSelectedTip(null)}
              style={{
                position: 'absolute',
                top: '1rem', right: '1rem',
                background: 'transparent',
                color: 'var(--text-secondary)',
                boxShadow: 'none',
                padding: '0.5rem'
              }}
            >
              ✕
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <span style={{ fontSize: '2rem' }}>{selectedTip.icon}</span>
              <h3 style={{ margin: 0 }}>{selectedTip.title}</h3>
            </div>
            
            {selectedTip.image && (
              <div style={{ width: '100%', marginBottom: '1rem', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                <img src={selectedTip.image} alt={selectedTip.title} style={{ width: '100%', height: 'auto', display: 'block' }} />
              </div>
            )}
            
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{selectedTip.description}</p>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default PackingList;
