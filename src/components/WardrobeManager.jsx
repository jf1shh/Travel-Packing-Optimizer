import React, { useState } from 'react';

const WardrobeManager = ({ wardrobe, setWardrobe, isOpen, onClose }) => {
  const [newItem, setNewItem] = useState({ name: '', category: 'top', bulkiness: 'standard', material: 'cotton' });

  if (!isOpen) return null;

  const getBulkStats = (category, bulkiness) => {
    const base = {
      top: { light: { v: 200, w: 100 }, standard: { v: 400, w: 200 }, bulky: { v: 800, w: 400 } },
      bottom: { light: { v: 400, w: 200 }, standard: { v: 800, w: 400 }, bulky: { v: 1200, w: 600 } },
      outer: { light: { v: 800, w: 300 }, standard: { v: 1500, w: 800 }, bulky: { v: 3000, w: 1500 } },
      shoe: { light: { v: 1500, w: 600 }, standard: { v: 2500, w: 1000 }, bulky: { v: 3500, w: 1500 } }
    };
    const b = base[category][bulkiness];
    return { vol: b.v, weight: b.w };
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newItem.name.trim()) return;
    const stats = getBulkStats(newItem.category, newItem.bulkiness);
    
    const item = {
      id: `w-${Date.now()}`,
      name: newItem.name,
      category: newItem.category,
      bulkiness: newItem.bulkiness,
      material: newItem.material,
      vol: stats.vol,
      weight: stats.weight
    };

    setWardrobe([...wardrobe, item]);
    setNewItem({ ...newItem, name: '' });
  };

  const handleDelete = (id) => {
    setWardrobe(wardrobe.filter(i => i.id !== id));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      
      const newItems = [];
      lines.forEach(line => {
        const lower = line.toLowerCase();
        let cat = 'top';
        if (lower.match(/(pant|jean|short|skirt|trouser|legging)/)) cat = 'bottom';
        else if (lower.match(/(jacket|coat|blazer|windbreaker|shell|parka)/)) cat = 'outer';
        else if (lower.match(/(shoe|boot|sneaker|loafer|sandal|heel)/)) cat = 'shoe';

        let bulk = 'standard';
        if (lower.match(/(bulky|heavy|thick|winter|puffer)/)) bulk = 'bulky';
        else if (lower.match(/(light|thin|summer|breezy)/)) bulk = 'light';

        let mat = 'cotton';
        if (lower.match(/(linen)/)) mat = 'linen';
        else if (lower.match(/(merino|wool|cashmere)/)) mat = 'wool';
        else if (lower.match(/(denim|jean)/)) mat = 'denim';
        else if (lower.match(/(leather|suede)/)) mat = 'leather';
        else if (lower.match(/(polyester|nylon|synthetic|gore-tex|spandex)/)) mat = 'synthetic';
        else if (lower.match(/(silk|satin)/)) mat = 'silk';

        const stats = getBulkStats(cat, bulk);
        
        newItems.push({
          id: `w-${Date.now()}-${Math.random()}`,
          name: line.replace(/^[-*•\s]+/, ''), // remove bullet points
          category: cat,
          bulkiness: bulk,
          material: mat,
          vol: stats.vol,
          weight: stats.weight
        });
      });

      if (newItems.length > 0) {
        setWardrobe(prev => [...prev, ...newItems]);
      }
    };
    reader.readAsText(file);
    e.target.value = null; // reset input
  };

  return (
    <div style={{
      position: 'fixed', top: 0, right: 0, width: '100%', maxWidth: '400px', height: '100vh',
      backgroundColor: 'var(--surface-color)', boxShadow: '-4px 0 15px rgba(0,0,0,0.2)',
      zIndex: 1000, display: 'flex', flexDirection: 'column'
    }}>
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem' }}>My Digital Closet</h2>
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-primary)' }}>✕</button>
      </div>

      <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
        <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <label style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>Item Name</label>
            <input 
              type="text" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})}
              placeholder="e.g. Black Levis 501"
              style={{ width: '100%', padding: '0.75rem', marginTop: '0.25rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>Type</label>
              <select value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})} style={{ width: '100%', padding: '0.75rem', marginTop: '0.25rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)' }}>
                <option value="top">Top</option>
                <option value="bottom">Bottom</option>
                <option value="outer">Outerwear</option>
                <option value="shoe">Shoes</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>Bulkiness</label>
              <select value={newItem.bulkiness} onChange={e => setNewItem({...newItem, bulkiness: e.target.value})} style={{ width: '100%', padding: '0.75rem', marginTop: '0.25rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)' }}>
                <option value="light">Lightweight</option>
                <option value="standard">Standard</option>
                <option value="bulky">Bulky</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>Material</label>
              <select value={newItem.material} onChange={e => setNewItem({...newItem, material: e.target.value})} style={{ width: '100%', padding: '0.75rem', marginTop: '0.25rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)' }}>
                <option value="cotton">Cotton</option>
                <option value="linen">Linen</option>
                <option value="wool">Wool / Merino</option>
                <option value="denim">Denim</option>
                <option value="leather">Leather</option>
                <option value="synthetic">Synthetic</option>
                <option value="silk">Silk</option>
              </select>
            </div>
          </div>
          <button type="submit" style={{ padding: '0.75rem', borderRadius: '8px', border: 'none', background: 'var(--primary-color)', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
            Add to Closet
          </button>
        </form>

        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Your Items
          <label style={{ fontSize: '0.75rem', padding: '0.5rem 0.75rem', background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer', fontWeight: 'normal' }}>
            📁 Upload .txt
            <input type="file" accept=".txt,.md" onChange={handleFileUpload} style={{ display: 'none' }} />
          </label>
        </h3>
        {wardrobe.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>Your closet is empty. Add items above!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {wardrobe.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div>
                  <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {item.category.toUpperCase()} • {item.material} • {item.bulkiness} ({item.weight}g)
                  </div>
                </div>
                <button onClick={() => handleDelete(item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.2rem' }}>
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WardrobeManager;
