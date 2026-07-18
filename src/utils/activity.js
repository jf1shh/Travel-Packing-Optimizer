export const guessActivityFromDestination = (dest) => {
  if (!dest) return '';
  const d = dest.toLowerCase();
  if (d.match(/(ski|aspen|whistler|chamonix|vail|tahoe|niseko|snow|breckenridge|banff|park city|alps)/)) return 'ski';
  if (d.match(/(beach|honolulu|maui|cancun|maldives|ibiza|bali|phuket|miami|tulum|boracay|fiji|resort)/)) return 'beach';
  if (d.match(/(hike|yosemite|zion|glacier|yellowstone|patagonia|machu picchu|kilimanjaro|trail|camp)/)) return 'hike';
  if (d.match(/(vegas|mykonos|new orleans|night|club)/)) return 'nightout';
  if (d.match(/(business|corporate|hq|office|meeting|conference)/)) return 'business';
  if (d.match(/(london|paris|rome|tokyo|new york|nyc|berlin|madrid|barcelona|amsterdam|prague|vienna|sightseeing)/)) return 'sightseeing';
  return '';
};

export const ACTIVITY_OPTIONS = [
  { value: '', label: '🚶 Casual' },
  { value: 'sightseeing', label: '📸 Sightseeing' },
  { value: 'formal', label: '🍷 Formal' },
  { value: 'business', label: '👔 Business' },
  { value: 'beach', label: '🏖️ Beach' },
  { value: 'hike', label: '🥾 Hike' },
  { value: 'ski', label: '⛷️ Ski' },
  { value: 'nightout', label: '🕺 Night Out' },
  { value: 'gym', label: '💪 Gym' },
  { value: 'transit', label: '✈️ Transit' },
];
