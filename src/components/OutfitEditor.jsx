import React, { useState, useEffect } from 'react';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import { getItemImage } from '../services/db';

const DraggableItem = ({ item }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: item.id,
    data: item
  });
  const [image, setImage] = useState(null);

  useEffect(() => {
    getItemImage(item.id).then(img => {
      if (img) setImage(img);
    });
  }, [item.id]);

  const style = transform ? {
    transform: 'translate3d(' + transform.x + 'px, ' + transform.y + 'px, 0)',
    zIndex: 100,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      role="listitem"
      aria-roledescription="draggable wardrobe item"
      aria-label={item.name}
      aria-grabbed={transform ? 'true' : 'false'}
      tabIndex={0}
      className="draggable-item"
      style={{ 
        ...style,
        padding: '0.5rem', 
        margin: '0.5rem', 
        background: 'var(--bg-color)', 
        border: '1px solid var(--border-color)', 
        borderRadius: '8px', 
        cursor: 'grab',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}
    >
      {image ? (
        <img src={image} alt={item.name} style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
      ) : (
        <div style={{ fontSize: '1.5rem' }}>👕</div>
      )}
      <div style={{ fontSize: '0.875rem' }}>{item.name}</div>
    </div>
  );
};

const DroppableSlot = ({ id, label, currentItem }) => {
  const { isOver, setNodeRef } = useDroppable({ id });
  const [image, setImage] = useState(null);

  useEffect(() => {
    if (currentItem && currentItem.id) {
      getItemImage(currentItem.id).then(img => {
        if (img) setImage(img);
      });
    } else {
      setImage(null);
    }
  }, [currentItem]);

  const slotName = currentItem ? currentItem.name || currentItem : null;
  const style = {
    padding: '1rem',
    border: '2px dashed ' + (isOver ? 'var(--primary-color)' : 'var(--border-color)'),
    borderRadius: '12px',
    textAlign: 'center',
    background: isOver ? 'var(--bg-secondary)' : 'transparent',
    minHeight: '100px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  };

  return (
    <div
      ref={setNodeRef}
      role="region"
      aria-label={`${label} slot${slotName ? `: ${slotName}` : ' — empty'}`}
      aria-dropeffect="move"
      style={style}
    >
      <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)' }}>{label}</h4>
      {currentItem ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {image ? (
            <img src={image} alt={currentItem.name} style={{ width: '50px', height: '50px', objectFit: 'contain' }} />
          ) : (
            <div style={{ fontSize: '2rem' }}>✨</div>
          )}
          <div style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>{currentItem.name}</div>
        </div>
      ) : (
        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Drag {String(label).toLowerCase()} here</div>
      )}
    </div>
  );
};

const OutfitEditor = ({ dayOutfit, wardrobe, onSave, onCancel }) => {
  const [editedOutfit, setEditedOutfit] = useState(dayOutfit);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (over && active.data.current) {
      const draggedItem = active.data.current;
      const slotId = over.id; // 'top', 'bottom', 'outer', 'shoe'
      
      setEditedOutfit(prev => ({
        ...prev,
        [slotId]: draggedItem
      }));
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Edit outfit: ${dayOutfit.name}`}
      style={{ 
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
      background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', 
      alignItems: 'center', zIndex: 1000 
    }}
    >
      <div style={{ 
        background: 'var(--bg-color)', width: '90%', maxWidth: '800px', 
        height: '80vh', borderRadius: '12px', padding: '1.5rem', display: 'flex', 
        flexDirection: 'column', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' 
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2>Edit Outfit - {dayOutfit.name}</h2>
          <div>
            <button onClick={onCancel} style={{ marginRight: '1rem', background: 'transparent', border: '1px solid var(--border-color)', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
            <button onClick={() => onSave(editedOutfit)} style={{ background: 'var(--primary-color)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' }}>Save Outfit</button>
          </div>
        </div>

        <DndContext onDragEnd={handleDragEnd}>
          <div style={{ display: 'flex', flex: 1, gap: '2rem', minHeight: 0 }}>
            <div
              role="list"
              aria-label="Your closet items"
              style={{ flex: 1, overflowY: 'auto', borderRight: '1px solid var(--border-color)', paddingRight: '1rem' }}
            >
              <h3 style={{ marginTop: 0 }}>Your Closet</h3>
              {wardrobe.filter(i => ['top', 'bottom', 'outer', 'shoe'].includes(i.category)).map(item => (
                <DraggableItem key={item.id} item={item} />
              ))}
            </div>
            
            <div
              role="group"
              aria-label="Outfit slots"
              style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}
            >
              <h3 style={{ marginTop: 0 }}>Outfit Slots</h3>
              <DroppableSlot id="top" label="Top" currentItem={editedOutfit.top} />
              <DroppableSlot id="bottom" label="Bottom" currentItem={editedOutfit.bottom} />
              <DroppableSlot id="outer" label="Outerwear" currentItem={editedOutfit.outer} />
              <DroppableSlot id="shoe" label="Shoes" currentItem={editedOutfit.shoe} />
            </div>
          </div>
        </DndContext>
      </div>
    </div>
  );
};

export default OutfitEditor;
