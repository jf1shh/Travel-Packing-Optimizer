// Shared volume/weight defaults per category and bulkiness.
// Single source of truth for parser.js and WardrobeManager.jsx.
export const BULK_STATS = {
  top: { light: { v: 200, w: 100 }, standard: { v: 400, w: 200 }, bulky: { v: 800, w: 400 } },
  bottom: { light: { v: 400, w: 200 }, standard: { v: 800, w: 400 }, bulky: { v: 1200, w: 600 } },
  outer: { light: { v: 800, w: 300 }, standard: { v: 1500, w: 800 }, bulky: { v: 3000, w: 1500 } },
  shoe: { light: { v: 1500, w: 600 }, standard: { v: 2500, w: 1000 }, bulky: { v: 3500, w: 1500 } }
};

export const getBulkStats = (category, bulkiness) => {
  const cat = BULK_STATS[category] || BULK_STATS.top;
  const b = cat[bulkiness] || cat.standard;
  return { vol: b.v, weight: b.w };
};
