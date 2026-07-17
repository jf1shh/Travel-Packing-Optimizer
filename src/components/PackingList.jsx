import React, { useState } from 'react';

const FOLD_TIPS = {
  ranger: {
    title: 'The Ranger Roll',
    description: 'A military technique where you fold the clothes into a tight cylinder. This minimizes wrinkles and saves a massive amount of space.',
    icon: '🪖',
    image: '/ranger_roll.png'
  },
  konmari: {
    title: 'KonMari Fold',
    description: 'Fold clothes into neat little rectangles that stand upright. This allows you to see everything in your suitcase at a glance without digging.',
    icon: '✨',
    image: '/konmari_fold.png'
  },
  bundle: {
    title: 'Bundle Packing',
    description: 'Wrap clothing around a central core (like a packing cube of underwear) to prevent sharp creases. Essential for business trips.',
    icon: '👔',
    image: '/bundle_packing.png'
  },
  shoes: {
    title: 'Shoe Stuffing',
    description: 'Your shoes contain valuable empty volume! Stuff your socks and small items inside them to reclaim that space.',
    icon: '👞',
    image: '/shoe_stuffing.png'
  }
};

const PackingList = ({ packingList, toggleItem }) => {
  const [selectedTip, setSelectedTip] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!packingList) return null;

  const categories = [
    { key: 'clothes', label: '👕 Clothes & Shoes' },
    { key: 'toiletries', label: '🧴 Toiletries' },
    { key: 'tech', label: '💻 Electronics' },
    { key: 'documents', label: '📄 Documents' },
  ];

  const handleCopy = () => {
    let textToCopy = "My Travel Packing List\n\n";
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

  return (
    <div className="packing-list animate-slide-up" style={{ animationDelay: '0.5s' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Your Optimized List</h2>
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
          {copied ? '✓ Copied!' : '📋 Copy List'}
        </button>
      </div>
      
      {categories.map((cat) => {
        const items = packingList[cat.key] || [];
        if (items.length === 0) return null;

        return (
          <div key={cat.key} className="category-card glass">
            <h3>{cat.label}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {items.map((item) => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
                        marginLeft: '1rem'
                      }}
                    >
                      {FOLD_TIPS[item.fold].icon} Fold Tip
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {selectedTip && (
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
            position: 'relative'
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
        </div>
      )}
    </div>
  );
};

export default PackingList;
