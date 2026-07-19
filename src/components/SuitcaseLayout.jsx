import React, { useState, useMemo } from 'react';
import { DndContext, useDraggable } from '@dnd-kit/core';
import { useT } from '../i18n/context.jsx';

const CUBE_COLORS = {
  main: '#3b82f6',
  base: '#22c55e',
  liquid: '#f59e0b',
  dry: '#8b5cf6',
  tech: '#06b6d4',
  loose: '#ef4444',
  plane: '#64748b',
};

const CUBE_ICONS = {
  main: '👕',
  base: '🧦',
  liquid: '🧴',
  dry: '🪥',
  tech: '🔌',
  loose: '🧥',
  plane: '✈️',
};

const DraggableCube = ({ cubeKey, items, totalVol, suitcaseVol, maxWidth }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: cubeKey });

  const volPct = totalVol > 0 ? Math.min(1, (items.reduce((s, i) => s + (i.vol || 0), 0) / suitcaseVol)) : 0.05;
  const itemCount = items.length;
  const color = CUBE_COLORS[cubeKey] || '#64748b';
  const icon = CUBE_ICONS[cubeKey] || '📦';

  const cubeWidth = Math.max(60, volPct * maxWidth);
  const cubeHeight = Math.max(48, volPct * 320);

  const style = {
    width: cubeWidth,
    height: cubeHeight,
    background: `linear-gradient(135deg, ${color}, ${color}88)`,
    borderRadius: 6,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: '0.7rem',
    fontWeight: 600,
    cursor: 'grab',
    userSelect: 'none',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    zIndex: transform ? 100 : 1,
    padding: 4,
    textAlign: 'center',
    lineHeight: 1.2,
    ...(itemCount === 0 && { opacity: 0.3, background: `linear-gradient(135deg, #334155, #1e293b)` }),
  };

  return (
    <div ref={setNodeRef} {...listeners} {...attributes} style={style} role="listitem" aria-label={`${cubeKey} cube: ${itemCount} items`}>
      <span style={{ fontSize: '1.2rem' }}>{icon}</span>
      <span>{cubeKey}</span>
      <span style={{ fontSize: '0.6rem', opacity: 0.8 }}>{itemCount} items</span>
    </div>
  );
};

const SuitcaseLayout = ({ packingList, suitcaseDims, onReorder }) => {
  const { t } = useT();
  const [cubes, setCubes] = useState(() => {
    if (!packingList) return [];
    return Object.entries(packingList).map(([key, items]) => ({
      key,
      items: items || [],
    }));
  });

  const totalVol = useMemo(() => {
    if (!packingList) return 0;
    return Object.values(packingList).flat().reduce((s, i) => s + (i.vol || 0), 0);
  }, [packingList]);

  const suitcaseVol = suitcaseDims
    ? suitcaseDims.l * suitcaseDims.w * suitcaseDims.h
    : 50000;

  const volPct = Math.min(1, totalVol / suitcaseVol);
  const fillColor = volPct > 0.95 ? '#ef4444' : volPct > 0.75 ? '#f59e0b' : '#22c55e';

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setCubes(prev => {
      const newCubes = [...prev];
      const oldIdx = newCubes.findIndex(c => c.key === active.id);
      const newIdx = newCubes.findIndex(c => c.key === over.id);
      if (oldIdx === -1 || newIdx === -1) return prev;
      const [moved] = newCubes.splice(oldIdx, 1);
      newCubes.splice(newIdx, 0, moved);
      if (onReorder) onReorder(newCubes.map(c => c.key));
      return newCubes;
    });
  };

  if (!packingList) return null;

  return (
    <div className="glass animate-slide-up" style={{ padding: '1.25rem', marginBottom: '1.5rem', animationDelay: '0.6s' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.15rem' }}>🧳 {t('suitcaseLayout.title')}</h3>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
          {Math.round(totalVol / 1000 * 10) / 10}L / {Math.round(suitcaseVol / 1000 * 10) / 10}L
        </span>
      </div>

      {/* Volume fill bar */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{t('suitcaseLayout.fill')}</span>
          <span style={{ fontSize: '0.7rem', fontWeight: 600, color: fillColor }}>{Math.round(volPct * 100)}%</span>
        </div>
        <div style={{ width: '100%', height: 6, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 999, overflow: 'hidden' }}>
          <div style={{ width: `${Math.min(100, volPct * 100)}%`, height: '100%', borderRadius: 999, background: fillColor, transition: 'width 0.5s ease' }} />
        </div>
      </div>

      {/* Suitcase grid */}
      <DndContext onDragEnd={handleDragEnd}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          padding: 12,
          background: 'var(--surface-color)',
          borderRadius: 12,
          border: `2px solid ${volPct > 0.95 ? '#ef4444' : 'var(--border-color)'}`,
          minHeight: 200,
          alignItems: 'flex-end',
          justifyContent: 'center',
          maxWidth: '100%',
          overflow: 'hidden',
        }}>
          {cubes.map(({ key, items }) =>
            items.length > 0 ? (
              <DraggableCube
                key={key}
                cubeKey={key}
                items={items}
                totalVol={totalVol}
                suitcaseVol={suitcaseVol}
                maxWidth={280}
              />
            ) : null
          )}
          {cubes.every(c => c.items.length === 0) && (
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', padding: '1rem' }}>
              {t('suitcaseLayout.empty')}
            </div>
          )}
        </div>
      </DndContext>

      <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '0.5rem' }}>
        {t('suitcaseLayout.dragHint')}
      </div>
    </div>
  );
};

export default SuitcaseLayout;
