import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const VolumeChart = ({ packingList, suitcaseVolume }) => {
  const data = useMemo(() => {
    let clothes = 0;
    let tech = 0;
    let toiletries = 0;
    let other = 0;
    let worn = 0; // Worn items don't take suitcase volume, but good to track

    Object.values(packingList).forEach(categoryArr => {
      categoryArr.forEach(item => {
        if (item.isWorn) {
          worn += item.vol;
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

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{ background: 'var(--bg-color)', border: '1px solid var(--border-color)', padding: '0.5rem', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <p style={{ margin: 0, fontWeight: 'bold', color: data.color }}>{data.name}</p>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-color)' }}>{Math.round(data.value / 1000)} Liters</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ padding: '2rem', background: 'var(--bg-color)', borderRadius: '12px', border: '1px solid var(--border-color)', margin: '2rem 0' }}>
      <h3 style={{ marginTop: 0, marginBottom: '0.5rem', color: 'var(--text-color)' }}>Suitcase Capacity Analytics</h3>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        Your bag is <strong>{percentage}% full</strong> ({Math.round(totalUsed / 1000)}L out of {Math.round(capacity / 1000)}L used). Worn items (travel day outfit) are excluded from suitcase volume.
      </p>
      
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={110}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={'cell-' + index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '0.875rem' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default VolumeChart;
