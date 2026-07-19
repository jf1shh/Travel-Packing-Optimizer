import React, { useMemo, useState } from 'react';
import { useT } from '../i18n/context.jsx';

// Hand-rolled SVG donut chart replacing recharts, which pulled in d3
// internals for a single chart -- a ~329KB/97KB-gzip lazy chunk for what's
// a five-segment pie. Same visual: colored donut, hover detail, legend.
const CX = 150;
const CY = 150;
const INNER_R = 80;
const OUTER_R = 110;
const PAD_ANGLE = 2; // degrees between segments, matching the old paddingAngle

const polarToCartesian = (cx, cy, r, angleDeg) => {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
};

const describeDonutSegment = (startAngle, endAngle) => {
  const startOuter = polarToCartesian(CX, CY, OUTER_R, endAngle);
  const endOuter = polarToCartesian(CX, CY, OUTER_R, startAngle);
  const startInner = polarToCartesian(CX, CY, INNER_R, endAngle);
  const endInner = polarToCartesian(CX, CY, INNER_R, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return [
    'M', startOuter.x, startOuter.y,
    'A', OUTER_R, OUTER_R, 0, largeArc, 0, endOuter.x, endOuter.y,
    'L', endInner.x, endInner.y,
    'A', INNER_R, INNER_R, 0, largeArc, 1, startInner.x, startInner.y,
    'Z',
  ].join(' ');
};

const VolumeChart = ({ packingList, suitcaseVolume }) => {
  const { t } = useT();
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const data = useMemo(() => {
    let clothes = 0;
    let tech = 0;
    let toiletries = 0;
    let other = 0;

    Object.values(packingList).forEach(categoryArr => {
      categoryArr.forEach(item => {
        if (item.isWorn) {
          // Worn items don't take suitcase volume, but good to track
        } else if (item.category === 'clothes') {
          clothes += item.vol;
        } else if (item.category === 'tech') {
          tech += item.vol;
        } else if (item.category === 'toiletries') {
          toiletries += item.vol;
        } else {
          other += item.vol;
        }
      });
    });

    const usedVolume = clothes + tech + toiletries + other;
    let free = 0;

    // We parse suitcaseVolume. E.g., '35000' for a 35L carry-on.
    // If the algorithm packed more than capacity, free is 0.
    const capacity = parseInt(suitcaseVolume) || 35000;
    if (capacity > usedVolume) {
      free = capacity - usedVolume;
    }

    return [
      { name: 'Clothes', value: clothes, color: '#3b82f6' }, // Blue
      { name: 'Tech', value: tech, color: '#8b5cf6' },       // Purple
      { name: 'Toiletries', value: toiletries, color: '#10b981' }, // Green
      { name: 'Other', value: other, color: '#f59e0b' },     // Orange
      { name: 'Free Space', value: free, color: '#e5e7eb' }, // Gray
    ].filter(d => d.value > 0);
  }, [packingList, suitcaseVolume]);

  const totalUsed = data.filter(d => d.name !== 'Free Space').reduce((sum, d) => sum + d.value, 0);
  const capacity = parseInt(suitcaseVolume) || 35000;
  const percentage = Math.min(100, Math.round((totalUsed / capacity) * 100));
  const grandTotal = data.reduce((sum, d) => sum + d.value, 0) || 1;

  // Cumulative start/end angle per segment, with a small gap between them
  const segments = useMemo(() => {
    let angle = 0;
    return data.map(d => {
      const sweep = (d.value / grandTotal) * 360;
      const startAngle = angle + (sweep > PAD_ANGLE ? PAD_ANGLE / 2 : 0);
      const endAngle = angle + sweep - (sweep > PAD_ANGLE ? PAD_ANGLE / 2 : 0);
      angle += sweep;
      return { ...d, startAngle, endAngle };
    });
  }, [data, grandTotal]);

  const hovered = hoveredIdx != null ? segments[hoveredIdx] : null;

  return (
    <div style={{ padding: '2rem', background: 'var(--bg-color)', borderRadius: '12px', border: '1px solid var(--border-color)', margin: '2rem 0' }}>
      <h3 style={{ marginTop: 0, marginBottom: '0.5rem', color: 'var(--text-color)' }}>{t('chart.title')}</h3>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        Your bag is <strong>{percentage}% full</strong> ({Math.round(totalUsed / 1000)}L out of {Math.round(capacity / 1000)}L used). Worn items (travel day outfit) are excluded from suitcase volume.
      </p>

      <div style={{ width: '100%', maxWidth: 340, margin: '0 auto' }}>
        <svg viewBox="0 0 300 300" style={{ width: '100%', height: 'auto', display: 'block' }} role="img" aria-label={t('chart.title')}>
          {segments.map((seg, i) => (
            <path
              key={seg.name}
              d={describeDonutSegment(seg.startAngle, seg.endAngle)}
              fill={seg.color}
              opacity={hoveredIdx == null || hoveredIdx === i ? 1 : 0.45}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{ cursor: 'pointer', transition: 'opacity 0.15s ease' }}
            />
          ))}
          <text x={CX} y={CY - 6} textAnchor="middle" fontSize="26" fontWeight="800" fill={hovered ? hovered.color : 'var(--text-primary)'}>
            {hovered ? `${Math.round(hovered.value / 1000)}L` : `${percentage}%`}
          </text>
          <text x={CX} y={CY + 16} textAnchor="middle" fontSize="12" fill="var(--text-secondary)">
            {hovered ? hovered.name : t('capacity.volume')}
          </text>
        </svg>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.5rem 1.25rem', marginTop: '1rem' }}>
        {segments.map((seg, i) => (
          <div
            key={seg.name}
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-secondary)', cursor: 'pointer', opacity: hoveredIdx == null || hoveredIdx === i ? 1 : 0.5 }}
          >
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: seg.color, display: 'inline-block' }} />
            {seg.name} · {Math.round(seg.value / 1000)}L
          </div>
        ))}
      </div>
    </div>
  );
};

export default VolumeChart;
