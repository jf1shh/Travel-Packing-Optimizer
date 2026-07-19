import { getAdapterSuggestion } from '../utils/plugs';

export const COLOR_MATCHES = {
  'black': ['white', 'grey', 'beige', 'khaki', 'olive', 'black'],
  'navy': ['white', 'grey', 'khaki', 'beige', 'olive', 'red', 'navy'],
  'khaki': ['black', 'navy', 'white', 'grey', 'olive', 'brown', 'khaki'],
  'beige': ['black', 'navy', 'white', 'grey', 'brown', 'olive', 'beige'],
  'white': ['black', 'navy', 'khaki', 'beige', 'grey', 'olive', 'brown', 'blue', 'red', 'green', 'white'],
  'grey': ['black', 'navy', 'white', 'blue', 'red', 'green', 'grey'],
  'olive': ['black', 'navy', 'white', 'khaki', 'beige', 'brown', 'olive'],
  'brown': ['white', 'khaki', 'beige', 'olive', 'brown'],
  'blue': ['white', 'grey', 'khaki', 'beige', 'black', 'navy', 'blue'],
  'red': ['white', 'grey', 'black', 'navy', 'beige', 'red'],
  'green': ['white', 'grey', 'black', 'khaki', 'beige', 'yellow', 'green'],
  'yellow': ['white', 'black', 'grey', 'navy', 'brown', 'olive', 'beige', 'khaki', 'green', 'yellow'],
  'pink': ['white', 'black', 'grey', 'navy', 'beige', 'brown', 'khaki', 'red', 'purple', 'pink'],
  'purple': ['white', 'black', 'grey', 'navy', 'beige', 'olive', 'pink', 'red', 'blue', 'purple']
};

export const doColorsMatch = (c1, c2) => {
  if (!c1 || !c2) return true;
  const color1 = c1.toLowerCase();
  const color2 = c2.toLowerCase();
  if (color1 === color2) return true;
  if (COLOR_MATCHES[color1] && COLOR_MATCHES[color1].includes(color2)) return true;
  if (COLOR_MATCHES[color2] && COLOR_MATCHES[color2].includes(color1)) return true;
  return false;
};

export const PALETTES = {
  'quiet-luxury': {
    name: 'Quiet Luxury',
    tops: [
      { name: 'Beige Cashmere Crewneck', color: 'beige', time: 'day' },
      { name: 'Black Silk Button-down', color: 'black', time: 'evening' },
      { name: 'Grey Merino Turtleneck', color: 'grey', time: 'day' },
      { name: 'Crisp White Tee', color: 'white', time: 'day' }
    ],
    bottoms: [
      { name: 'Khaki Tailored Trousers', color: 'khaki', time: 'day' },
      { name: 'Dark Wash Denim', color: 'navy', time: 'day' },
      { name: 'Black Pleated Skirt', color: 'black', time: 'evening' }
    ],
    outerwear: [{ name: 'Camel Trench Coat', color: 'beige' }, { name: 'Structured Wool Blazer', color: 'grey' }],
    shoes: [{ name: 'Black Leather Loafers', color: 'black' }, { name: 'Minimalist White Sneakers', color: 'white' }, { name: 'Suede Chelsea Boots', color: 'brown' }],
    colors: ['#f5f5dc', '#1a1a1a', '#8b7355']
  },
  'gorpcore': {
    name: 'Gorpcore',
    tops: [
      { name: 'Olive Technical Base Layer', color: 'olive', time: 'day' },
      { name: 'Black Fleece Half-Zip', color: 'black', time: 'evening' },
      { name: 'Grey Graphic Climbing Tee', color: 'grey', time: 'day' },
      { name: 'Navy Merino Wool Top', color: 'navy', time: 'day' }
    ],
    bottoms: [
      { name: 'Khaki Cargo Hiking Pants', color: 'khaki', time: 'day' },
      { name: 'Black Waterproof Trousers', color: 'black', time: 'evening' },
      { name: 'Olive Nylon Shorts', color: 'olive', time: 'day' }
    ],
    outerwear: [{ name: 'Olive Gore-Tex Shell', color: 'olive' }, { name: 'Black Puffer Vest', color: 'black' }],
    shoes: [{ name: 'Trail Running Shoes', color: 'grey' }, { name: 'Hiking Boots', color: 'brown' }],
    colors: ['#4a5d23', '#cc5500', '#2f4f4f']
  },
  'scandi': {
    name: 'Scandi Minimalist',
    tops: [
      { name: 'White Oversized Poplin Shirt', color: 'white', time: 'day' },
      { name: 'Grey Chunky Knit Sweater', color: 'grey', time: 'day' },
      { name: 'Black Boxy T-Shirt', color: 'black', time: 'evening' },
      { name: 'Navy Striped Long-sleeve', color: 'navy', time: 'day' }
    ],
    bottoms: [
      { name: 'Blue Wide-leg Jeans', color: 'blue', time: 'day' },
      { name: 'Beige Linen Trousers', color: 'beige', time: 'day' },
      { name: 'Black Midi Slip Skirt', color: 'black', time: 'evening' }
    ],
    outerwear: [{ name: 'Grey Oversized Wool Coat', color: 'grey' }, { name: 'Olive Quilted Liner Jacket', color: 'olive' }],
    shoes: [{ name: 'Black Chunky Boots', color: 'black' }, { name: 'White Retro Sneakers', color: 'white' }],
    colors: ['#e8e8e8', '#4b5320', '#36454f']
  },
  'streetwear': {
    name: 'Y2K Streetwear',
    tops: [
      { name: 'White Baby Tee', color: 'white', time: 'day' },
      { name: 'Grey Oversized Graphic Hoodie', color: 'grey', time: 'day' },
      { name: 'Black Mesh Top', color: 'black', time: 'evening' },
      { name: 'Navy Velour Zip-up', color: 'navy', time: 'day' }
    ],
    bottoms: [
      { name: 'Olive Parachute Pants', color: 'olive', time: 'day' },
      { name: 'Blue Low-rise Baggy Jeans', color: 'blue', time: 'day' },
      { name: 'Black Cargo Mini Skirt', color: 'black', time: 'evening' }
    ],
    outerwear: [{ name: 'Black Cropped Puffer', color: 'black' }, { name: 'Vintage Leather Racing Jacket', color: 'brown' }],
    shoes: [{ name: 'Platform Sneakers', color: 'white' }, { name: 'Combat Boots', color: 'black' }],
    colors: ['#ff00ff', '#000000', '#00ffff']
  },
  'dark-academia': {
    name: 'Dark Academia',
    tops: [
      { name: 'Brown Tweed Vest', color: 'brown', time: 'day' },
      { name: 'Beige Cable Knit Sweater', color: 'beige', time: 'day' },
      { name: 'White Oxford Shirt', color: 'white', time: 'day' },
      { name: 'Black Ribbed Turtleneck', color: 'black', time: 'evening' }
    ],
    bottoms: [
      { name: 'Brown Plaid Trousers', color: 'brown', time: 'day' },
      { name: 'Olive Corduroy Pants', color: 'olive', time: 'day' },
      { name: 'Black Pleated Midi Skirt', color: 'black', time: 'evening' }
    ],
    outerwear: [{ name: 'Brown Tweed Blazer', color: 'brown' }, { name: 'Navy Long Wool Overcoat', color: 'navy' }],
    shoes: [{ name: 'Brown Oxford Shoes', color: 'brown' }, { name: 'Black Leather Brogues', color: 'black' }],
    colors: ['#3e2723', '#1b5e20', '#4e342e']
  },
  'athleisure': {
    name: 'Athleisure',
    tops: [
      { name: 'Black Seamless Crop Top', color: 'black', time: 'day' },
      { name: 'Grey Performance Hoodie', color: 'grey', time: 'day' },
      { name: 'Navy Quarter-Zip Pullover', color: 'navy', time: 'day' },
      { name: 'White Dri-FIT Tee', color: 'white', time: 'day' }
    ],
    bottoms: [
      { name: 'Black Compression Leggings', color: 'black', time: 'day' },
      { name: 'Grey Joggers', color: 'grey', time: 'day' },
      { name: 'Navy Biker Shorts', color: 'navy', time: 'day' }
    ],
    outerwear: [{ name: 'Black Nylon Track Jacket', color: 'black' }, { name: 'Grey Fleece Zip-Up', color: 'grey' }],
    shoes: [{ name: 'White Running Sneakers', color: 'white' }, { name: 'Black Recovery Slides', color: 'black' }],
    colors: ['#cfd8dc', '#263238', '#00bcd4']
  },
  'bohemian': {
    name: 'Bohemian / Resort',
    tops: [
      { name: 'White Flowy Linen Blouse', color: 'white', time: 'day' },
      { name: 'Beige Crochet Top', color: 'beige', time: 'day' },
      { name: 'Olive Off-shoulder Tunic', color: 'olive', time: 'evening' },
      { name: 'White Gauze Button-up', color: 'white', time: 'day' }
    ],
    bottoms: [
      { name: 'Khaki Tiered Maxi Skirt', color: 'khaki', time: 'day' },
      { name: 'Beige Linen Wide-leg Pants', color: 'beige', time: 'day' },
      { name: 'Blue Denim Cut-offs', color: 'blue', time: 'day' }
    ],
    outerwear: [{ name: 'White Lightweight Kimono', color: 'white' }, { name: 'Blue Denim Jacket', color: 'blue' }],
    shoes: [{ name: 'Brown Strappy Leather Sandals', color: 'brown' }, { name: 'Beige Espadrilles', color: 'beige' }],
    colors: ['#f4a460', '#8b4513', '#556b2f']
  },
  'preppy': {
    name: 'Ivy League Prep',
    tops: [
      { name: 'White Oxford Shirt', color: 'white', time: 'day' },
      { name: 'Navy Polo Shirt', color: 'navy', time: 'day' },
      { name: 'Khaki Cable-Knit Sweater', color: 'khaki', time: 'day' },
      { name: 'White Breton Stripe Tee', color: 'white', time: 'day' }
    ],
    bottoms: [
      { name: 'Khaki Chinos', color: 'khaki', time: 'day' },
      { name: 'Navy Tailored Shorts', color: 'navy', time: 'day' },
      { name: 'Grey Wool Trousers', color: 'grey', time: 'day' }
    ],
    outerwear: [{ name: 'Navy Blazer', color: 'navy' }, { name: 'Beige Trench Coat', color: 'beige' }],
    shoes: [{ name: 'Brown Leather Loafers', color: 'brown' }, { name: 'White Canvas Sneakers', color: 'white' }, { name: 'Brown Boat Shoes', color: 'brown' }],
    colors: ['#1e3a8a', '#f8fafc', '#b8860b']
  },
  'rock': {
    name: 'Rock Chic',
    tops: [
      { name: 'Black Band Tee', color: 'black', time: 'day' },
      { name: 'White Vintage Graphic Tee', color: 'white', time: 'day' },
      { name: 'Red Plaid Flannel', color: 'red', time: 'day' },
      { name: 'Grey Distressed Sweater', color: 'grey', time: 'evening' }
    ],
    bottoms: [
      { name: 'Black Ripped Skinny Jeans', color: 'black', time: 'evening' },
      { name: 'Black Leather Mini Skirt', color: 'black', time: 'evening' },
      { name: 'Grey Slim Denim', color: 'grey', time: 'day' }
    ],
    outerwear: [{ name: 'Black Leather Moto Jacket', color: 'black' }, { name: 'Blue Distressed Denim Jacket', color: 'blue' }],
    shoes: [{ name: 'Black Combat Boots', color: 'black' }, { name: 'White Platform Sneakers', color: 'white' }],
    colors: ['#0a0a0a', '#dc2626', '#64748b']
  },
  'whimsigoth': {
    name: 'Whimsigoth',
    tops: [
      { name: 'Black Lace Corset Top', color: 'black', time: 'evening' },
      { name: 'Purple Velvet Blouse', color: 'purple', time: 'evening' },
      { name: 'Navy Silk Camisole', color: 'navy', time: 'evening' },
      { name: 'Grey Crochet Overlay Top', color: 'grey', time: 'day' }
    ],
    bottoms: [
      { name: 'Black Velvet Maxi Skirt', color: 'black', time: 'evening' },
      { name: 'Navy Dark Floral Midi Skirt', color: 'navy', time: 'evening' },
      { name: 'Grey Wide-leg Trousers', color: 'grey', time: 'day' }
    ],
    outerwear: [{ name: 'Black Embroidered Kimono', color: 'black' }, { name: 'Purple Velvet Duster', color: 'purple' }],
    shoes: [{ name: 'Black Pointed Ankle Boots', color: 'black' }, { name: 'Black Lace-up Boots', color: 'black' }],
    colors: ['#6b21a8', '#0a0a0a', '#1e3a8a']
  },
  'coastal': {
    name: 'Coastal Maritime',
    tops: [
      { name: 'White Linen Button-Down', color: 'white', time: 'day' },
      { name: 'Navy Striped Breton Top', color: 'navy', time: 'day' },
      { name: 'Beige Cable-Knit Sweater', color: 'beige', time: 'day' },
      { name: 'Blue Chambray Shirt', color: 'blue', time: 'day' }
    ],
    bottoms: [
      { name: 'White Linen Shorts', color: 'white', time: 'day' },
      { name: 'Navy Chino Shorts', color: 'navy', time: 'day' },
      { name: 'Beige Tailored Trousers', color: 'beige', time: 'day' }
    ],
    outerwear: [{ name: 'Navy Peacoat', color: 'navy' }, { name: 'Beige Fisherman Sweater', color: 'beige' }],
    shoes: [{ name: 'Brown Boat Shoes', color: 'brown' }, { name: 'White Canvas Sneakers', color: 'white' }, { name: 'Tan Leather Sandals', color: 'brown' }],
    colors: ['#1e3a8a', '#f8fafc', '#d4b886']
  },
  'cottagecore': {
    name: 'Cottagecore',
    tops: [
      { name: 'White Puff-Sleeve Blouse', color: 'white', time: 'day' },
      { name: 'Olive Green Crochet Top', color: 'olive', time: 'day' },
      { name: 'Pink Linen Camisole', color: 'pink', time: 'day' },
      { name: 'Beige Eyelet Blouse', color: 'beige', time: 'day' }
    ],
    bottoms: [
      { name: 'Brown Prairie Midi Skirt', color: 'brown', time: 'day' },
      { name: 'Beige Linen Wide-leg Pants', color: 'beige', time: 'day' },
      { name: 'Olive Smock Dress', color: 'olive', time: 'evening' }
    ],
    outerwear: [{ name: 'Beige Cable-Knit Cardigan', color: 'beige' }, { name: 'Brown Corduroy Jacket', color: 'brown' }],
    shoes: [{ name: 'Brown Lace-up Ankle Boots', color: 'brown' }, { name: 'Beige Ballet Flats', color: 'beige' }],
    colors: ['#f8fafc', '#4d7c0f', '#a0522d']
  }
};

export const ACTIVITY_GEAR = {
  formal: {
    outfit: { top: 'Dress Shirt / Blouse', bottom: 'Tailored Trousers / Skirt', shoe: 'Dress Shoes', outer: 'Blazer / Evening Wrap' },
    items: [
      { id: 'act-form-1', category: 'clothes', name: 'Formal Attire (Top & Bottom)', weight: 600, vol: 1500, priority: 10, isEssential: true, fold: 'bundle' },
      { id: 'act-form-2', category: 'clothes', name: 'Dress Shoes', weight: 800, vol: 2000, priority: 10, isEssential: true, fold: 'shoes' }
    ]
  },
  gym: {
    outfit: { top: 'Moisture-Wicking Tee', bottom: 'Athletic Shorts / Leggings', shoe: 'Running Shoes', outer: null },
    items: [
      { id: 'act-gym-1', category: 'clothes', name: 'Gym Outfit', weight: 300, vol: 800, priority: 10, isEssential: true, fold: 'ranger' },
      { id: 'act-gym-2', category: 'clothes', name: 'Running Shoes', weight: 600, vol: 1500, priority: 10, isEssential: true, fold: 'shoes' }
    ]
  },
  beach: {
    outfit: { top: 'Swimwear', bottom: 'Board Shorts / Cover-up', shoe: 'Sandals', outer: 'Sun Hat' },
    items: [
      { id: 'act-beach-1', category: 'clothes', name: 'Swimsuit / Trunks', weight: 150, vol: 400, priority: 10, isEssential: true, fold: 'ranger' },
      { id: 'act-beach-2', category: 'toiletries', name: 'Beach Towel (Microfiber)', weight: 200, vol: 500, priority: 8, isEssential: true, fold: 'ranger' },
      { id: 'act-beach-3', category: 'toiletries', name: 'Reef-Safe Sunscreen', weight: 150, vol: 150, priority: 10, isEssential: true }
    ]
  },
  hike: {
    outfit: { top: 'Merino Wool Tee', bottom: 'Hiking Pants / Leggings', shoe: 'Trail Shoes', outer: 'Fleece Mid-Layer' },
    items: [
      { id: 'act-hike-1', category: 'clothes', name: 'Hiking Pants / Leggings', weight: 400, vol: 1000, priority: 10, isEssential: true, fold: 'ranger' },
      { id: 'act-hike-2', category: 'clothes', name: 'Trail Shoes', weight: 800, vol: 2000, priority: 10, isEssential: true, fold: 'shoes' },
      { id: 'act-hike-3', category: 'toiletries', name: 'Water Bottle & Bug Spray', weight: 300, vol: 500, priority: 10, isEssential: true }
    ]
  },
  ski: {
    outfit: { top: 'Thermal Base Layer', bottom: 'Snow Pants', shoe: 'Snow Boots', outer: 'Ski Jacket' },
    items: [
      { id: 'act-ski-1', category: 'clothes', name: 'Snow Pants', weight: 800, vol: 2000, priority: 10, isEssential: true, fold: 'bundle' },
      { id: 'act-ski-2', category: 'clothes', name: 'Thermal Base Layer', weight: 250, vol: 600, priority: 10, isEssential: true, fold: 'ranger' },
      { id: 'act-ski-3', category: 'clothes', name: 'Ski Jacket', weight: 1200, vol: 3000, priority: 10, isEssential: true, fold: 'bundle' },
      { id: 'act-ski-4', category: 'clothes', name: 'Snow Boots', weight: 1500, vol: 4000, priority: 10, isEssential: true, fold: 'shoes' },
      { id: 'act-ski-5', category: 'clothes', name: 'Waterproof Gloves / Beanie', weight: 200, vol: 500, priority: 10, isEssential: true, fold: 'stuff' }
    ]
  },
  business: {
    outfit: { top: 'Dress Shirt / Blouse', bottom: 'Slacks / Pencil Skirt', shoe: 'Oxfords / Heels', outer: 'Suit Jacket' },
    items: [
      { id: 'act-biz-1', category: 'clothes', name: 'Suit / Business Attire', weight: 800, vol: 2000, priority: 10, isEssential: true, fold: 'bundle' },
      { id: 'act-biz-2', category: 'clothes', name: 'Dress Shoes / Heels', weight: 700, vol: 1500, priority: 10, isEssential: true, fold: 'shoes' }
    ]
  },
  nightout: {
    outfit: { top: 'Going-out Top / Shirt', bottom: 'Dark Denim / Skirt', shoe: 'Stylish Shoes', outer: 'Leather / Evening Jacket' },
    items: [
      { id: 'act-night-1', category: 'clothes', name: 'Evening Outfit', weight: 400, vol: 1000, priority: 9, isEssential: true, fold: 'konmari' },
      { id: 'act-night-2', category: 'clothes', name: 'Evening Jacket', weight: 900, vol: 1800, priority: 8, isEssential: false, fold: 'bundle' }
    ]
  },
  sightseeing: {
    outfit: { top: 'Breathable Tee', bottom: 'Comfortable Shorts / Pants', shoe: 'Walking Shoes', outer: 'Light Layer' },
    items: [
      { id: 'act-sight-1', category: 'clothes', name: 'Comfortable Walking Shoes', weight: 700, vol: 1800, priority: 10, isEssential: true, fold: 'shoes' },
      { id: 'act-sight-2', category: 'loose', name: 'Daypack / Sling Bag', weight: 300, vol: 500, priority: 10, isEssential: true, cube: 'loose' },
      { id: 'act-sight-3', category: 'toiletries', name: 'Reusable Water Bottle', weight: 200, vol: 800, priority: 9, isEssential: true }
    ]
  },
  transit: {
    outfit: { top: 'Soft Long-sleeve', bottom: 'Joggers / Leggings', shoe: 'Slip-on Shoes', outer: 'Hoodie / Fleece' },
    items: [
      { id: 'act-trans-1', category: 'clothes', name: 'Slip-on Shoes', weight: 600, vol: 1500, priority: 9, isEssential: false, fold: 'shoes' },
      { id: 'act-trans-2', category: 'tech', name: 'Noise-Canceling Headphones', weight: 250, vol: 600, priority: 10, isEssential: true, cube: 'tech' },
      { id: 'act-trans-3', category: 'loose', name: 'Travel Neck Pillow', weight: 300, vol: 2000, priority: 8, isEssential: false, cube: 'loose' }
    ]
  }
};

const BASE_ITEMS = {
  toiletries: {
    t1: { name: 'Toothbrush & Travel Paste', vol: 100, weight: 80, priority: 10, isEssential: true, isLiquid: true, cube: 'liquid' },
    t2: { name: 'Deodorant', vol: 120, weight: 100, priority: 10, isEssential: true, cube: 'dry' },
    t3: { name: 'Travel Shampoo/Conditioner (TSA Size)', vol: 200, weight: 220, priority: 8, isEssential: false, isLiquid: true, cube: 'liquid' },
    t4: { name: 'Moisturizer & Lip Balm', vol: 150, weight: 120, priority: 7, isEssential: true, isLiquid: true, cube: 'liquid' },
    t5: { name: 'Nail Clippers & Tweezers', vol: 50, weight: 40, priority: 5, isEssential: false, cube: 'dry' },
    t6: { name: 'Prescription Meds & Painkillers', vol: 100, weight: 50, priority: 10, isEssential: true, cube: 'dry' }
  },
  tech: {
    e2: { name: 'Universal Travel Adapter', vol: 250, weight: 150, priority: 9, isEssential: true, cube: 'tech' },
    e3: { name: 'Power Bank (10,000mAh)', vol: 300, weight: 250, priority: 8, isEssential: true, cube: 'tech' },
    e4: { name: 'Wireless Earbuds', vol: 100, weight: 50, priority: 9, isEssential: true, cube: 'tech' }
  },
  documents: {
    d1: { name: 'Passport / ID', vol: 20, weight: 30, priority: 10, isEssential: true, cube: 'dry' },
    d2: { name: 'Credit Cards & Cash', vol: 50, weight: 50, priority: 10, isEssential: true, cube: 'dry' }
  }
};

// Maps an item to its packing-cube group key. Exported so UI code that
// injects items post-generation (e.g. activity swaps) files them under
// the same grouped-list keys the engine produces.
export const deriveCube = (item) => {
  if (item.cube) return item.cube;
  if (item.category === 'clothes') {
    const n = String(item.name || '').toLowerCase();
    if (n.includes('underwear') || n.includes('sock') || n.includes('base') || n.includes('pajama')) return 'base';
    if (n.includes('jacket') || n.includes('shoe') || n.includes('boot') || n.includes('coat')) return 'loose';
    return 'main';
  }
  if (item.category === 'tech') return 'tech';
  if (item.category === 'toiletries') return item.isLiquid ? 'liquid' : 'dry';
  if (item.category === 'documents') return 'dry';
  return 'main';
};

export const generatePackingList = (weatherDataArray, tripDuration, gender, suitcaseVolume, paletteKey = 'quiet-luxury', travelMode = 'flying', dailyActivities = [], userWardrobe = [], packingStrategy = 'standard', techPorts = 'mixed', dailyDestinations = [], formDestinations = [], laundryCycle = 7, options = {}) => {
  const { countryCodes = [], itemPreferences = {} } = options;
  let allItems = [];

  const p = PALETTES[paletteKey] || PALETTES['quiet-luxury'];

  // Style preference: menswear filters out explicitly gendered pieces from the
  // palette fallbacks; womenswear/neutral keep the full palette (these palettes
  // already mix unisex and menswear-style items).
  const GENDERED_ITEM = /(skirt|dress|blouse|heels)/i;
  const filterForStyle = (items) => {
    if (gender !== 'male') return items;
    const kept = items.filter(i => !GENDERED_ITEM.test(String(i.name || '')));
    return kept.length > 0 ? kept : items;
  };
  const pTops = filterForStyle(p.tops);
  const pBottoms = filterForStyle(p.bottoms);
  const pOuterwear = filterForStyle(p.outerwear);
  const pShoes = filterForStyle(p.shoes);

  const addItem = (item) => {
    allItems.push({ ...item, checked: false, cube: deriveCube(item) });
  };

  // 2. Versatility & Thermal Scoring
  const getVersatilityScore = (item) => {
    let score = 0;
    const name = String(item.name || '').toLowerCase();
    const mat = item.material ? String(item.material).toLowerCase() : '';
    if (name.match(/(black|white|gray|grey|navy|beige|neutral|cream|tan|charcoal)/)) score += 5;
    if (mat.match(/(denim|leather|wool|merino)/)) score += 3;
    if (name.match(/(jeans|t-shirt|tee|sneaker|boot)/)) score += 2;
    return score;
  };

  const getThermalValue = (item) => {
    if (!item) return 0;
    let tv = 0;
    const bulk = item.bulkiness || 'standard';
    const mat = item.material || 'cotton';
    
    // Base material insulation
    if (mat === 'wool' || mat === 'merino') tv += 3;
    else if (mat === 'synthetic' || mat === 'leather' || mat === 'denim') tv += 2;
    else if (mat === 'cotton') tv += 1;
    else if (mat === 'linen' || mat === 'silk') tv += 0;

    // Bulkiness multiplier
    if (bulk === 'bulky') tv += 4;
    else if (bulk === 'standard') tv += 2;
    else if (bulk === 'light') tv += 0;

    return tv;
  };

  // 1. Prioritize userWardrobe items (Graph-based Bipartite Selection)
  const userTopsRaw = userWardrobe.filter(i => i.category === 'top');
  const userBottomsRaw = userWardrobe.filter(i => i.category === 'bottom');
  const userShoesRaw = userWardrobe.filter(i => i.category === 'shoe');
  const userOuter = userWardrobe.filter(i => i.category === 'outer').sort((a,b) => b.priority - a.priority);

  // Score tops and bottoms based on how many color matches they have in the opposite pool
  const scoreTopMatch = (top, bottomsPool) => bottomsPool.filter(b => doColorsMatch(top.color || 'black', b.color || 'black')).length;
  const scoreBottomMatch = (bottom, topsPool) => topsPool.filter(t => doColorsMatch(t.color || 'black', bottom.color || 'black')).length;

  // Rank by color-match count first, breaking ties (and nudging close calls) with versatility
  const userTops = userTopsRaw.sort((a,b) => (scoreTopMatch(b, userBottomsRaw) * 10 + getVersatilityScore(b)) - (scoreTopMatch(a, userBottomsRaw) * 10 + getVersatilityScore(a)));
  const userBottoms = userBottomsRaw.sort((a,b) => (scoreBottomMatch(b, userTopsRaw) * 10 + getVersatilityScore(b)) - (scoreBottomMatch(a, userTopsRaw) * 10 + getVersatilityScore(a)));
  const userShoes = userShoesRaw.sort((a,b) => b.priority - a.priority);

  // Base Layers & Mid-Trip Laundry Threshold
  let baseLayerLimit = Math.min(tripDuration, laundryCycle);
  let hasQuickDry = userTops.some(t => t.material === 'merino' || t.material === 'synthetic');
  if (hasQuickDry && tripDuration > laundryCycle) {
    addItem({ category: 'toiletries', id: 't-laundry', name: 'Travel Laundry Detergent (Sink Wash)', vol: 100, weight: 100, priority: 10, isEssential: true });
  } else if (tripDuration > laundryCycle) {
    addItem({ category: 'toiletries', id: 't-laundry', name: 'Travel Laundry Detergent Packets', vol: 100, weight: 100, priority: 10, isEssential: true });
  }

  const baseLayerCount = baseLayerLimit;
  addItem({ category: 'clothes', id: 'w1', name: `${baseLayerCount}x Pairs of Underwear`, vol: 150 * baseLayerCount, weight: 50 * baseLayerCount, priority: 10, isEssential: true, fold: 'ranger' });
  addItem({ category: 'clothes', id: 'w2', name: `${baseLayerCount}x Pairs of Socks`, vol: 100 * baseLayerCount, weight: 40 * baseLayerCount, priority: 10, isEssential: true, fold: 'shoes' });

  addItem({ category: 'clothes', id: 'w3', name: 'Pajamas / Sleepwear', vol: 400, weight: 200, priority: 9, isEssential: true, fold: 'konmari' });

  // Outfit candidates (the day scheduler below decides what is actually
  // worn, and only worn candidates get packed)
  let selectedTops = [];
  let selectedBottoms = [];
  let selectedOuter = pOuterwear[0];
  let selectedShoes = [pShoes[0]];

  let topsNeeded = tripDuration;
  let bottomsNeeded = Math.ceil(tripDuration / 2);

  if (packingStrategy === 'minimalist') {
    topsNeeded = Math.ceil(tripDuration / 3);
    bottomsNeeded = Math.ceil(tripDuration / 5);
  } else if (packingStrategy === 'flexible') {
    topsNeeded = Math.ceil(tripDuration / 2);
    bottomsNeeded = Math.ceil(tripDuration / 3);
  }

  topsNeeded = Math.max(1, Math.min(topsNeeded, pTops.length));
  bottomsNeeded = Math.max(1, Math.min(bottomsNeeded, pBottoms.length));

  for (let i = 0; i < topsNeeded; i++) {
    if (userTops[i]) selectedTops.push({ name: userTops[i].name, color: userTops[i].color || 'black', time: userTops[i].time === 'evening' ? 'evening' : 'day' });
    else selectedTops.push(pTops[i % pTops.length]);
  }
  for (let i = 0; i < bottomsNeeded; i++) {
    if (userBottoms[i]) selectedBottoms.push({ name: userBottoms[i].name, color: userBottoms[i].color || 'black', time: userBottoms[i].time === 'evening' ? 'evening' : 'day' });
    else selectedBottoms.push(pBottoms[i % pBottoms.length]);
  }

  if (userOuter.length > 0) {
    selectedOuter = { name: userOuter[0].name, color: userOuter[0].color || 'black' };
  }

  if (userShoes.length > 0) {
    selectedShoes[0] = { name: userShoes[0].name, color: userShoes[0].color || 'black' };
  }
  if (tripDuration > 3) {
    if (userShoes.length > 1) {
      selectedShoes.push({ name: userShoes[1].name, color: userShoes[1].color || 'black' });
    } else {
      selectedShoes.push(pShoes[1 % pShoes.length]);
    }
  }

  // Permutation Maximization (Cartesian Product)
  const allOutfits = [];
  for (let t of selectedTops) {
    for (let b of selectedBottoms) {
      if (doColorsMatch(t.color, b.color)) {
         for (let s of selectedShoes) {
            if (doColorsMatch(b.color, s.color)) {
               allOutfits.push({ 
                 top: t, 
                 bottom: b, 
                 shoe: s,
                 thermalValue: getThermalValue(t) + getThermalValue(b)
               });
            }
         }
      }
    }
  }
  if (allOutfits.length === 0) {
    const defaultT = selectedTops[0];
    const defaultB = selectedBottoms[0];
    allOutfits.push({ top: defaultT, bottom: defaultB, shoe: selectedShoes[0], thermalValue: getThermalValue(defaultT) + getThermalValue(defaultB) });
  }
  
  const combos = [];
  // Wear scheduling: rotate garments instead of repeating the single
  // thermally-best outfit every day, and track what actually gets worn so
  // the packing list can be derived from the schedule.
  let wearCounts = {};
  const usedTops = new Set();
  const usedBottoms = new Set();
  const usedShoes = new Set();
  // Dressy activities whose days were covered by a real evening outfit
  // (so their generic "Formal Attire" placeholder items aren't packed too)
  const dressyCovered = new Set();
  for (let d = 0; d < tripDuration; d++) {
    const destName = dailyDestinations[d] || formDestinations[0] || 'Unknown';
    const destWeatherObj = weatherDataArray.find(w => w.locationName === destName) || weatherDataArray[d % weatherDataArray.length];
    const dailyWeather = destWeatherObj?.weather;
    const dateIndex = d % (dailyWeather?.time?.length || 1);
    
    const act = dailyActivities[d];
    let isEvening = false;
    if (act === 'nightout' || act === 'formal') {
       isEvening = true;
    }

    const maxTempC = dailyWeather ? dailyWeather.temperature_2m_max[dateIndex] : 20;
    
    // Calculate required thermal insulation based on max temp
    let requiredThermal = 3; // default for mild (20C)
    if (maxTempC < 0) requiredThermal = 12; // Freezing
    else if (maxTempC < 10) requiredThermal = 8; // Cold
    else if (maxTempC < 15) requiredThermal = 5; // Cool
    else if (maxTempC > 25) requiredThermal = 1; // Hot

    let dayOutfits = allOutfits.filter(o => isEvening ? (o.top.time === 'evening' || o.bottom.time === 'evening') : (o.top.time === 'day' && o.bottom.time === 'day'));
    if (dayOutfits.length === 0) dayOutfits = allOutfits;

    const isLaundryDay = laundryCycle !== 999 && d > 0 && d % laundryCycle === 0;
    if (isLaundryDay) wearCounts = {}; // laundry frees everything for rewear

    // Pick the outfit closest to the required thermal value, penalizing
    // garments already worn since the last laundry day so outfits rotate.
    let chosenOutfit = dayOutfits[0];
    let bestScore = Infinity;

    for (let o of dayOutfits) {
       const thermalDiff = Math.abs(o.thermalValue - requiredThermal);
       const wearPenalty = (wearCounts[o.top.name] || 0) + (wearCounts[o.bottom.name] || 0);
       const score = thermalDiff * 3 + wearPenalty * 2;
       if (score < bestScore) {
          bestScore = score;
          chosenOutfit = o;
       }
    }

    // Dressy activities (formal / night out) wear the real evening outfit
    // when the palette or wardrobe actually has evening pieces -- the
    // generic gear placeholder is only a fallback. Specialized activities
    // (ski, gym, hike...) always use their gear outfit.
    const gearDef = act && ACTIVITY_GEAR[act] ? ACTIVITY_GEAR[act].outfit : null;
    const isDressyAct = act === 'formal' || act === 'nightout';
    const hasEveningOutfit = chosenOutfit.top.time === 'evening' || chosenOutfit.bottom.time === 'evening';
    const useRealOutfit = !gearDef || (isDressyAct && hasEveningOutfit);

    if (useRealOutfit) {
      wearCounts[chosenOutfit.top.name] = (wearCounts[chosenOutfit.top.name] || 0) + 1;
      wearCounts[chosenOutfit.bottom.name] = (wearCounts[chosenOutfit.bottom.name] || 0) + 1;
      usedTops.add(chosenOutfit.top.name);
      usedBottoms.add(chosenOutfit.bottom.name);
      usedShoes.add(chosenOutfit.shoe.name);
      if (isDressyAct) dressyCovered.add(act);
    }

    let outfit = {
      top: chosenOutfit.top.name,
      bottom: chosenOutfit.bottom.name,
      shoe: chosenOutfit.shoe.name,
      outer: null
    };

    if (gearDef && !useRealOutfit) {
      outfit = {
        top: gearDef.top || outfit.top,
        bottom: gearDef.bottom || outfit.bottom,
        shoe: gearDef.shoe || outfit.shoe,
        outer: gearDef.outer || outfit.outer
      };
    }

    let displayWeather = 'Clear/Mild';
    let isCold = false;
    if (dailyWeather) {
       const precip = dailyWeather.precipitation_sum[dateIndex];
       if (precip > 5) displayWeather = 'Rainy';
       else if (maxTempC > 25) displayWeather = 'Sunny';
       else if (maxTempC < 10) { displayWeather = 'Cold'; isCold = true; }
    }

    // Stack outer layer if it's cold or if outfit alone isn't warm enough
    if (chosenOutfit.thermalValue < requiredThermal) {
       const outerTV = getThermalValue(selectedOuter);
       if (chosenOutfit.thermalValue + outerTV >= requiredThermal - 2) {
         outfit.outer = selectedOuter.name;
       } else if (isCold && (!act || !ACTIVITY_GEAR[act] || !ACTIVITY_GEAR[act].outfit)) {
         outfit.outer = 'Fleece + Rain Shell (Layered)';
       }
    }

    combos.push({
      day: d + 1,
      name: `Day ${d + 1} - ${displayWeather}`,
      temp: dailyWeather ? dailyWeather.temperature_2m_max[dateIndex] : 20,
      weather: displayWeather,
      activity: act || '',
      isLaundryDay,
      ...outfit
    });
  }

  // Layering Optimizer Checks
  let tripHasColdDay = combos.some(c => c.weather === 'Cold');
  if (tripHasColdDay) {
    const hasFleece = userTops.some(t => String(t.name || '').toLowerCase().includes('fleece'));
    if (!hasFleece) addItem({ category: 'clothes', id: 'layer-mid', name: 'Fleece Mid-Layer', vol: 800, weight: 300, priority: 10, isEssential: true, fold: 'ranger' });
    
    const hasShell = userOuter.some(o => String(o.name || '').toLowerCase().includes('shell') || String(o.name || '').toLowerCase().includes('windbreaker') || String(o.name || '').toLowerCase().includes('rain'));
    if (!hasShell) addItem({ category: 'clothes', id: 'layer-shell', name: 'Rain Shell / Windbreaker', vol: 600, weight: 250, priority: 10, isEssential: true, fold: 'bundle' });
  }

  // Push Clothes to Packing List
  const getSelectedItems = (names, catKey, defVol, defWeight) => {
    return names.map(n => {
      const nameStr = typeof n === 'string' ? n : (n.name || 'Unknown Item');
      const w = userWardrobe.find(item => item.name === nameStr && item.category === catKey);
      if (w) return { name: nameStr, vol: w.vol, weight: w.weight };
      return { name: nameStr, vol: defVol, weight: defWeight };
    });
  };

  // Pack from the schedule: only candidates the day scheduler actually
  // assigned get packed (candidates that were never worn are dead weight).
  const dedupeByName = (arr) => {
    const seen = new Set();
    return arr.filter(x => {
      if (seen.has(x.name)) return false;
      seen.add(x.name);
      return true;
    });
  };
  const packedTops = dedupeByName(selectedTops.filter(t => usedTops.has(t.name)));
  const packedBottoms = dedupeByName(selectedBottoms.filter(b => usedBottoms.has(b.name)));
  const packedShoes = dedupeByName(selectedShoes.filter(s => usedShoes.has(s.name)));

  const finalTops = getSelectedItems(packedTops.length > 0 ? packedTops : [selectedTops[0]], 'top', 300, 150);
  const finalBottoms = getSelectedItems(packedBottoms.length > 0 ? packedBottoms : [selectedBottoms[0]], 'bottom', 800, 400);
  const finalOuter = getSelectedItems([selectedOuter], 'outer', 1500, 800)[0];
  const finalShoes = getSelectedItems(packedShoes.length > 0 ? packedShoes : [selectedShoes[0]], 'shoe', 2500, 1000);

  finalTops.forEach((t, i) => addItem({ category: 'clothes', id: `top${i}`, name: t.name, vol: t.vol, weight: t.weight, priority: 9, isEssential: true, fold: 'konmari' }));
  finalBottoms.forEach((b, i) => addItem({ category: 'clothes', id: `bot${i}`, name: b.name, vol: b.vol, weight: b.weight, priority: 9, isEssential: true, fold: 'bundle' }));
  addItem({ category: 'clothes', id: 'out1', name: finalOuter.name, vol: finalOuter.vol, weight: finalOuter.weight, priority: 8, isEssential: false, fold: 'bundle' });
  finalShoes.forEach((s, i) => addItem({ category: 'clothes', id: `shoe${i}`, name: s.name, vol: s.vol, weight: s.weight, priority: 8, isEssential: i === 0 })); 

  // Activities (Daily configuration). Dressy activities whose days are
  // covered by real evening garments skip their generic placeholder items.
  const uniqueActivities = [...new Set(dailyActivities.filter(a => a))];
  uniqueActivities.forEach(act => {
    if (dressyCovered.has(act)) return;
    if (ACTIVITY_GEAR[act]) {
      ACTIVITY_GEAR[act].items.forEach(item => addItem(item));
    }
  });

  // Weather-driven extras: rain and sun protection
  const rainyDays = combos.filter(c => c.weather === 'Rainy').length;
  if (rainyDays >= 1) {
    addItem({ category: 'loose', id: 'wx-umbrella', name: 'Compact Travel Umbrella', vol: 600, weight: 350, priority: 8, isEssential: false, cube: 'loose' });
  }
  let maxUV = 0;
  weatherDataArray.forEach(w => {
    const uvArr = w?.weather?.uv_index_max;
    if (Array.isArray(uvArr)) uvArr.forEach(u => { if (typeof u === 'number' && u > maxUV) maxUV = u; });
  });
  const hasSunnyDay = combos.some(c => c.weather === 'Sunny');
  if (maxUV >= 6 || hasSunnyDay) {
    addItem({ category: 'loose', id: 'wx-sunglasses', name: 'Sunglasses', vol: 150, weight: 50, priority: 8, isEssential: false, cube: 'loose' });
    const alreadyHasSunscreen = allItems.some(i => String(i.name || '').toLowerCase().includes('sunscreen'));
    if (!alreadyHasSunscreen) {
      addItem({ category: 'toiletries', id: 'wx-sunscreen', name: 'Sunscreen (SPF 30+, TSA Size)', vol: 120, weight: 120, priority: 9, isEssential: false, isLiquid: true, cube: 'liquid' });
    }
  }

  // Base Items (with destination-aware adapter naming when every
  // destination shares one plug type)
  const adapterName = getAdapterSuggestion(countryCodes);
  ['toiletries', 'tech', 'documents'].forEach(category => {
    Object.entries(BASE_ITEMS[category]).forEach(([k, data]) => {
      const item = { category, id: k, ...data };
      if (k === 'e2' && adapterName) item.name = adapterName;
      addItem(item);
    });
  });

  // Tech Consolidator
  if (techPorts === 'usbc') {
    addItem({ category: 'tech', id: 'tech-usbc', name: '65W GaN Multi-Charger & 2x USB-C Cables', vol: 150, weight: 120, priority: 10, isEssential: true, cube: 'tech' });
  } else {
    addItem({ category: 'tech', id: 'tech-mix', name: 'Phone Charger & Laptop Power Brick', vol: 400, weight: 350, priority: 10, isEssential: true, cube: 'tech' });
  }

  // Travel Mode Injections
  if (travelMode === 'driving') {
    addItem({ category: 'tech', id: 'tm1', name: 'Car USB Charger', vol: 100, weight: 50, priority: 10, isEssential: true });
    addItem({ category: 'tech', id: 'tm2', name: 'Emergency Road Kit', vol: 3000, weight: 2000, priority: 8, isEssential: true });
    addItem({ category: 'toiletries', id: 'tm3', name: 'Road Trip Snacks', vol: 1500, weight: 500, priority: 8, isEssential: false });
  } else if (travelMode === 'train') {
    addItem({ category: 'clothes', id: 'tm4', name: 'Neck Pillow', vol: 2000, weight: 300, priority: 8, isEssential: false, fold: 'bundle' });
    addItem({ category: 'tech', id: 'tm5', name: 'Entertainment (Book/Tablet)', vol: 800, weight: 500, priority: 9, isEssential: true });
  } else if (travelMode === 'biking') {
    addItem({ category: 'clothes', id: 'tm6', name: 'Bike Helmet', vol: 3000, weight: 400, priority: 10, isEssential: true });
    addItem({ category: 'tech', id: 'tm7', name: 'U-Lock / Bike Lock', vol: 1000, weight: 1500, priority: 10, isEssential: true });
    addItem({ category: 'tech', id: 'tm8', name: 'Portable Pump & Patch Kit', vol: 500, weight: 300, priority: 10, isEssential: true });
    addItem({ category: 'toiletries', id: 'tm9', name: 'Water Bottle (Full)', vol: 1000, weight: 1000, priority: 10, isEssential: true });
    
    allItems.forEach(item => {
      if (item.weight > 800 || item.vol > 1500) {
        if (!item.isEssential) item.priority -= 2;
      }
    });
  }

  // Learned preferences: de-prioritize items the user has repeatedly
  // removed from past lists, so the knapsack drops them first.
  allItems.forEach(item => {
    if (item.isEssential) return;
    const removals = itemPreferences[item.name];
    if (removals > 0) item.priority = Math.max(0, item.priority - Math.min(3, removals));
  });

  // Worn on Travel Day Subtractor
  const clothesAndShoes = allItems.filter(i => i.category === 'clothes');
  const topsInList = clothesAndShoes.filter(i => i.id.startsWith('top') || String(i.name || '').toLowerCase().includes('shirt') || String(i.name || '').toLowerCase().includes('fleece') || String(i.name || '').toLowerCase().includes('base')).sort((a,b) => b.vol - a.vol);
  const botsInList = clothesAndShoes.filter(i => i.id.startsWith('bot') || String(i.name || '').toLowerCase().includes('pant') || String(i.name || '').toLowerCase().includes('jeans')).sort((a,b) => b.vol - a.vol);
  const outersInList = clothesAndShoes.filter(i => i.id.startsWith('out') || String(i.name || '').toLowerCase().includes('jacket') || String(i.name || '').toLowerCase().includes('shell') || String(i.name || '').toLowerCase().includes('coat')).sort((a,b) => b.vol - a.vol);
  const shoesInList = clothesAndShoes.filter(i => i.id.startsWith('shoe') || String(i.name || '').toLowerCase().includes('shoe') || String(i.name || '').toLowerCase().includes('boot')).sort((a,b) => b.vol - a.vol);

  const wornItems = [topsInList[0], botsInList[0], outersInList[0], shoesInList[0]].filter(Boolean);
  
  wornItems.forEach(wi => {
    const idx = allItems.findIndex(item => item.id === wi.id);
    if (idx !== -1) {
      allItems[idx].category = 'plane';
      allItems[idx].isWorn = true;
    }
  });

  // VOLUME + WEIGHT OPTIMIZATION (2-constraint 0/1 Knapsack)
  // Volume is constrained by the suitcase; weight is constrained by the
  // 7 kg budget-airline carry-on allowance when flying (previously the
  // weight limit was only an advisory warning in the UI).
  let currentVolume = allItems.filter(i => !i.isWorn).reduce((sum, item) => sum + item.vol, 0);
  const packedWeightPrePrune = allItems.filter(i => !i.isWorn).reduce((sum, item) => sum + item.weight, 0);

  const WEIGHT_LIMIT = 7000;
  const volumeConstrained = suitcaseVolume > 0;
  const weightConstrained = travelMode === 'flying';
  const volOver = volumeConstrained && currentVolume > suitcaseVolume;
  const weightOver = weightConstrained && packedWeightPrePrune > WEIGHT_LIMIT;

  if (volOver || weightOver) {
    const essentialItems = allItems.filter(i => i.isWorn || i.isEssential || i.priority >= 10);
    const optionalItems = allItems.filter(i => !i.isWorn && !i.isEssential && i.priority < 10);

    const essentialVol = essentialItems.reduce((sum, item) => sum + (item.isWorn ? 0 : item.vol), 0);
    const essentialWeight = essentialItems.reduce((sum, item) => sum + (item.isWorn ? 0 : item.weight), 0);
    const totalOptVol = optionalItems.reduce((s, i) => s + i.vol, 0);
    const totalOptWeight = optionalItems.reduce((s, i) => s + i.weight, 0);

    // An unconstrained dimension gets a capacity that fits everything,
    // reducing the DP to the single-constraint case.
    const remainingVol = volumeConstrained ? suitcaseVolume - essentialVol : totalOptVol;
    const remainingWeight = weightConstrained ? WEIGHT_LIMIT - essentialWeight : totalOptWeight;

    if (remainingVol <= 0 || remainingWeight <= 0) {
      // Essentials alone exceed a limit. Drop all optionals.
      optionalItems.forEach(i => i.removed = true);
    } else {
      const SCALE_V = 100;
      const SCALE_W = 250;
      const capV = Math.floor(remainingVol / SCALE_V);
      const capW = Math.floor(remainingWeight / SCALE_W);
      const n = optionalItems.length;
      // dp[i][c][k]: best priority sum using the first i items within
      // volume budget c and weight budget k
      const dp = Array.from({ length: n + 1 }, () =>
        Array.from({ length: capV + 1 }, () => Array(capW + 1).fill(0))
      );

      for (let i = 1; i <= n; i++) {
        const item = optionalItems[i - 1];
        const wv = Math.ceil(item.vol / SCALE_V);
        const ww = Math.ceil(item.weight / SCALE_W);
        const v = item.priority; // value is priority

        for (let c = 0; c <= capV; c++) {
          for (let k = 0; k <= capW; k++) {
            dp[i][c][k] = dp[i - 1][c][k];
            if (wv <= c && ww <= k && dp[i - 1][c - wv][k - ww] + v > dp[i][c][k]) {
              dp[i][c][k] = dp[i - 1][c - wv][k - ww] + v;
            }
          }
        }
      }

      // Backtrack
      let c = capV;
      let k = capW;
      const keptItems = new Set();
      for (let i = n; i > 0; i--) {
        if (dp[i][c][k] !== dp[i - 1][c][k]) {
          const item = optionalItems[i - 1];
          keptItems.add(item.id);
          c -= Math.ceil(item.vol / SCALE_V);
          k -= Math.ceil(item.weight / SCALE_W);
        }
      }

      // Mark unkept optionals as removed
      optionalItems.forEach(item => {
        if (!keptItems.has(item.id)) {
          item.removed = true;
        }
      });
    }
  }

  allItems = allItems.filter(item => !item.removed);

  const grouped = { plane: [], main: [], base: [], loose: [], liquid: [], dry: [], tech: [] }; allItems.forEach(item => {
    if (item.category === 'plane') {
      grouped.plane.push(item);
    } else if (item.cube && grouped[item.cube]) {
      grouped[item.cube].push(item);
    } else {
      grouped.main.push(item);
    }
  });

  // Re-calculate derived totals after pruning (worn/plane items don't take suitcase space)
  const packedItems = allItems.filter(i => !i.isWorn);
  currentVolume = packedItems.reduce((sum, item) => sum + item.vol, 0);
  let currentWeight = packedItems.reduce((sum, item) => sum + item.weight, 0);

  return {
    list: grouped,
    currentVolume,
    currentWeight,
    outfitCombinations: combos
  };
};
