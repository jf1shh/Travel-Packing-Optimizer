const ITEM_DATA = {
  // Toiletries
  't1': { vol: 100, priority: 10, isEssential: true },
  't2': { vol: 150, priority: 9, isEssential: true },
  't3': { vol: 300, priority: 7, isEssential: false },
  't4': { vol: 250, priority: 6, isEssential: false },
  't5': { vol: 500, priority: 7, isEssential: false },
  
  // Tech
  'e1': { vol: 1500, priority: 10, isEssential: true },
  'e2': { vol: 150, priority: 10, isEssential: true },
  'e3': { vol: 300, priority: 5, isEssential: false },

  // Docs
  'd1': { vol: 50, priority: 10, isEssential: true },
  'd2': { vol: 20, priority: 10, isEssential: true },
  'd3': { vol: 50, priority: 8, isEssential: false },

  // Generic weather
  'w1': { vol: 4000, priority: 9, isEssential: true },
  'w2': { vol: 500, priority: 6, isEssential: false, fold: 'shoes' },
  'w3': { vol: 600, priority: 8, isEssential: true, fold: 'ranger' },
  'w5': { vol: 100, priority: 5, isEssential: false },
  'r1': { vol: 500, priority: 7, isEssential: false },
  'r2': { vol: 2500, priority: 6, isEssential: false },
};

const PALETTES = {
  'quiet-luxury': {
    male: {
      outer: 'Unstructured Blazer',
      bottoms: ['Pleated Wool Trousers', 'Linen Chinos'],
      tops: ['Cashmere Half-Zip', 'Crisp White Oxford', 'Silk Blend Polo'],
      shoes: ['Loro Piana Loafers', 'Minimal Leather Sneakers']
    },
    female: {
      outer: 'Cashmere Wrap Coat',
      bottoms: ['Tailored Wide-Leg Trousers', 'Silk Midi Skirt'],
      tops: ['Silk Blouse', 'Merino Wool Turtleneck', 'Cashmere Tee'],
      shoes: ['Suede Mules', 'Leather Flats']
    },
    other: {
      outer: 'Unstructured Blazer',
      bottoms: ['Pleated Wool Trousers', 'Tailored Chinos'],
      tops: ['Cashmere Half-Zip', 'Silk Blouse', 'Merino Wool Polo'],
      shoes: ['Suede Loafers', 'Minimal Leather Sneakers']
    }
  },
  'gorpcore': {
    male: {
      outer: "Arc'teryx Beta Shell",
      bottoms: ['Technical Cargo Pants', 'Climbing Trousers'],
      tops: ['Merino Wool Base', 'Technical Fleece', 'Breathable Trail Shirt'],
      shoes: ['Salomon XT-6 Sneakers', 'Hoka Trail Shoes']
    },
    female: {
      outer: 'Gore-Tex Anorak',
      bottoms: ['Utility Parachute Pants', 'Technical Leggings'],
      tops: ['Merino Wool Base', 'Technical Fleece', 'Performance Crop'],
      shoes: ['Hoka Trail Shoes', 'Salomon XT-4']
    },
    other: {
      outer: "Arc'teryx Beta Shell",
      bottoms: ['Technical Cargo Pants', 'Utility Parachute Pants'],
      tops: ['Merino Wool Base', 'Technical Fleece', 'Breathable Trail Shirt'],
      shoes: ['Salomon XT-6 Sneakers', 'Hoka Trail Shoes']
    }
  },
  'scandi': {
    male: {
      outer: 'Oversized Topcoat',
      bottoms: ['Raw Denim', 'Wide-Leg Trousers'],
      tops: ['Chunky Knit Turtleneck', 'Boxy Heavyweight Tee', 'Minimalist Button-Up'],
      shoes: ['White Leather Sneakers', 'Chunky Derbies']
    },
    female: {
      outer: 'Tailored Maxi Coat',
      bottoms: ['Wide-leg Denim', 'Flowy Trousers'],
      tops: ['Boxy Striped Knit', 'Oversized Button-Up', 'Clean White Tee'],
      shoes: ['Clean White Sneakers', 'Chunky Loafers']
    },
    other: {
      outer: 'Oversized Topcoat',
      bottoms: ['Wide-leg Denim', 'Raw Denim'],
      tops: ['Chunky Knit Turtleneck', 'Boxy Striped Knit', 'Heavyweight Tee'],
      shoes: ['White Leather Sneakers', 'Chunky Derbies']
    }
  },
  'streetwear': {
    male: {
      outer: 'Vintage Racing Jacket',
      bottoms: ['Baggy Parachute Pants', 'Jorts'],
      tops: ['Graphic Baby Tee', 'Vintage Hoodie', 'Mesh Long-sleeve'],
      shoes: ['Chunky Skate Shoes', 'Retro Jordans']
    },
    female: {
      outer: 'Cropped Puffer Jacket',
      bottoms: ['Low-rise Cargo Pants', 'Baggy Denim'],
      tops: ['Graphic Baby Tee', 'Mesh Long-sleeve', 'Corset Top'],
      shoes: ['Platform Boots', 'Chunky Skate Shoes']
    },
    other: {
      outer: 'Vintage Racing Jacket',
      bottoms: ['Baggy Parachute Pants', 'Baggy Denim'],
      tops: ['Graphic Baby Tee', 'Mesh Long-sleeve', 'Vintage Hoodie'],
      shoes: ['Chunky Skate Shoes', 'Platform Boots']
    }
  }
};

export const generatePackingList = (weatherDataArray, tripDuration, gender, suitcaseVolume, paletteKey = 'navy-grey', activities = {}) => {
  let allItems = [];
  let combinations = [];

  const addItem = (category, id, name, vol = 500, priority = 5, isEssential = false, fold = null) => {
    allItems.push({ id, category, name, checked: false, vol, priority, isEssential, fold });
  };

  const days = parseInt(tripDuration) || 1;
  const p = PALETTES[paletteKey][gender];

  // 1. Generate Base Casual Capsule
  addItem('clothes', 'outer', p.outer, 2500, 10, true, 'bundle');
  
  const selectedBottoms = days > 3 ? p.bottoms : [p.bottoms[0]];
  selectedBottoms.forEach((b, i) => addItem('clothes', `b${i}`, b, 1500, 10, true, 'konmari'));

  const selectedTops = p.tops.slice(0, Math.min(days, 3));
  selectedTops.forEach((t, i) => addItem('clothes', `t${i}`, t, 600, 9, true, 'ranger'));

  addItem('clothes', 's1', p.shoes[0], 2500, 10, true, null);
  if (days > 2) addItem('clothes', 's2', p.shoes[1], 2000, 7, false, null);

  addItem('clothes', 'u1', `${days + 2}x Underwear & Socks`, (days+2)*250, 10, true, 'ranger');
  addItem('clothes', 'pj1', 'Pajamas / Sleepwear', 800, 10, true, 'ranger');

  // Generate Base Outfits Combinatorics
  selectedTops.forEach((top, tIdx) => {
    selectedBottoms.forEach((bottom, bIdx) => {
      combinations.push({
        name: `Day Look ${combinations.length + 1}`,
        top,
        bottom,
        outer: (tIdx % 2 === 0) ? p.outer : null,
        shoe: (bIdx === 0) ? p.shoes[0] : (p.shoes[1] || p.shoes[0]),
      });
    });
  });
  combinations = combinations.slice(0, Math.max(days, 3));

  // 2. Activity Injections
  if (activities.formal) {
    const formalTop = gender === 'female' ? 'Elegant Blouse' : 'Dress Shirt';
    const formalBottom = gender === 'female' ? 'Formal Skirt / Dress' : 'Suit Trousers';
    const formalShoe = gender === 'female' ? 'Dress Heels/Flats' : 'Dress Shoes';
    const formalOuter = gender === 'female' ? 'Evening Wrap' : 'Suit Blazer';
    
    addItem('clothes', 'f1', formalTop, 600, 9, true, 'bundle');
    if (gender !== 'female') addItem('clothes', 'f2', formalBottom, 1500, 9, true, 'bundle');
    addItem('clothes', 'f3', formalShoe, 2000, 9, true, null);
    addItem('clothes', 'f4', formalOuter, 2500, 8, true, 'bundle');
    
    combinations.push({
      name: 'Evening / Formal Look',
      top: formalTop,
      bottom: gender === 'female' ? formalBottom : formalBottom,
      outer: formalOuter,
      shoe: formalShoe
    });
  }

  if (activities.gym) {
    addItem('clothes', 'g1', 'Workout Top & Shorts', 800, 8, true, 'ranger');
    addItem('clothes', 'g2', 'Athletic Shoes', 2500, 8, true, 'shoes');
    combinations.push({ name: 'Gym / Active Look', top: 'Workout Top', bottom: 'Workout Shorts', outer: null, shoe: 'Athletic Shoes' });
  }

  if (activities.beach) {
    addItem('clothes', 'b1', 'Swimsuit / Trunks', 300, 10, true, 'ranger');
    addItem('clothes', 'b2', 'Sandals / Flip Flops', 1000, 9, true, null);
    addItem('clothes', 'b3', 'Beach Towel', 1500, 6, false, 'konmari');
    combinations.push({ name: 'Beach / Pool Look', top: 'Swimwear', bottom: 'Beach Towel', outer: null, shoe: 'Sandals' });
  }

  if (activities.hike) {
    addItem('clothes', 'h1', 'Hiking Pants / Leggings', 1200, 9, true, 'konmari');
    addItem('clothes', 'h2', 'Moisture-wicking Shirt', 500, 9, true, 'ranger');
    addItem('clothes', 'h3', 'Hiking Boots / Trail Shoes', 3500, 10, true, 'shoes');
    combinations.push({ name: 'Trail / Hiking Look', top: 'Wicking Shirt', bottom: 'Hiking Pants', outer: 'Rain Shell', shoe: 'Hiking Boots' });
  }

  // 3. Global Weather Extremes
  let globalMaxTemp = -Infinity;
  let globalMinTemp = Infinity;
  let globalRain = 0;

  weatherDataArray?.forEach(({ weather }) => {
    if (weather) {
      const maxes = weather.temperature_2m_max || [];
      const mins = weather.temperature_2m_min || [];
      const rain = weather.precipitation_sum || [];
      
      const cityMax = Math.max(...maxes);
      const cityMin = Math.min(...mins);
      const cityRain = rain.reduce((a, b) => a + b, 0);

      if (cityMax > globalMaxTemp) globalMaxTemp = cityMax;
      if (cityMin < globalMinTemp) globalMinTemp = cityMin;
      globalRain += cityRain;
    }
  });

  if (globalMinTemp < 15 && globalMinTemp !== Infinity) {
    addItem('clothes', 'w1', 'Warm Overcoat / Puffer', 4000, 9, true);
    addItem('clothes', 'w2', 'Gloves and Beanie', 500, 8, false, 'shoes');
  }
  if (globalMaxTemp > 25 && globalMaxTemp !== -Infinity) {
    addItem('clothes', 'w5', 'Sunglasses & Sun Hat', 300, 8, true);
  }
  if (globalRain > 5) {
    addItem('clothes', 'r1', 'Compact Umbrella', 500, 9, true);
    addItem('clothes', 'r2', 'Rain Jacket / Shell', 1500, 8, false, 'bundle');
  }

  // Toiletries & Tech
  Object.keys(ITEM_DATA).forEach(k => {
    const data = ITEM_DATA[k];
    let name = '';
    let category = '';
    if (k.startsWith('t')) { category = 'toiletries'; name = ['Toothbrush set', 'Deodorant', 'Skincare', 'Hair product', 'Grooming Kit'][parseInt(k[1])-1]; }
    else if (k.startsWith('e')) { category = 'tech'; name = ['Laptop', 'Charger', 'Power Bank'][parseInt(k[1])-1]; }
    else if (k.startsWith('d')) { category = 'documents'; name = ['Passport / ID', 'Tickets / Itinerary', 'Cards / Cash'][parseInt(k[1])-1]; }
    else return;

    if (name) addItem(category, k, name, data.vol, data.priority, data.isEssential, data.fold);
  });

  // VOLUME OPTIMIZATION
  let currentVolume = allItems.reduce((sum, item) => sum + item.vol, 0);
  
  if (suitcaseVolume > 0 && currentVolume > suitcaseVolume) {
    allItems.sort((a, b) => a.priority - b.priority);
    for (let i = 0; i < allItems.length; i++) {
      if (!allItems[i].isEssential) {
        currentVolume -= allItems[i].vol;
        allItems[i].removed = true;
        if (currentVolume <= suitcaseVolume) break;
      }
    }
  }

  const finalItems = allItems.filter(item => !item.removed);
  
  const categorizedList = {
    clothes: finalItems.filter(i => i.category === 'clothes'),
    toiletries: finalItems.filter(i => i.category === 'toiletries'),
    tech: finalItems.filter(i => i.category === 'tech'),
    documents: finalItems.filter(i => i.category === 'documents'),
  };

  return { 
    list: categorizedList, 
    currentVolume,
    outfitCombinations: combinations
  };
};
