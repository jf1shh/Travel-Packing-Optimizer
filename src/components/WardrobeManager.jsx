import React, { useState, useEffect } from 'react';
import { saveItemImage, getItemImage, deleteItemImage } from '../services/db';
import { parseBulkText } from '../utils/parser';
import { getBulkStats } from '../utils/itemStats';
import { PromptDialog } from './Dialogs';
import { useT } from '../i18n/context.jsx';


const WARDROBE_COLORS = ['black', 'navy', 'khaki', 'beige', 'white', 'grey', 'olive', 'brown', 'blue', 'red', 'green', 'yellow', 'pink', 'purple'];
const WARDROBE_MATERIALS = ['cotton', 'linen', 'wool', 'denim', 'leather', 'synthetic', 'silk'];

const WardrobeManager = ({ wardrobe, setWardrobe, isOpen, onClose }) => {
  const { t } = useT();
  const [newItem, setNewItem] = useState({ name: '', category: 'top', bulkiness: 'standard', material: 'cotton', color: 'black', time: 'day' });
  // Color/material/evening auto-derive from the typed name until the user
  // explicitly picks one -- then their choice wins.
  const [touched, setTouched] = useState({ color: false, material: false, time: false });
  const [bulkText, setBulkText] = useState('');
  const [itemImages, setItemImages] = useState({});
  const [isProcessing, setIsProcessing] = useState({});
  const [processingProgress, setProcessingProgress] = useState({}); // { [itemId]: percent|null }
  const [pendingCameraFile, setPendingCameraFile] = useState(null); // File awaiting a description

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    const loadImages = async () => {
      const entries = await Promise.all(
        wardrobe.map(async item => [item.id, await getItemImage(item.id)])
      );
      if (!cancelled) {
        setItemImages(Object.fromEntries(entries.filter(([, img]) => img)));
      }
    };
    loadImages();
    return () => { cancelled = true; };
  }, [wardrobe, isOpen]);

  // Reports live download/inference progress from the ONNX background-removal
  // model instead of leaving the UI on a static "AI..." label -- the model
  // itself is a ~24MB one-time download, so first use can take a while.
  const trackProgress = (itemId) => (key, current, total) => {
    setProcessingProgress(p => ({ ...p, [itemId]: total > 0 ? Math.round((current / total) * 100) : null }));
  };

  const clearProgress = (itemId) => {
    setProcessingProgress(p => {
      const next = { ...p };
      delete next[itemId];
      return next;
    });
  };

  const handleImageUpload = async (itemId, e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsProcessing(p => ({ ...p, [itemId]: true }));

    try {
      const { removeBackground } = await import('@imgly/background-removal');
      const blobURL = URL.createObjectURL(file);
      const imageBlob = await removeBackground(blobURL, { progress: trackProgress(itemId) });

      const reader = new FileReader();
      reader.readAsDataURL(imageBlob);
      reader.onloadend = async () => {
        const base64data = reader.result;
        await saveItemImage(itemId, base64data);
        setItemImages(p => ({ ...p, [itemId]: base64data }));
        setIsProcessing(p => ({ ...p, [itemId]: false }));
        clearProgress(itemId);
      };
    } catch (err) {
      console.error("BG Removal failed", err);
      setIsProcessing(p => ({ ...p, [itemId]: false }));
      clearProgress(itemId);
    }
  };

  const handleCameraAdd = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Ask for a quick description via an in-app dialog (see PromptDialog
    // render below) instead of a blocking window.prompt(); the file is
    // already captured, so both Submit and Skip proceed with processing it.
    setPendingCameraFile(file);
    e.target.value = null;
  };

  const processCameraCapture = async (file, description) => {
    // Reuse the brain-dump parser's heuristics for category/material/
    // color/bulkiness -- otherwise every capture lands as an identical
    // "Captured Item" top.
    const parsed = description && description.trim()
      ? parseBulkText(description)[0]
      : null;

    // Create a new item instantly
    const newId = `w-${Date.now()}-${Math.random()}`;
    const newItemObj = parsed
      ? { ...parsed, id: newId }
      : {
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
      const imageBlob = await removeBackground(blobURL, { progress: trackProgress(newId) });

      const reader = new FileReader();
      reader.readAsDataURL(imageBlob);
      reader.onloadend = async () => {
        const base64data = reader.result;
        await saveItemImage(newId, base64data);
        setItemImages(p => ({ ...p, [newId]: base64data }));
        setIsProcessing(p => ({ ...p, [newId]: false }));
        clearProgress(newId);
      };
    } catch (err) {
      console.error('BG removal failed on camera add:', err);
      setIsProcessing(p => ({ ...p, [newId]: false }));
      clearProgress(newId);
    }
  };

  const handleCameraPromptSubmit = (description) => {
    const file = pendingCameraFile;
    setPendingCameraFile(null);
    if (file) processCameraCapture(file, description);
  };

  const handleCameraPromptSkip = () => {
    const file = pendingCameraFile;
    setPendingCameraFile(null);
    if (file) processCameraCapture(file, '');
  };


  if (!isOpen) return null;

  const handleNameChange = (name) => {
    setNewItem(prev => {
      const next = { ...prev, name };
      const parsed = name.trim() ? parseBulkText(name)[0] : null;
      if (parsed) {
        if (!touched.color) next.color = parsed.color;
        if (!touched.material) next.material = parsed.material;
        if (!touched.time) next.time = parsed.time;
      }
      return next;
    });
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
      color: newItem.color,
      time: newItem.time,
      vol: stats.vol,
      weight: stats.weight
    };

    setWardrobe([...wardrobe, item]);
    setNewItem({ ...newItem, name: '' });
  };

  const handleDelete = (id) => {
    setWardrobe(wardrobe.filter(i => i.id !== id));
    deleteItemImage(id);
    setItemImages(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
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
        <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{t('wardrobe.title')}</h2>
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-primary)' }}>✕</button>
      </div>

      <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
           <div style={{ flex: 1 }}>
             <label style={{ display: 'block', padding: '1rem', textAlign: 'center', background: 'var(--accent-color)', color: 'white', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' }}>
               📸 {t('wardrobe.quickAdd')}
               <input type="file" accept="image/*" capture="environment" onChange={handleCameraAdd} style={{ display: 'none' }} />
             </label>
           </div>
        </div>

        <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <div>
            <label style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>{t('wardrobe.addSingle')}</label>
            <input
              type="text" value={newItem.name} onChange={e => handleNameChange(e.target.value)}
              placeholder={t('wardrobe.namePlaceholder')}
              style={{ width: '100%', padding: '0.75rem', marginTop: '0.25rem' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <select value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})} style={{ width: '100%', padding: '0.5rem', fontSize: '0.75rem' }}>
                <option value="top">{t('wardrobe.categoryTop')}</option>
                <option value="bottom">{t('wardrobe.categoryBottom')}</option>
                <option value="outer">{t('wardrobe.categoryOuter')}</option>
                <option value="shoe">{t('wardrobe.categoryShoe')}</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <select value={newItem.bulkiness} onChange={e => setNewItem({...newItem, bulkiness: e.target.value})} style={{ width: '100%', padding: '0.5rem', fontSize: '0.75rem' }}>
                <option value="light">{t('wardrobe.bulkinessLight')}</option>
                <option value="standard">{t('wardrobe.bulkinessStandard')}</option>
                <option value="bulky">{t('wardrobe.bulkinessBulky')}</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{t('wardrobe.colorLabel')}</label>
              <select
                value={newItem.color}
                onChange={e => { setTouched({ ...touched, color: true }); setNewItem({ ...newItem, color: e.target.value }); }}
                style={{ width: '100%', padding: '0.5rem', fontSize: '0.75rem' }}
              >
                {WARDROBE_COLORS.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{t('wardrobe.materialLabel')}</label>
              <select
                value={newItem.material}
                onChange={e => { setTouched({ ...touched, material: true }); setNewItem({ ...newItem, material: e.target.value }); }}
                style={{ width: '100%', padding: '0.5rem', fontSize: '0.75rem' }}
              >
                {WARDROBE_MATERIALS.map(m => <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>)}
              </select>
            </div>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={newItem.time === 'evening'}
              onChange={e => { setTouched({ ...touched, time: true }); setNewItem({ ...newItem, time: e.target.checked ? 'evening' : 'day' }); }}
            />
            🍷 {t('wardrobe.eveningLabel')}
          </label>
          <button type="submit" style={{ padding: '0.75rem', borderRadius: '8px' }}>
            {t('wardrobe.addButton')}
          </button>
        </form>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'var(--accent-color)' }}>{t('wardrobe.bulkTitle')}</label>
          <textarea 
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            placeholder={t('wardrobe.bulkPlaceholder')}
            style={{ 
              width: '100%', minHeight: '100px', padding: '0.75rem', borderRadius: '12px', 
              border: '1px solid var(--border-color)', background: 'var(--bg-color)', 
              color: 'var(--text-primary)', fontFamily: 'inherit', resize: 'vertical'
            }}
          />
          <button type="button" onClick={handleBulkUpload} style={{ padding: '0.75rem', borderRadius: '8px' }}>
            {t('wardrobe.bulkButton')}
          </button>
        </div>

        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
          {t('wardrobe.yourItems')}
        </h3>
        {wardrobe.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>{t('wardrobe.empty')}</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {wardrobe.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '8px', background: 'var(--bg-secondary)', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', position: 'relative' }}>
                    {itemImages[item.id] ? (
                       <img src={itemImages[item.id]} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    ) : isProcessing[item.id] ? (
                       <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                         {t('wardrobe.aiProcessing')}{processingProgress[item.id] != null ? ` ${processingProgress[item.id]}%` : ''}
                       </span>
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
                      {item.category.toUpperCase()} • {item.material} • {item.color || 'black'}{item.time === 'evening' ? ' • 🍷 evening' : ''} • {item.bulkiness} ({item.weight}g)
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

      {pendingCameraFile && (
        <PromptDialog
          title={t('wardrobe.cameraPromptTitle')}
          message={t('wardrobe.cameraPrompt')}
          placeholder={t('wardrobe.namePlaceholder')}
          submitLabel={t('wardrobe.cameraPromptSubmit')}
          cancelLabel={t('wardrobe.cameraPromptSkip')}
          onSubmit={handleCameraPromptSubmit}
          onCancel={handleCameraPromptSkip}
        />
      )}
    </div>
  );
};

export default WardrobeManager;
