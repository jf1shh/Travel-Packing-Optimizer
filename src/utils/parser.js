import { getBulkStats } from './itemStats';

export const parseBulkText = (text) => {
  if (!text) return [];

  // Split by newlines, periods, or commas
  const rawPhrases = text.split(/[\n,.]+/).map(p => p.trim()).filter(p => p.length > 0);
  const items = [];

  const numberMap = {
    'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
    'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
    'a pair of': 1, 'a': 1, 'some': 2
  };

  rawPhrases.forEach(phrase => {
    let lower = phrase.toLowerCase();
    
    // Default quantity is 1
    let qty = 1;

    // Detect numeric quantities "3"
    const digitMatch = lower.match(/^(\d+)\s+/);
    if (digitMatch) {
      qty = parseInt(digitMatch[1], 10);
      lower = lower.replace(digitMatch[0], '').trim();
    } else {
      // Detect word quantities "three" or "a pair of"
      for (const [word, num] of Object.entries(numberMap)) {
        if (lower.startsWith(word + ' ')) {
          qty = num;
          lower = lower.replace(word + ' ', '').trim();
          break;
        }
      }
    }

    // Heuristics for Category
    let cat = 'top';
    if (lower.match(/(pant|jean|short|skirt|trouser|legging)/)) cat = 'bottom';
    else if (lower.match(/(jacket|coat|blazer|windbreaker|shell|parka)/)) cat = 'outer';
    else if (lower.match(/(shoe|boot|sneaker|loafer|sandal|heel)/)) cat = 'shoe';

    // Heuristics for Bulkiness
    let bulk = 'standard';
    if (lower.match(/(bulky|heavy|thick|winter|puffer)/)) bulk = 'bulky';
    else if (lower.match(/(light|thin|summer|breezy)/)) bulk = 'light';

    // Heuristics for Material
    let mat = 'cotton';
    if (lower.match(/(linen)/)) mat = 'linen';
    else if (lower.match(/(merino|wool|cashmere)/)) mat = 'wool';
    else if (lower.match(/(denim|jean)/)) mat = 'denim';
    else if (lower.match(/(leather|suede)/)) mat = 'leather';
    else if (lower.match(/(polyester|nylon|synthetic|gore-tex|spandex)/)) mat = 'synthetic';
    else if (lower.match(/(silk|satin)/)) mat = 'silk';

    // Heuristics for Color
    let col = 'black'; // default
    const colorMatch = lower.match(/(black|navy|khaki|beige|white|grey|gray|olive|brown|blue|red|green|yellow|pink|purple)/);
    if (colorMatch) col = colorMatch[0] === 'gray' ? 'grey' : colorMatch[0];

    // Clean up the name by removing generic filler words, but keep it readable
    let cleanName = phrase
      .replace(/^(\d+)\s+/, '') // remove leading digits
      .replace(/^(a pair of|a|some|one|two|three|four|five|six|seven|eight|nine|ten)\s+/i, '')
      .replace(/^[-*•\s]+/, '') // remove bullet points
      .trim();
    
    // Capitalize first letter
    if (cleanName.length > 0) {
      cleanName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
    } else {
      cleanName = "Unknown Item";
    }

    const stats = getBulkStats(cat, bulk);

    // Push Qty times
    const maxQty = Math.min(qty, 20); // Cap at 20 to prevent accidental millions
    for (let i = 0; i < maxQty; i++) {
      items.push({
        id: `w-${Date.now()}-${Math.random()}`,
        name: cleanName,
        category: cat,
        bulkiness: bulk,
        material: mat,
        color: col,
        vol: stats.vol,
        weight: stats.weight
      });
    }
  });

  return items;
};
