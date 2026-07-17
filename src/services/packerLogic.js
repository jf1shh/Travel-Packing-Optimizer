const ITEM_DATA = {
  // Toiletries
  't1': { vol: 100, weight: 80, priority: 10, isEssential: true },
  't2': { vol: 150, weight: 120, priority: 9, isEssential: true },
  't3': { vol: 300, weight: 300, priority: 7, isEssential: false },
  't4': { vol: 250, weight: 200, priority: 6, isEssential: false },
  't5': { vol: 500, weight: 450, priority: 7, isEssential: false },
  
  // Tech
  'e1': { vol: 1500, weight: 1400, priority: 10, isEssential: true },
  'e2': { vol: 150, weight: 200, priority: 10, isEssential: true },
  'e3': { vol: 300, weight: 350, priority: 5, isEssential: false },

  // Docs
  'd1': { vol: 50, weight: 30, priority: 10, isEssential: true },
  'd2': { vol: 20, weight: 10, priority: 10, isEssential: true },
  'd3': { vol: 50, weight: 40, priority: 8, isEssential: false },

  // Generic weather
  'w1': { vol: 4000, weight: 1200, priority: 9, isEssential: true },
  'w2': { vol: 500, weight: 150, priority: 6, isEssential: false, fold: 'shoes' },
  'w3': { vol: 600, weight: 200, priority: 8, isEssential: true, fold: 'ranger' },
  'w5': { vol: 100, weight: 50, priority: 5, isEssential: false },
  'r1': { vol: 500, weight: 300, priority: 7, isEssential: false },
  'r2': { vol: 1500, weight: 400, priority: 6, isEssential: false },
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
  },
  'dark-academia': {
    male: {
      outer: 'Tweed Blazer',
      bottoms: ['Corduroy Trousers', 'Wool Slacks'],
      tops: ['Cable Knit Sweater', 'Oxford Shirt', 'Turtleneck'],
      shoes: ['Leather Brogues', 'Chelsea Boots']
    },
    female: {
      outer: 'Plaid Trench Coat',
      bottoms: ['Pleated Plaid Skirt', 'Tailored Trousers'],
      tops: ['Peter Pan Collar Blouse', 'Chunky Cardigan', 'Ribbed Turtleneck'],
      shoes: ['Oxford Shoes', 'Knee-High Boots']
    },
    other: {
      outer: 'Tweed Blazer',
      bottoms: ['Corduroy Trousers', 'Tailored Trousers'],
      tops: ['Cable Knit Sweater', 'Oxford Shirt', 'Turtleneck'],
      shoes: ['Leather Brogues', 'Chelsea Boots']
    }
  },
  'athleisure': {
    male: {
      outer: 'Windbreaker',
      bottoms: ['Joggers', 'Athletic Shorts'],
      tops: ['Performance Hoodie', 'Dri-Fit Tee', 'Quarter-Zip'],
      shoes: ['Running Shoes', 'Slip-on Trainers']
    },
    female: {
      outer: 'Cropped Windbreaker',
      bottoms: ['Flared Leggings', 'Bike Shorts'],
      tops: ['Oversized Hoodie', 'Seamless Crop Top', 'Performance Tank'],
      shoes: ['Running Shoes', 'Chunky Trainers']
    },
    other: {
      outer: 'Windbreaker',
      bottoms: ['Joggers', 'Flared Leggings'],
      tops: ['Performance Hoodie', 'Seamless Crop Top', 'Quarter-Zip'],
      shoes: ['Running Shoes', 'Slip-on Trainers']
    }
  },
  'bohemian': {
    male: {
      outer: 'Linen Overshirt',
      bottoms: ['Linen Trousers', 'Relaxed Chinos'],
      tops: ['Knit Polo', 'Printed Rayon Shirt', 'Breezy Tank'],
      shoes: ['Leather Sandals', 'Espadrilles']
    },
    female: {
      outer: 'Crochet Cardigan',
      bottoms: ['Flowy Maxi Skirt', 'Linen Wide-Leg Pants'],
      tops: ['Peasant Blouse', 'Crochet Top', 'Off-shoulder Top'],
      shoes: ['Strappy Sandals', 'Wedge Espadrilles']
    },
    other: {
      outer: 'Linen Overshirt',
      bottoms: ['Flowy Maxi Skirt', 'Relaxed Chinos'],
      tops: ['Peasant Blouse', 'Printed Rayon Shirt', 'Crochet Top'],
      shoes: ['Leather Sandals', 'Espadrilles']
    }
  }
};

export const generatePackingList = (weatherDataArray, tripDuration, gender, suitcaseVolume, paletteKey = 'quiet-luxury', activities = {}) => {
  let allItems = [];
  let combinations = [];

  const addItem = ({ category, id, name, vol = 500, weight = 250, priority = 5, isEssential = false, fold = null }) => {
    allItems.push({ id, category, name, checked: false, vol, weight, priority, isEssential, fold });
  };

  const days = parseInt(tripDuration) || 1;
  const p = PALETTES[paletteKey]?.[gender] || PALETTES['quiet-luxury'][gender];

  // 1. Generate Base Casual Capsule
  addItem({ category: 'clothes', id: 'outer', name: p.outer, vol: 2500, weight: 800, priority: 10, isEssential: true, fold: 'bundle' });
  
  const selectedBottoms = days > 3 ? p.bottoms : [p.bottoms[0]];
  selectedBottoms.forEach((b, i) => addItem({ category: 'clothes', id: `b${i}`, name: b, vol: 1500, weight: 500, priority: 10, isEssential: true, fold: 'konmari' }));

  const selectedTops = p.tops.slice(0, Math.min(days, 3));
  selectedTops.forEach((t, i) => addItem({ category: 'clothes', id: `t${i}`, name: t, vol: 600, weight: 250, priority: 9, isEssential: true, fold: 'ranger' }));

  addItem({ category: 'clothes', id: 's1', name: p.shoes[0], vol: 2500, weight: 900, priority: 10, isEssential: true, fold: null });
  if (days > 2) addItem({ category: 'clothes', id: 's2', name: p.shoes[1], vol: 2000, weight: 800, priority: 7, isEssential: false, fold: null });

  addItem({ category: 'clothes', id: 'u1', name: `${days + 2}x Underwear & Socks`, vol: (days+2)*250, weight: (days+2)*50, priority: 10, isEssential: true, fold: 'ranger' });
  addItem({ category: 'clothes', id: 'pj1', name: 'Pajamas / Sleepwear', vol: 800, weight: 300, priority: 10, isEssential: true, fold: 'ranger' });

  // 2. Activity Injections
  if (activities.formal) {
    const formalTop = gender === 'female' ? 'Elegant Blouse' : 'Dress Shirt';
    const formalBottom = gender === 'female' ? 'Formal Skirt / Dress' : 'Suit Trousers';
    const formalShoe = gender === 'female' ? 'Dress Heels/Flats' : 'Dress Shoes';
    const formalOuter = gender === 'female' ? 'Evening Wrap' : 'Suit Blazer';
    
    addItem({ category: 'clothes', id: 'f1', name: formalTop, vol: 600, weight: 300, priority: 9, isEssential: true, fold: 'bundle' });
    if (gender !== 'female') addItem({ category: 'clothes', id: 'f2', name: formalBottom, vol: 1500, weight: 500, priority: 9, isEssential: true, fold: 'bundle' });
    addItem({ category: 'clothes', id: 'f3', name: formalShoe, vol: 2000, weight: 800, priority: 9, isEssential: true, fold: null });
    addItem({ category: 'clothes', id: 'f4', name: formalOuter, vol: 2500, weight: 900, priority: 8, isEssential: true, fold: 'bundle' });
    
    combinations.push({
      name: 'Evening / Formal Look',
      top: formalTop,
      bottom: gender === 'female' ? formalBottom : formalBottom,
      outer: formalOuter,
      shoe: formalShoe
    });
  }

  if (activities.gym) {
    addItem({ category: 'clothes', id: 'g1', name: 'Workout Top & Shorts', vol: 800, weight: 400, priority: 8, isEssential: true, fold: 'ranger' });
    addItem({ category: 'clothes', id: 'g2', name: 'Athletic Shoes', vol: 2500, weight: 800, priority: 8, isEssential: true, fold: 'shoes' });
    combinations.push({ name: 'Gym / Active Look', top: 'Workout Top', bottom: 'Workout Shorts', outer: null, shoe: 'Athletic Shoes' });
  }

  if (activities.beach) {
    addItem({ category: 'clothes', id: 'b1', name: 'Swimsuit / Trunks', vol: 300, weight: 150, priority: 10, isEssential: true, fold: 'ranger' });
    addItem({ category: 'clothes', id: 'b2', name: 'Sandals / Flip Flops', vol: 1000, weight: 300, priority: 9, isEssential: true, fold: null });
    addItem({ category: 'clothes', id: 'b3', name: 'Beach Towel', vol: 1500, weight: 600, priority: 6, isEssential: false, fold: 'konmari' });
    combinations.push({ name: 'Beach / Pool Look', top: 'Swimwear', bottom: 'Beach Towel', outer: null, shoe: 'Sandals' });
  }

  if (activities.hike) {
    addItem({ category: 'clothes', id: 'h1', name: 'Hiking Pants / Leggings', vol: 1200, weight: 500, priority: 9, isEssential: true, fold: 'konmari' });
    addItem({ category: 'clothes', id: 'h2', name: 'Moisture-wicking Shirt', vol: 500, weight: 200, priority: 9, isEssential: true, fold: 'ranger' });
    addItem({ category: 'clothes', id: 'h3', name: 'Hiking Boots / Trail Shoes', vol: 3500, weight: 1200, priority: 10, isEssential: true, fold: 'shoes' });
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
    addItem({ category: 'clothes', id: 'w1', name: 'Warm Overcoat / Puffer', vol: 4000, weight: 1200, priority: 9, isEssential: true });
    addItem({ category: 'clothes', id: 'w2', name: 'Gloves and Beanie', vol: 500, weight: 200, priority: 8, isEssential: false, fold: 'shoes' });
  }
  if (globalMaxTemp > 25 && globalMaxTemp !== -Infinity) {
    addItem({ category: 'clothes', id: 'w5', name: 'Sunglasses & Sun Hat', vol: 300, weight: 150, priority: 8, isEssential: true });
  }
  if (globalRain > 5) {
    addItem({ category: 'clothes', id: 'r1', name: 'Compact Umbrella', vol: 500, weight: 300, priority: 9, isEssential: true });
    addItem({ category: 'clothes', id: 'r2', name: 'Rain Jacket / Shell', vol: 1500, weight: 450, priority: 8, isEssential: false, fold: 'bundle' });
  }

  // Smart Day-by-Day Combinatorics
  const primaryLoc = weatherDataArray?.[0];
  const maxes = primaryLoc?.weather?.temperature_2m_max || [];
  const rain = primaryLoc?.weather?.precipitation_sum || [];
  
  for (let d = 0; d < days; d++) {
    const dailyMax = maxes[d] !== undefined ? maxes[d] : 20;
    const dailyRain = rain[d] !== undefined ? rain[d] : 0;
    
    const top = selectedTops[d % selectedTops.length];
    const bottom = selectedBottoms[Math.floor(d / 2) % selectedBottoms.length];
    
    let outer = null;
    if (dailyMax < 18) outer = p.outer;
    if (dailyRain > 5) outer = 'Rain Jacket / Shell';
    
    let shoe = p.shoes[0];
    if (dailyRain > 5) shoe = 'Waterproof / Durable Shoes';
    else if (p.shoes.length > 1 && d % 2 !== 0) shoe = p.shoes[1]; // rotate shoes
    
    combinations.unshift({
      name: `Day ${d + 1} - ${primaryLoc?.locationName || 'Trip'}`,
      temp: dailyMax,
      weather: dailyRain > 5 ? 'Rainy' : (dailyMax > 25 ? 'Sunny' : 'Clear/Mild'),
      top,
      bottom,
      outer,
      shoe,
    });
  }
  
  // Re-reverse to chronological (unshift makes it backward)
  combinations.reverse();

  // Toiletries & Tech
  Object.keys(ITEM_DATA).forEach(k => {
    const data = ITEM_DATA[k];
    let name = '';
    let category = '';
    if (k.startsWith('t')) { category = 'toiletries'; name = ['Toothbrush set', 'Deodorant', 'Skincare', 'Hair product', 'Grooming Kit'][parseInt(k[1])-1]; }
    else if (k.startsWith('e')) { category = 'tech'; name = ['Laptop', 'Charger', 'Power Bank'][parseInt(k[1])-1]; }
    else if (k.startsWith('d')) { category = 'documents'; name = ['Passport / ID', 'Tickets / Itinerary', 'Cards / Cash'][parseInt(k[1])-1]; }
    else return;

    if (name) addItem({ category, id: k, name, vol: data.vol, weight: data.weight, priority: data.priority, isEssential: data.isEssential, fold: data.fold });
  });

  // VOLUME OPTIMIZATION
  let currentVolume = allItems.reduce((sum, item) => sum + item.vol, 0);
  let currentWeight = allItems.reduce((sum, item) => sum + item.weight, 0);
  
  if (suitcaseVolume > 0 && currentVolume > suitcaseVolume) {
    allItems.sort((a, b) => a.priority - b.priority);
    for (let i = 0; i < allItems.length; i++) {
      if (!allItems[i].isEssential) {
        currentVolume -= allItems[i].vol;
        currentWeight -= allItems[i].weight;
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
    currentWeight,
    outfitCombinations: combinations
  };
};
