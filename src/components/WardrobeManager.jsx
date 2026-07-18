import React, { useState, useEffect } from 'react';
import { saveItemImage, getItemImage, deleteItemImage } from '../services/db';
import { parseBulkText } from '../utils/parser';


const WardrobeManager = ({ wardrobe, setWardrobe, isOpen, onClose }) => {
  const [newItem, setNewItem] = useState({ name: '', category: 'top', bulkiness: 'standard', material: 'cotton' });
  const [bulkText, setBulkText] = useState('');
  const [itemImages, setItemImages] = useState({});
  const [isProcessing, setIsProcessing] = useState({});

  useEffect(() => {
    const loadImages = async () => {
      const images = {};
      for (const item of wardrobe) {
        const img = await getItemImage(item.id);
        if (img) images[item.id] = img;
      }
      setItemImages(images);
    };
    if (isOpen) loadImages();
  }, [wardrobe, isOpen]);

  const handleImageUpload = async (itemId, e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsProcessing(p => ({ ...p, [itemId]: true }));

    try {
      const { removeBackground } = await import('@imgly/background-removal');
      const blobURL = URL.createObjectURL(file);
      const imageBlob = await removeBackground(blobURL);
      
      const reader = new FileReader();
      reader.readAsDataURL(imageBlob);
      reader.onloadend = async () => {
        const base64data = reader.result;
        await saveItemImage(itemId, base64data);
        setItemImages(p => ({ ...p, [itemId]: base64data }));
        setIsProcessing(p => ({ ...p, [itemId]: false }));
      };
    } catch (err) {
      console.error("BG Removal failed", err);
      setIsProcessing(p => ({ ...p, [itemId]: false }));
    }
  };

  const handleCameraAdd = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Create a new item instantly
    const newId = `w-${Date.now()}-${Math.random()}`;
    const newItemObj = {
      id: newId,
      name: 'Captured Item',
      category: 'top',
      bulkiness: 'standard',
      material: 'cotton',
      color: 'black',
      vol: 400,
      weight: 200
    };
    
    setWardrobe(prev => [newItemObj, ...prev]);
    
    // Process the image
    setIsProcessing(prev => ({ ...prev, [newId]: true }));
    try {
      const { removeBackground } = await import('@imgly/background-removal');
      const blobURL = URL.createObjectURL(file);
      const imageBlob = await removeBackground(blobURL);
      
      const reader = new FileReader();
      reader.readAsDataURL(imageBlob);
      reader.onloadend = async () => {
        const base64data = reader.result;
        await saveItemImage(newId, base64data);
        setItemImages(p => ({ ...p, [newId]: base64data }));
        setIsProcessing(p => ({ ...p, [newId]: false }));
      };
    } catch (err) {
      console.error('BG removal failed on camera add:', err);
      setIsProcessing(p => ({ ...p, [newId]: false }));
    }
  };


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

  const handleBulkUpload = () => {
    if (!bulkText.trim()) return;
    const newItems = parseBulkText(bulkText);
    if (newItems.length > 0) {
      setWardrobe(prev => [...prev, ...newItems]);
      setBulkText(''); // clear on success
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, right: 0, width: '100%', maxWidth: '400px', height: '100vh',
      backgroundColor: 'var(--bg-color)', boxShadow: '-4px 0 15px rgba(0,0,0,0.5)',
      zIndex: 1000, display: 'flex', flexDirection: 'column'
    }}>
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem' }}>My Digital Closet</h2>
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-primary)' }}>✕</button>
      </div>

      <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
           <div style={{ flex: 1 }}>
             <label style={{ display: 'block', padding: '1rem', textAlign: 'center', background: 'var(--accent-color)', color: 'white', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' }}>
               📸 Quick Add via Camera
               <input type="file" accept="image/*" capture="environment" onChange={handleCameraAdd} style={{ display: 'none' }} />
             </label>
           </div>
        </div>

        <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <div>
            <label style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>Add Single Item</label>
            <input 
              type="text" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})}
              placeholder="e.g. Black Levis 501"
              style={{ width: '100%', padding: '0.75rem', marginTop: '0.25rem' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <select value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})} style={{ width: '100%', padding: '0.5rem', fontSize: '0.75rem' }}>
                <option value="top">Top</option>
                <option value="bottom">Bottom</option>
                <option value="outer">Outerwear</option>
                <option value="shoe">Shoes</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <select value={newItem.bulkiness} onChange={e => setNewItem({...newItem, bulkiness: e.target.value})} style={{ width: '100%', padding: '0.5rem', fontSize: '0.75rem' }}>
                <option value="light">Light</option>
                <option value="standard">Standard</option>
                <option value="bulky">Bulky</option>
              </select>
            </div>
          </div>
          <button type="submit" style={{ padding: '0.75rem', borderRadius: '8px' }}>
            + Add to Closet
          </button>
        </form>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'var(--accent-color)' }}>✨ AI Brain Dump (Bulk Add)</label>
          <textarea 
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            placeholder="Paste your packing list here! e.g., '3 pairs of blue jeans, 5 black cotton shirts, 1 heavy wool jacket...'"
            style={{ 
              width: '100%', minHeight: '100px', padding: '0.75rem', borderRadius: '12px', 
              border: '1px solid var(--border-color)', background: 'var(--bg-color)', 
              color: 'var(--text-primary)', fontFamily: 'inherit', resize: 'vertical'
            }}
          />
          <button type="button" onClick={handleBulkUpload} style={{ padding: '0.75rem', borderRadius: '8px' }}>
            Parse & Add Items
          </button>
        </div>

        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
          Your Items
        </h3>
        {wardrobe.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>Your closet is empty. Add items above!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {wardrobe.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '8px', background: 'var(--bg-secondary)', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', position: 'relative' }}>
                    {itemImages[item.id] ? (
                       <img src={itemImages[item.id]} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    ) : isProcessing[item.id] ? (
                       <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>AI...</span>
                    ) : (
                       <label style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                         <span style={{ fontSize: '1.2rem' }}>📷</span>
                         <input type="file" accept="image/*" capture="environment" onChange={(e) => handleImageUpload(item.id, e)} style={{ display: 'none' }} />
                       </label>
                    )}
                  </div>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {item.category.toUpperCase()} • {item.material} • {item.bulkiness} ({item.weight}g)
                    </div>
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
