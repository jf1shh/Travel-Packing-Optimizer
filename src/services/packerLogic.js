export const PALETTES = {
  'quiet-luxury': {
    name: 'Quiet Luxury',
    tops: ['Cashmere Crewneck', 'Silk Button-down', 'Merino Turtleneck', 'Crisp White Tee'],
    bottoms: ['Tailored Trousers', 'Dark Wash Denim', 'Pleated Skirt'],
    outerwear: ['Camel Trench Coat', 'Structured Wool Blazer'],
    shoes: ['Leather Loafers', 'Minimalist White Sneakers', 'Suede Chelsea Boots'],
    colors: ['#f5f5dc', '#1a1a1a', '#8b7355'] // beige, black, taupe
  },
  'gorpcore': {
    name: 'Gorpcore',
    tops: ['Technical Base Layer', 'Fleece Half-Zip', 'Graphic Climbing Tee', 'Merino Wool Top'],
    bottoms: ['Cargo Hiking Pants', 'Waterproof Trousers', 'Nylon Shorts'],
    outerwear: ['Gore-Tex Shell', 'Puffer Vest', 'Windbreaker'],
    shoes: ['Trail Running Shoes', 'Hiking Boots', 'Salomon Sneakers'],
    colors: ['#4a5d23', '#cc5500', '#2f4f4f'] // olive, burnt orange, dark slate
  },
  'scandi': {
    name: 'Scandi Minimalist',
    tops: ['Oversized Poplin Shirt', 'Chunky Knit Sweater', 'Boxy T-Shirt', 'Striped Long-sleeve'],
    bottoms: ['Wide-leg Jeans', 'Linen Trousers', 'Midi Slip Skirt'],
    outerwear: ['Oversized Wool Coat', 'Quilted Liner Jacket'],
    shoes: ['Chunky Boots', 'Slip-on Mules', 'Retro Sneakers'],
    colors: ['#e8e8e8', '#4b5320', '#36454f'] // off-white, army green, charcoal
  },
  'y2k': {
    name: 'Y2K Streetwear',
    tops: ['Baby Tee', 'Oversized Graphic Hoodie', 'Mesh Top', 'Velour Zip-up'],
    bottoms: ['Parachute Pants', 'Low-rise Baggy Jeans', 'Cargo Mini Skirt'],
    outerwear: ['Cropped Puffer', 'Vintage Leather Racing Jacket'],
    shoes: ['Platform Sneakers', 'Chunky Skate Shoes', 'Combat Boots'],
    colors: ['#ff00ff', '#000000', '#00ffff'] // magenta, black, cyan
  },
  'dark-academia': {
    name: 'Dark Academia',
    tops: ['Tweed Vest', 'Cable Knit Sweater', 'Oxford Shirt', 'Ribbed Turtleneck'],
    bottoms: ['Plaid Trousers', 'Corduroy Pants', 'Pleated Midi Skirt'],
    outerwear: ['Tweed Blazer', 'Long Wool Overcoat'],
    shoes: ['Oxford Shoes', 'Leather Brogues', 'Lace-up Boots'],
    colors: ['#3e2723', '#1b5e20', '#4e342e'] // dark brown, forest green, sepia
  },
  'athleisure': {
    name: 'Athleisure',
    tops: ['Seamless Crop Top', 'Performance Hoodie', 'Quarter-Zip Pullover', 'Dri-FIT Tee'],
    bottoms: ['Compression Leggings', 'Joggers', 'Biker Shorts'],
    outerwear: ['Nylon Track Jacket', 'Fleece Zip-Up'],
    shoes: ['Running Sneakers', 'Recovery Slides', 'Trainer Shoes'],
    colors: ['#cfd8dc', '#263238', '#00bcd4'] // steel gray, deep dark gray, cyan
  },
  'bohemian': {
    name: 'Bohemian / Resort',
    tops: ['Crochet Halter', 'Linen Button-down', 'Flowy Peasant Blouse', 'Silk Cami'],
    bottoms: ['Tiered Maxi Skirt', 'Wide-leg Linen Pants', 'Denim Cutoffs'],
    outerwear: ['Fringed Kimono', 'Lightweight Duster'],
    shoes: ['Strappy Leather Sandals', 'Espadrilles', 'Suede Ankle Boots'],
    colors: ['#d2b48c', '#cd5c5c', '#8fbc8f'] // tan, indian red, sea green
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
  }
};

const BASE_ITEMS = {
  toiletries: {
    t1: { name: 'Toothbrush & Travel Paste', vol: 100, weight: 80, priority: 10, isEssential: true },
    t2: { name: 'Deodorant', vol: 120, weight: 100, priority: 10, isEssential: true },
    t3: { name: 'Travel Shampoo/Conditioner (TSA Size)', vol: 200, weight: 220, priority: 8, isEssential: false },
    t4: { name: 'Moisturizer & Lip Balm', vol: 150, weight: 120, priority: 7, isEssential: true },
    t5: { name: 'Nail Clippers & Tweezers', vol: 50, weight: 40, priority: 5, isEssential: false },
    t6: { name: 'Prescription Meds & Painkillers', vol: 100, weight: 50, priority: 10, isEssential: true }
  },
  tech: {
    e1: { name: 'Phone Charger & Cable', vol: 150, weight: 100, priority: 10, isEssential: true },
    e2: { name: 'Universal Travel Adapter', vol: 250, weight: 150, priority: 9, isEssential: true },
    e3: { name: 'Power Bank (10,000mAh)', vol: 300, weight: 250, priority: 8, isEssential: true },
    e4: { name: 'Wireless Earbuds', vol: 100, weight: 50, priority: 9, isEssential: true }
  },
  documents: {
    d1: { name: 'Passport / ID', vol: 20, weight: 30, priority: 10, isEssential: true },
    d2: { name: 'Credit Cards & Cash', vol: 50, weight: 50, priority: 10, isEssential: true }
  }
};

export const generatePackingList = (weatherDataArray, tripDuration, gender, suitcaseVolume, paletteKey = 'quiet-luxury', travelMode = 'flying', activities = {}) => {
  let allItems = [];
  let combinations = [];

  const p = PALETTES[paletteKey] || PALETTES['quiet-luxury'];
  
  const addItem = (item) => {
    allItems.push({ ...item, checked: false });
  };

  // Base Layers
  const baseLayerCount = Math.min(tripDuration, 7); 
  addItem({ category: 'clothes', id: 'w1', name: `${baseLayerCount}x Pairs of Underwear`, vol: 150 * baseLayerCount, weight: 50 * baseLayerCount, priority: 10, isEssential: true, fold: 'ranger' });
  addItem({ category: 'clothes', id: 'w2', name: `${baseLayerCount}x Pairs of Socks`, vol: 100 * baseLayerCount, weight: 40 * baseLayerCount, priority: 10, isEssential: true, fold: 'shoes' });
  
  if (tripDuration > 7) {
    addItem({ category: 'toiletries', id: 't-laundry', name: 'Travel Laundry Detergent Packets', vol: 100, weight: 100, priority: 10, isEssential: true });
  }

  addItem({ category: 'clothes', id: 'w3', name: 'Pajamas / Sleepwear', vol: 400, weight: 200, priority: 9, isEssential: true, fold: 'konmari' });

  // Outfits
  let selectedTops = [];
  let selectedBottoms = [];
  let selectedOuter = p.outerwear[0];
  let selectedShoes = [p.shoes[0]]; 

  const topsNeeded = Math.min(tripDuration, 3); 
  const bottomsNeeded = tripDuration > 3 ? 2 : 1;

  for (let i = 0; i < topsNeeded; i++) {
    selectedTops.push(p.tops[i % p.tops.length]);
  }
  for (let i = 0; i < bottomsNeeded; i++) {
    selectedBottoms.push(p.bottoms[i % p.bottoms.length]);
  }
  if (tripDuration > 3) {
    selectedShoes.push(p.shoes[1 % p.shoes.length]);
  }

  const combos = [];
  for (let t = 0; t < selectedTops.length; t++) {
    for (let b = 0; b < selectedBottoms.length; b++) {
      for (let s = 0; s < selectedShoes.length; s++) {
        combos.push({
          top: selectedTops[t],
          bottom: selectedBottoms[b],
          shoe: selectedShoes[s],
          outer: (t % 2 === 0) ? selectedOuter : null 
        });
      }
    }
  }

  for (let d = 0; d < tripDuration; d++) {
    const dailyWeather = weatherDataArray[d % weatherDataArray.length]?.weather;
    const dateIndex = d % (dailyWeather?.time?.length || 1);
    
    const comboIndex = d % combos.length;
    const outfit = combos[comboIndex];

    let displayWeather = 'Clear/Mild';
    if (dailyWeather) {
       const precip = dailyWeather.precipitation_sum[dateIndex];
       const temp = dailyWeather.temperature_2m_max[dateIndex];
       if (precip > 5) displayWeather = 'Rainy';
       else if (temp > 25) displayWeather = 'Sunny';
       else if (temp < 10) displayWeather = 'Cold';
    }

    combinations.push({
      day: d + 1,
      name: `Day ${d + 1}`,
      temp: dailyWeather ? dailyWeather.temperature_2m_max[dateIndex] : 20,
      weather: displayWeather,
      ...outfit
    });
  }

  // Push Clothes to Packing List
  selectedTops.forEach((t, i) => addItem({ category: 'clothes', id: `top${i}`, name: t, vol: 300, weight: 150, priority: 9, isEssential: true, fold: 'konmari' }));
  selectedBottoms.forEach((b, i) => addItem({ category: 'clothes', id: `bot${i}`, name: b, vol: 800, weight: 400, priority: 9, isEssential: true, fold: 'bundle' }));
  addItem({ category: 'clothes', id: 'out1', name: selectedOuter, vol: 1500, weight: 800, priority: 8, isEssential: false, fold: 'bundle' });
  selectedShoes.forEach((s, i) => addItem({ category: 'clothes', id: `shoe${i}`, name: s, vol: 2500, weight: 1000, priority: 8, isEssential: i === 0 })); 

  // Activities (Initial configuration)
  Object.keys(activities).forEach(act => {
    if (activities[act] && ACTIVITY_GEAR[act]) {
      ACTIVITY_GEAR[act].items.forEach(item => addItem(item));
    }
  });

  // Base Items
  ['toiletries', 'tech', 'documents'].forEach(category => {
    Object.entries(BASE_ITEMS[category]).forEach(([k, data]) => {
      addItem({ category, id: k, ...data });
    });
  });

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

  // VOLUME OPTIMIZATION
  let currentVolume = allItems.reduce((sum, item) => sum + item.vol, 0);
  let currentWeight = allItems.reduce((sum, item) => sum + item.weight, 0);

  if (suitcaseVolume > 0 && currentVolume > suitcaseVolume) {
    allItems.sort((a, b) => a.priority - b.priority); 
    for (let i = 0; i < allItems.length; i++) {
      if (currentVolume <= suitcaseVolume) break;
      if (!allItems[i].isEssential) {
        currentVolume -= allItems[i].vol;
        currentWeight -= allItems[i].weight;
        allItems[i].removed = true;
      }
    }
  }

  allItems = allItems.filter(item => !item.removed);

  const grouped = { clothes: [], toiletries: [], tech: [], documents: [] };
  allItems.forEach(item => {
    if (grouped[item.category]) {
      grouped[item.category].push(item);
    }
  });

  // Re-calculate derived totals after pruning
  currentVolume = allItems.reduce((sum, item) => sum + item.vol, 0);
  currentWeight = allItems.reduce((sum, item) => sum + item.weight, 0);

  return {
    list: grouped,
    currentVolume,
    currentWeight,
    outfitCombinations: combinations
  };
};
