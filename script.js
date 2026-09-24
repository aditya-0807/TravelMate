/* ==========================================================
   TRAVELMATE - SCRIPT.JS
   Realistic mock data, interactive scrapbooking, multi-day tabs,
   packing checklist, pocket budget calculations & smooth page navigation.
   ========================================================== */

// --- Global State ---
const currencySymbols = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  INR: '₹'
};

let currentCurrency = 'USD';
let currentDayIndex = 1;

// Sample & Active Trips Data
const defaultTrips = {
  kyoto: {
    id: 'kyoto',
    title: 'Kyoto & Nara Heritage Walk',
    destination: 'Kyoto, Japan',
    dates: 'Oct 15 - Oct 20 (5 Days)',
    travellers: '2 Travellers (Couple)',
    style: '🏛️ Cultural & Historic',
    hotel: 'Gion Kumo Boutique Inn',
    city: 'Kyoto & Nara, Japan',
    totalBudget: 2200,
    currency: 'USD',
    days: [
      {
        dayNum: 1,
        subtitle: 'Arrival & Lanterns',
        theme: 'Gion Canal Stroll & Tea Houses',
        hotel: 'Gion Kumo Boutique Inn',
        city: 'Kyoto Old Quarter',
        morning: {
          time: '09:00 AM - 12:00 PM',
          title: 'Arrival & Check-in at Gion Ryokan',
          desc: 'Land at Kansai Airport, catch the Haruka Express into Kyoto Station, and drop off bags at your wooden boutique stay nestled in historic Gion.',
          chips: ['🚆 Haruka Express', '🧳 Luggage Drop', '🌸 Welcome Matcha']
        },
        afternoon: {
          time: '01:30 PM - 05:00 PM',
          title: 'Walk the Stone Paths of Ninenzaka & Sannenzaka',
          desc: 'Wander preserved Edo-period alleys lined with traditional wooden teahouses, handmade ceramic shops, and incense makers leading up toward Kiyomizu-dera.',
          chips: ['🏮 Wooden Pagodas', '🍡 Dango Snack', '📸 Polaroid Spot']
        },
        evening: {
          time: '06:30 PM - 09:30 PM',
          title: 'Lantern-lit Dining along Shirakawa Canal',
          desc: 'Cozy seasonal kaiseki banquet featuring fresh yuba (tofu skin), seasonal tempura, and local Kyoto sake beside the glowing paper lanterns.',
          chips: ['🍲 Kaiseki Dinner', '🍶 Sake Tasting', '✨ River Night Walk']
        }
      },
      {
        dayNum: 2,
        subtitle: 'Bamboo Groves',
        theme: 'Arashiyama River & Forest Whispers',
        hotel: 'Gion Kumo Boutique Inn',
        city: 'Arashiyama, Kyoto',
        morning: {
          time: '07:30 AM - 11:30 AM',
          title: 'Arashiyama Bamboo Forest & Tenryu-ji Temple',
          desc: 'Beat the crowds to experience the morning wind rustling through towering bamboo stalks. Visit Tenryu-ji’s UNESCO World Heritage zen garden.',
          chips: ['🎋 Tall Bamboo', '🧘 Zen Rock Garden', '🍵 Cloud Tea']
        },
        afternoon: {
          time: '01:00 PM - 04:30 PM',
          title: 'Romantic Sagano Scenic Train Ride',
          desc: 'Hop aboard the open-sided vintage train following the forested curves of the Hozu River Gorge, bursting with autumn maple leaves.',
          chips: ['🚂 Romantic Railway', '🍁 Maple Views', '🛶 River Rapids']
        },
        evening: {
          time: '06:00 PM - 08:30 PM',
          title: 'Tofu Hotpot & Pontocho Alley Stroll',
          desc: 'Sample classic Kyoto boiled Yudofu hotpot followed by a relaxing evening walk down narrow Pontocho alley with views of Kamogawa river.',
          chips: ['🍲 Yudofu Hotpot', '🏮 Pontocho Alleys', '🌙 River Breezes']
        }
      },
      {
        dayNum: 3,
        subtitle: 'Golden Pavilion',
        theme: 'Kinkaku-ji & Zen Reflection',
        hotel: 'Gion Kumo Boutique Inn',
        city: 'Northern Kyoto',
        morning: {
          time: '09:00 AM - 12:00 PM',
          title: 'Kinkaku-ji (Golden Pavilion) & Mirror Pond',
          desc: 'Marvel at the gold-leaf-covered top two floors reflecting in the mirror pond, followed by a quiet matcha bowl in the temple tea garden.',
          chips: ['✨ Golden Pavilion', '🍵 Matcha Bowls', '📷 Postcard Views']
        },
        afternoon: {
          time: '02:00 PM - 05:00 PM',
          title: 'Philosopher’s Path & Ginkaku-ji',
          desc: 'A calm stone path canal walk named after Kyoto University philosopher Nishida Kitaro, lined with small independent craft stalls and sleeping cats.',
          chips: ['🐈 Canal Cats', '🎨 Handcraft Ceramic', '🚶 Peaceful Walk']
        },
        evening: {
          time: '06:30 PM - 09:00 PM',
          title: 'Sizzling Okonomiyaki & Local Craft Beer',
          desc: 'Relax at an intimate teppanyaki counter where savory cabbage pancakes with sweet sauce and bonito flakes are freshly grilled right in front of you.',
          chips: ['🥞 Savory Pancake', '🍺 Craft IPA', '🥢 Chef Counter']
        }
      },
      {
        dayNum: 4,
        subtitle: 'Nara Deer Park',
        theme: 'Sacred Deer & Giant Bronze Buddha',
        hotel: 'Gion Kumo Boutique Inn',
        city: 'Nara Day Excursion',
        morning: {
          time: '08:30 AM - 12:00 PM',
          title: 'Kintetsu Express to Nara & Todai-ji Temple',
          desc: 'Short scenic 35-min train to Nara. Enter Daibutsuden (Great Buddha Hall), one of the world’s largest wooden buildings housing a 15-meter bronze Buddha.',
          chips: ['🚆 Kintetsu Line', '🛕 Giant Buddha', '🦌 Deer Crackers']
        },
        afternoon: {
          time: '01:00 PM - 04:30 PM',
          title: 'Bow with Friendly Free-roaming Deer & Kasuga Taisha',
          desc: 'Feed Shika-senbei crackers to bowing deer in Nara Park and walk the mossy stone lantern pathways of Kasuga Grand Shrine.',
          chips: ['🦌 Bowing Deer', '🏮 Stone Lanterns', '🌿 Ancient Woods']
        },
        evening: {
          time: '06:00 PM - 09:00 PM',
          title: 'Return to Kyoto: Ramen Alley Feast',
          desc: 'Head to the 10th floor of Kyoto Station building to taste rich Tonkotsu ramen with extra soft-boiled egg and crispy gyoza.',
          chips: ['🍜 Ramen Alley', '🥟 Crispy Gyoza', '🌃 Kyoto Tower View']
        }
      },
      {
        dayNum: 5,
        subtitle: 'Tea & Farewell',
        theme: 'Fushimi Inari Torii Sunrise & Uji Souvenirs',
        hotel: 'Gion Kumo Boutique Inn',
        city: 'Southern Kyoto & Departure',
        morning: {
          time: '06:45 AM - 10:30 AM',
          title: 'Fushimi Inari Taisha 1,000 Vermilion Gates',
          desc: 'Climb the mystical orange tunnels of Senbon Torii up the sacred mountain before day-trippers arrive. Stop at mini fox shrines.',
          chips: ['🦊 Fox Shrines', '⛩️ 1,000 Gates', '🌅 Morning Mist']
        },
        afternoon: {
          time: '12:00 PM - 03:00 PM',
          title: 'Nishiki Food Market & Souvenir Scrapbooking',
          desc: 'Pick up handmade washi tape, wooden chopsticks, roasted hojicha leaves, and strawberry mochi to pack into your cute suitcase.',
          chips: ['🍓 Strawberry Mochi', '🥢 Personalized Chopsticks', '🎁 Gift Bag']
        },
        evening: {
          time: '04:30 PM - 07:30 PM',
          title: 'Farewell Bento & Flight / Shinkansen',
          desc: 'Pick up an elaborate Ekiben train bento box with seasonal chestnuts and grilled salmon before heading to the departure terminal.',
          chips: ['🍱 Ekiben Bento', '🚅 Bullet Train', '💌 Journal Finished']
        }
      }
    ]
  },
  santorini: {
    id: 'santorini',
    title: 'Santorini Caldera & White Domes',
    destination: 'Santorini, Greece',
    dates: 'Jun 02 - Jun 08 (7 Days)',
    travellers: '4 Travellers (Friends)',
    style: '🏖️ Beach & Sun',
    hotel: 'Oia Sunset Cave Villa',
    city: 'Oia & Thira, Greece',
    totalBudget: 3400,
    currency: 'EUR',
    days: [
      {
        dayNum: 1,
        subtitle: 'Caldera Check-in',
        theme: 'Cliffside Villa & Welcome Mezze',
        hotel: 'Oia Sunset Cave Villa',
        city: 'Oia, Santorini',
        morning: {
          time: '10:00 AM - 01:00 PM',
          title: 'Arrival in Thira & Scenic Drive to Oia',
          desc: 'Touch down at JTR airport, take private shuttle to the edge of Oia, and settle into your whitewashed cave dwelling.',
          chips: ['🚐 Island Shuttle', '🏡 Cave House', '🫒 Welcome Olives']
        },
        afternoon: {
          time: '02:30 PM - 05:30 PM',
          title: 'Stroll Oia Marble Alleys & Blue Domes',
          desc: 'Snap iconic photos in front of the three pastel blue church domes and browse handmade Greek linen boutiques.',
          chips: ['⛪ Blue Domes', '👗 Linen Shops', '📸 Polaroid Perfect']
        },
        evening: {
          time: '07:00 PM - 10:00 PM',
          title: 'Golden Hour Sunset & Seafood Taverna',
          desc: 'Watch the sun sink into the cobalt Aegean Sea with fresh grilled sea bass, greek salad with feta, and cold Assyrtiko wine.',
          chips: ['🍷 Assyrtiko Wine', '🐟 Fresh Sea Bass', '🌅 Oia Sunset']
        }
      },
      {
        dayNum: 2,
        subtitle: 'Catamaran Cruise',
        theme: 'Volcanic Hot Springs & Red Beach',
        hotel: 'Oia Sunset Cave Villa',
        city: 'Aegean Caldera',
        morning: {
          time: '09:30 AM - 01:00 PM',
          title: 'Luxury Catamaran Sailing & Snorkeling',
          desc: 'Board a catamaran from Ammoudi Bay to sail across the volcanic crater, stopping for warm sulfur hot springs swimming.',
          chips: ['⛵ Catamaran', '🤿 Snorkeling', '🌋 Hot Springs']
        },
        afternoon: {
          time: '01:30 PM - 04:30 PM',
          title: 'On-board Greek BBQ Feast & Red Beach',
          desc: 'Enjoy skewered souvlaki grilled directly on deck while moored alongside the towering rust-red cliffs of Red Beach.',
          chips: ['🥩 Souvlaki BBQ', '🏖️ Red Sand', '🌊 Turquoise Swims']
        },
        evening: {
          time: '06:30 PM - 09:30 PM',
          title: 'Ammoudi Bay Octopus Dinner by the Water',
          desc: 'Sit on wooden chairs with your feet practically dipping into the harbor while eating sun-dried chargrilled octopus.',
          chips: ['🐙 Sun-dried Octopus', '⚓ Harbor Lights', '🍨 Baklava Treat']
        }
      },
      {
        dayNum: 3,
        subtitle: 'Fira to Oia Trek',
        theme: 'Cliffside Hiking Trail & Gelato',
        hotel: 'Oia Sunset Cave Villa',
        city: 'Imerovigli & Fira',
        morning: {
          time: '07:30 AM - 11:30 AM',
          title: 'Scenic 10km Caldera Rim Trail',
          desc: 'Hike along volcanic ridge paths past quiet hermit chapels with endless panoramic ocean views on either side.',
          chips: ['🥾 Ridge Hike', '⛪ Skaros Rock', '🌊 Deep Blue Views']
        },
        afternoon: {
          time: '01:00 PM - 04:00 PM',
          title: 'Lunch in Imerovigli & Artisan Gelato',
          desc: 'Refuel with freshly baked tomato keftedes (fritters), tzatziki, and scoops of pistachio gelato.',
          chips: ['🍅 Tomato Keftedes', '🍦 Pistachio Gelato', '🛋️ Shaded Patio']
        },
        evening: {
          time: '06:30 PM - 09:30 PM',
          title: 'Open Air Cinema in Kamari',
          desc: 'Watch a movie under whispering eucalyptus trees with a glass of crisp local wine and salty popcorn.',
          chips: ['🎬 Outdoor Cinema', '🍿 Movie Night', '🍷 Kamari Wine']
        }
      }
    ]
  },
  bali: {
    id: 'bali',
    title: 'Bali Rice Terraces & Ocean Swells',
    destination: 'Bali, Indonesia',
    dates: 'Mar 10 - Mar 17 (8 Days)',
    travellers: '1 Traveller (Solo)',
    style: '🧗 Adventure & Nature',
    hotel: 'Bamboo Jungle Eco Lodge',
    city: 'Ubud & Canggu, Bali',
    totalBudget: 1400,
    currency: 'USD',
    days: [
      {
        dayNum: 1,
        subtitle: 'Jungle Welcome',
        theme: 'Arrival in Ubud & Frangipani Spa',
        hotel: 'Bamboo Jungle Eco Lodge',
        city: 'Ubud, Bali',
        morning: {
          time: '09:00 AM - 01:00 PM',
          title: 'Arrive in Denpasar & Transfer to Ubud',
          desc: 'Drive into the misty hillside heart of Bali, check into an open-air bamboo bungalow surrounded by singing tropical birds.',
          chips: ['🥥 Fresh Coconut', '🎋 Bamboo Hut', '🌿 Jungle Breeze']
        },
        afternoon: {
          time: '02:30 PM - 05:00 PM',
          title: 'Campuhan Ridge Walk & Herbal Tea',
          desc: 'Gentle walk over lush valley hills lined with tall swaying reeds, followed by cold lemongrass tea at a secret cafe.',
          chips: ['🌾 Campuhan Trail', '☕ Lemongrass Tea', '🦋 Butterflies']
        },
        evening: {
          time: '06:30 PM - 09:00 PM',
          title: 'Balinese Herbal Massage & Nasi Campur',
          desc: 'Traditional deep floral oil massage followed by a bowl of aromatic spiced chicken, tempeh, and sambal matah.',
          chips: ['🌸 Frangipani Spa', '🍚 Nasi Campur', '🕯️ Candlelight']
        }
      },
      {
        dayNum: 2,
        subtitle: 'Waterfalls & Terraces',
        theme: 'Tegalalang Greenery & Secret Ravines',
        hotel: 'Bamboo Jungle Eco Lodge',
        city: 'Tegalalang, Bali',
        morning: {
          time: '07:00 AM - 11:00 AM',
          title: 'Morning Light at Tegalalang Rice Terraces',
          desc: 'Watch golden sunbeams filter through coconut palms illuminating the ancient subak irrigation terraces.',
          chips: ['🌾 Rice Terraces', '🌴 Palm Groves', '☀️ Golden Rays']
        },
        afternoon: {
          time: '01:00 PM - 04:30 PM',
          title: 'Tibumana Waterfall Swim',
          desc: 'Dip into the deep freshwater jungle pool fed by a serene straight-fall curtain of clear river water.',
          chips: ['🏊 Jungle Swim', '💦 Hidden Falls', '🌱 Tropical Ferns']
        },
        evening: {
          time: '06:30 PM - 09:00 PM',
          title: 'Yoga Shala Sound Bath & Smoothie Bowl',
          desc: 'A calming Tibetan singing bowl meditation session followed by a dragonfruit, mango, and toasted granola bowl.',
          chips: ['🧘 Sound Bath', '🥣 Acai & Mango', '🌙 Stargazing']
        }
      }
    ]
  }
};

let activeTrip = defaultTrips.kyoto;

// Packing List Initial Mock Data
let packingItems = [
  { id: 1, text: 'Cozy Oversized Cardigan', category: 'clothes', checked: true },
  { id: 2, text: 'Comfortable Walking Sneakers', category: 'clothes', checked: true },
  { id: 3, text: 'Breathable Cotton Tees (x4)', category: 'clothes', checked: false },
  { id: 4, text: 'Light Rain Jacket', category: 'clothes', checked: false },
  { id: 5, text: 'Cute Kimono/Scarf Wrap', category: 'clothes', checked: false },

  { id: 6, text: 'Hydrating Facial Mist', category: 'toiletries', checked: true },
  { id: 7, text: 'Sunscreen SPF 50+', category: 'toiletries', checked: true },
  { id: 8, text: 'Bamboo Toothbrush & Paste', category: 'toiletries', checked: false },
  { id: 9, text: 'Travel Solid Shampoo Bar', category: 'toiletries', checked: false },
  { id: 10, text: 'Mini Band-Aids & Blister Pads', category: 'toiletries', checked: true },

  { id: 11, text: 'Polaroid Instant Camera + Film', category: 'tech', checked: true },
  { id: 12, text: 'Universal Travel Plug Adapter', category: 'tech', checked: false },
  { id: 13, text: 'Heavy Duty 20,000mAh Powerbank', category: 'tech', checked: true },
  { id: 14, text: 'Noise-Cancelling Headphones', category: 'tech', checked: false },
  { id: 15, text: 'Braided Type-C Fast Cable', category: 'tech', checked: false },

  { id: 16, text: 'Passport & Waterproof Pouch', category: 'documents', checked: true },
  { id: 17, text: 'Physical Printed Hotel Bookings', category: 'documents', checked: true },
  { id: 18, text: 'Local Rail Pass / Metro Voucher', category: 'documents', checked: false },
  { id: 19, text: 'Travel Insurance Certificate', category: 'documents', checked: true },
  { id: 20, text: 'Emergency Cash in JPY Yen', category: 'documents', checked: false }
];

// Budget Expenses Mock Data
let expenseCategories = [
  { name: 'Hotel & Stay', allocatedPct: 40, spent: 850, color: '#A2D2FF' },
  { name: 'Food & Dining', allocatedPct: 25, spent: 420, color: '#FFCCD5' },
  { name: 'Activities & Entry', allocatedPct: 15, spent: 210, color: '#C7F9CC' },
  { name: 'Transport & Metro', allocatedPct: 12, spent: 160, color: '#FFF1A8' },
  { name: 'Souvenirs & Gifts', allocatedPct: 8, spent: 80, color: '#E0C3FC' }
];

let loggedExpenses = [
  { id: 1, title: 'Ryokan Deposit & Taxes', category: 'Hotel & Stay', amount: 850, date: 'Oct 15' },
  { id: 2, title: 'Kiyomizu-dera Entry & Amulets', category: 'Activities & Entry', amount: 45, date: 'Oct 15' },
  { id: 3, title: 'Matcha Parfait & Dango', category: 'Food & Dining', amount: 28, date: 'Oct 15' },
  { id: 4, title: 'IC Transit Card Top-Up', category: 'Transport & Metro', amount: 60, date: 'Oct 16' },
  { id: 5, title: 'Kaiseki Dinner Banquet', category: 'Food & Dining', amount: 140, date: 'Oct 16' },
  { id: 6, title: 'Sagano Scenic Romantic Train', category: 'Activities & Entry', amount: 35, date: 'Oct 17' },
  { id: 7, title: 'Handcrafted Incense & Washi Paper', category: 'Souvenirs & Gifts', amount: 50, date: 'Oct 17' }
];

// --- Initialization with Persistent Database ---
document.addEventListener('DOMContentLoaded', async () => {
  setupNavigation();
  setupMobileMenu();

  if (window.TravelMateDB) {
    try {
      await TravelMateDB.init();
      await syncWithDatabase();
    } catch (err) {
      console.warn('Database initialization fallback:', err);
    }
  }

  renderItineraryHeader();
  renderDayTabs();
  renderDaySchedule(1);
  renderPackingList();
  renderBudgetBreakdown();
  renderExpenseLog();
});

// Seed or load from IndexedDB
async function syncWithDatabase() {
  const existingTrips = await TravelMateDB.getAllTrips();

  if (existingTrips.length === 0) {
    // Seed default trips into DB
    for (const key of Object.keys(defaultTrips)) {
      const t = defaultTrips[key];
      await TravelMateDB.saveTrip({
        id: t.id,
        destination: t.destination,
        dates: t.dates,
        budget: t.totalBudget,
        currency: t.currency,
        travellers: t.travellers,
        travel_style: t.style,
        accommodation: t.hotel,
        pace: 'Balanced & Steady',
        title: t.title,
        city: t.city
      });
      await TravelMateDB.saveItineraryDays(t.id, t.days);
    }

    // Seed default packing items
    for (const item of packingItems) {
      await TravelMateDB.savePackingItem({ ...item, tripId: activeTrip.id });
    }

    // Seed default expenses
    for (const exp of loggedExpenses) {
      await TravelMateDB.saveExpense({ ...exp, tripId: activeTrip.id });
    }
  } else {
    // Load from DB
    const savedTrips = await TravelMateDB.getAllTrips();
    // Load active trip itinerary
    const savedDays = await TravelMateDB.getItinerary(activeTrip.id);
    if (savedDays && savedDays.length > 0) {
      activeTrip.days = savedDays.map((d, idx) => ({
        dayNum: d.day || (idx + 1),
        subtitle: d.subtitle || `Day ${idx + 1}`,
        theme: d.theme || 'Exploration & Sights',
        hotel: d.hotel || activeTrip.hotel,
        city: d.city || activeTrip.city,
        morning: d.morning,
        afternoon: d.afternoon,
        evening: d.evening
      }));
    }

    // Load packing items for active trip
    const dbPacking = await TravelMateDB.getPacking(activeTrip.id);
    if (dbPacking && dbPacking.length > 0) {
      packingItems = dbPacking;
    }

    // Load expenses for active trip
    const dbExpenses = await TravelMateDB.getExpenses(activeTrip.id);
    if (dbExpenses && dbExpenses.length > 0) {
      loggedExpenses = dbExpenses;
    }

    // Populate extra saved custom trips into grid
    savedTrips.forEach(trip => {
      if (!defaultTrips[trip.id]) {
        addNewTripToScrapbook({
          id: trip.id,
          title: trip.title || `${trip.destination} Scrapbook`,
          destination: trip.destination,
          dates: trip.dates,
          travellers: trip.travellers,
          style: trip.travel_style || 'Cultural',
          totalBudget: trip.budget || 2000,
          currency: trip.currency || 'USD'
        });
      }
    });
  }
}

// ==========================================================
// 1. PAGE NAVIGATION
// ==========================================================
function setupNavigation() {
  // handled via navigateTo
}

function navigateTo(pageId) {
  const allSections = document.querySelectorAll('.page-section');
  allSections.forEach(section => {
    section.classList.remove('active');
  });

  const targetSection = document.getElementById(`page-${pageId}`);
  if (targetSection) {
    targetSection.classList.add('active');
  }

  // Update Nav links
  const navBtns = document.querySelectorAll('.nav-item');
  navBtns.forEach(btn => {
    if (btn.dataset.page === pageId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Close mobile nav if open
  const navLinks = document.getElementById('navLinks');
  if (navLinks.classList.contains('mobile-open')) {
    navLinks.classList.remove('mobile-open');
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function setupMobileMenu() {
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.getElementById('navLinks');
  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('mobile-open');
    });
  }
}

function showToast(message) {
  const toast = document.getElementById('toastNotification');
  const msgEl = document.getElementById('toastMessage');
  if (!toast || !msgEl) return;
  msgEl.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}

// ==========================================================
// 2. ITINERARY RENDERING & DAY TABS
// ==========================================================
function renderItineraryHeader() {
  document.getElementById('itineraryStyleTag').textContent = activeTrip.style;
  document.getElementById('itineraryDestinationTitle').textContent = activeTrip.title;
  document.getElementById('itineraryDatesDisplay').textContent = `📅 ${activeTrip.dates} • ${activeTrip.travellers}`;
  document.getElementById('itineraryHotelDisplay').textContent = activeTrip.hotel;
  document.getElementById('itineraryCityDisplay').textContent = activeTrip.city;
}

function renderDayTabs() {
  const container = document.getElementById('dayTabsContainer');
  if (!container) return;
  container.innerHTML = '';

  activeTrip.days.forEach((day, index) => {
    const dayBtn = document.createElement('button');
    dayBtn.className = `day-tab ${day.dayNum === currentDayIndex ? 'active' : ''}`;
    dayBtn.onclick = () => selectDay(day.dayNum);

    dayBtn.innerHTML = `
      <span class="day-title">Day ${day.dayNum}</span>
      <span class="day-subtitle">${day.subtitle}</span>
    `;
    container.appendChild(dayBtn);
  });
}

function selectDay(dayNum) {
  currentDayIndex = dayNum;
  // Update tabs active state
  const tabs = document.querySelectorAll('.day-tab');
  tabs.forEach((tab, index) => {
    if (index + 1 === dayNum) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });

  renderDaySchedule(dayNum);
}

function renderDaySchedule(dayNum) {
  const container = document.getElementById('dayScheduleContainer');
  if (!container) return;

  const dayData = activeTrip.days.find(d => d.dayNum === dayNum) || activeTrip.days[0];
  if (!dayData) return;

  const morningChips = dayData.morning.chips.map(c => `<span class="slot-chip">${c}</span>`).join('');
  const afternoonChips = dayData.afternoon.chips.map(c => `<span class="slot-chip">${c}</span>`).join('');
  const eveningChips = dayData.evening.chips.map(c => `<span class="slot-chip">${c}</span>`).join('');

  container.innerHTML = `
    <div class="day-overview-bar">
      <div>
        <span class="badge-cute">Day ${dayData.dayNum} of ${activeTrip.days.length}</span>
        <h3>${dayData.theme}</h3>
      </div>
      <div class="day-stats-pill">
        🏨 ${dayData.hotel} • 📍 ${dayData.city}
      </div>
    </div>

    <div class="timeline-schedules">
      <!-- Morning -->
      <div class="time-slot-card">
        <div class="slot-left">
          <span class="slot-tag morning">🌅 Morning</span>
          <span class="slot-time">${dayData.morning.time}</span>
        </div>
        <div class="slot-right">
          <h4>${dayData.morning.title}</h4>
          <p class="slot-activity-desc">${dayData.morning.desc}</p>
          <div class="slot-meta-chips">${morningChips}</div>
        </div>
      </div>

      <!-- Afternoon -->
      <div class="time-slot-card">
        <div class="slot-left">
          <span class="slot-tag afternoon">☀️ Afternoon</span>
          <span class="slot-time">${dayData.afternoon.time}</span>
        </div>
        <div class="slot-right">
          <h4>${dayData.afternoon.title}</h4>
          <p class="slot-activity-desc">${dayData.afternoon.desc}</p>
          <div class="slot-meta-chips">${afternoonChips}</div>
        </div>
      </div>

      <!-- Evening -->
      <div class="time-slot-card">
        <div class="slot-left">
          <span class="slot-tag evening">🌙 Evening</span>
          <span class="slot-time">${dayData.evening.time}</span>
        </div>
        <div class="slot-right">
          <h4>${dayData.evening.title}</h4>
          <p class="slot-activity-desc">${dayData.evening.desc}</p>
          <div class="slot-meta-chips">${eveningChips}</div>
        </div>
      </div>
    </div>
  `;
}

// Load prebuilt sample trips
function loadSampleTrip(tripKey) {
  if (defaultTrips[tripKey]) {
    activeTrip = defaultTrips[tripKey];
    currentDayIndex = 1;
    currentCurrency = activeTrip.currency || 'USD';
    document.getElementById('budgetPageCurrency').value = currentCurrency;

    renderItineraryHeader();
    renderDayTabs();
    renderDaySchedule(1);
    renderBudgetBreakdown();
    navigateTo('itinerary');
    showToast(`Loaded ${activeTrip.title} into your scrapbook!`);
  }
}

// ==========================================================
// 3. PLAN TRIP FORM SUBMISSION & GENERATION
// ==========================================================
function updateTravellerCount(defaultNum) {
  document.getElementById('travellerCount').value = defaultNum;
  const pills = document.querySelectorAll('#travellerTypeGroup .radio-pill');
  pills.forEach(pill => {
    const radio = pill.querySelector('input');
    if (radio.checked) {
      pill.classList.add('active');
    } else {
      pill.classList.remove('active');
    }
  });
}

function stepCount(delta) {
  const input = document.getElementById('travellerCount');
  let val = parseInt(input.value) || 1;
  val = Math.max(1, Math.min(30, val + delta));
  input.value = val;
}

function handleTripPlanSubmit(e) {
  e.preventDefault();

  const destination = document.getElementById('destinationInput').value.trim();
  const depDate = document.getElementById('departureDate').value;
  const retDate = document.getElementById('returnDate').value;
  const budget = parseFloat(document.getElementById('budgetAmount').value) || 1500;
  const currency = document.getElementById('budgetCurrency').value;
  const travellers = parseInt(document.getElementById('travellerCount').value) || 1;
  const style = document.getElementById('travelStyle').value;
  const accommodation = document.getElementById('accommodationType').value;
  const pace = document.getElementById('travelPace').value;

  // Calculate days difference
  const start = new Date(depDate);
  const end = new Date(retDate);
  let diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  if (isNaN(diffDays) || diffDays < 1) diffDays = 4;
  if (diffDays > 14) diffDays = 14; // Cap for scrapbook readability

  // Build custom day-by-day plan
  const generatedDays = [];
  const cityShort = destination.split(',')[0].trim();

  const activityThemes = [
    { sub: 'Arrival & Welcome', theme: `Welcome to ${cityShort} & Historic Alleys`, m: 'Check in & Neighborhood Orientation', a: 'Iconic Plaza & Artisan Cafes', e: 'Welcome Candlelit Local Dinner' },
    { sub: 'Wonders & Heritage', theme: `Hidden Gems & Cultural Exploration`, m: 'Morning Architectural Landmark & Gardens', a: 'Local Market Tastings & Polaroid Walk', e: 'Rooftop Sunset & Live Music' },
    { sub: 'Nature & Panoramas', theme: `Scenic Viewpoints & Peaceful Walks`, m: 'Scenic Nature Trail / Coastal View', a: 'Boutique Shopping & Afternoon Treat', e: 'Cozy Fireplace / Harbor Dining' },
    { sub: 'Art & Memories', theme: `Local Flavors & Scrapbook Souvenirs`, m: 'Art Museum or Historic Palace', a: 'Handicraft Workshops & Gift Hunt', e: 'Celebratory Farewell Feast' }
  ];

  for (let i = 1; i <= diffDays; i++) {
    const template = activityThemes[(i - 1) % activityThemes.length];
    generatedDays.push({
      dayNum: i,
      subtitle: `${template.sub} (Day ${i})`,
      theme: `${template.theme}`,
      hotel: `${accommodation} in ${cityShort}`,
      city: `${destination}`,
      morning: {
        time: '08:30 AM - 11:30 AM',
        title: `${template.m}`,
        desc: `Wake up early to experience the fresh morning air in ${cityShort}. Stroll through local neighborhoods and enjoy fresh local breakfast treats.`,
        chips: ['☕ Morning Coffee', `📍 ${cityShort} Sights`, '🥐 Breakfast']
      },
      afternoon: {
        time: '01:00 PM - 04:30 PM',
        title: `${template.a}`,
        desc: `Spend the afternoon diving into ${style.toLowerCase()} highlights. Enjoy a calm, ${pace.toLowerCase()} while collecting memories and stickers.`,
        chips: ['📸 Polaroid Shots', '🛍️ Local Crafts', '✨ Happy Wanderer']
      },
      evening: {
        time: '06:30 PM - 09:30 PM',
        title: `${template.e}`,
        desc: `Wind down the day with warm hospitality, tasting traditional specialties and sharing laughs over a delightful table.`,
        chips: ['🍲 Authentic Dinner', '🍷 Local Drinks', '🌙 Starlit Walk']
      }
    });
  }

  // Create new active trip
  activeTrip = {
    id: 'trip_' + Date.now(),
    title: `${cityShort} Cozy Scrapbook`,
    destination: destination,
    dates: `${depDate} to ${retDate} (${diffDays} Days)`,
    travellers: `${travellers} Traveler(s)`,
    style: style,
    hotel: accommodation,
    city: destination,
    totalBudget: budget,
    currency: currency,
    days: generatedDays
  };

  currentCurrency = currency;
  currentDayIndex = 1;

  // Persist trip & itinerary into database
  if (window.TravelMateDB) {
    TravelMateDB.saveTrip({
      id: activeTrip.id,
      destination: activeTrip.destination,
      dates: activeTrip.dates,
      budget: activeTrip.totalBudget,
      currency: activeTrip.currency,
      travellers: activeTrip.travellers,
      travel_style: activeTrip.style,
      accommodation: activeTrip.hotel,
      pace: pace,
      title: activeTrip.title,
      city: activeTrip.city
    });
    TravelMateDB.saveItineraryDays(activeTrip.id, generatedDays);
  }

  // Add to My Trips grid as a new scrapbook card
  addNewTripToScrapbook(activeTrip);

  // Update Itinerary View
  renderItineraryHeader();
  renderDayTabs();
  renderDaySchedule(1);

  // Update Budget Page with new trip budget
  document.getElementById('budgetPageCurrency').value = currency;
  renderBudgetBreakdown();

  navigateTo('itinerary');
  showToast(`✨ Generated dreamy ${diffDays}-day itinerary for ${cityShort}!`);
}

function addNewTripToScrapbook(trip) {
  const grid = document.getElementById('myTripsGrid');
  if (!grid) return;

  const card = document.createElement('div');
  card.className = 'trip-scrapbook-card';
  card.innerHTML = `
    <div class="washi-tape mint-tape"></div>
    <div class="trip-stamp-status stamp-upcoming">Custom</div>
    <div class="trip-cover-img" style="background-image: url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80');"></div>
    <div class="trip-card-body">
      <span class="trip-destination-tag">${trip.destination}</span>
      <h3>${trip.title}</h3>
      <p class="trip-dates">📅 ${trip.dates}</p>
      <div class="trip-meta-tags">
        <span class="tag-pill tag-pink">👥 ${trip.travellers}</span>
        <span class="tag-pill tag-yellow">${currencySymbols[trip.currency] || '$'}${trip.totalBudget}</span>
        <span class="tag-pill tag-mint">${trip.style}</span>
      </div>
      <div class="trip-card-actions">
        <button class="btn-secondary btn-sm" onclick="navigateTo('itinerary')">Open Itinerary</button>
        <button class="btn-ghost-sm" onclick="showToast('Trip saved!')">🔖 Bookmark</button>
      </div>
    </div>
  `;
  grid.prepend(card);
}

function quickFillPlan(destinationName, travelStyle) {
  document.getElementById('destinationInput').value = destinationName;
  document.getElementById('travelStyle').value = travelStyle;
  navigateTo('plan');
  showToast(`Filled in ${destinationName}! Ready to customize dates.`);
}

// ==========================================================
// 4. PACKING LIST INTERACTIVITY
// ==========================================================
function renderPackingList() {
  const categories = ['clothes', 'toiletries', 'tech', 'documents'];

  categories.forEach(cat => {
    const listEl = document.getElementById(`packingList-${cat}`);
    const countEl = document.getElementById(`count-${cat}`);
    if (!listEl) return;

    const itemsInCat = packingItems.filter(i => i.category === cat);
    const checkedCount = itemsInCat.filter(i => i.checked).length;

    if (countEl) {
      countEl.textContent = `${checkedCount}/${itemsInCat.length}`;
    }

    listEl.innerHTML = '';
    itemsInCat.forEach(item => {
      const li = document.createElement('li');
      li.className = `checklist-item ${item.checked ? 'checked' : ''}`;
      li.innerHTML = `
        <input type="checkbox" ${item.checked ? 'checked' : ''} onchange="togglePackingItem(${item.id})">
        <span>${item.text}</span>
        <button class="delete-item-btn" title="Remove item" onclick="deletePackingItem(${item.id})">✕</button>
      `;
      listEl.appendChild(li);
    });
  });

  updatePackingProgress();
}

function togglePackingItem(itemId) {
  const item = packingItems.find(i => i.id === itemId);
  if (item) {
    item.checked = !item.checked;
    if (window.TravelMateDB) {
      TravelMateDB.savePackingItem({ ...item, tripId: activeTrip.id });
    }
    renderPackingList();
  }
}

function deletePackingItem(itemId) {
  packingItems = packingItems.filter(i => i.id !== itemId);
  if (window.TravelMateDB) {
    TravelMateDB.deletePackingItem(itemId);
  }
  renderPackingList();
  showToast('Item removed from luggage checklist');
}

function addCustomPackingItem() {
  const textInput = document.getElementById('newPackingItemText');
  const catInput = document.getElementById('newPackingCategory');
  const text = textInput.value.trim();
  if (!text) return;

  const newItem = {
    id: Date.now(),
    text: text,
    category: catInput.value,
    checked: false
  };

  packingItems.push(newItem);
  if (window.TravelMateDB) {
    TravelMateDB.savePackingItem({ ...newItem, tripId: activeTrip.id });
  }
  textInput.value = '';
  renderPackingList();
  showToast(`Added "${text}" to your bag! 🧳`);
}

function updatePackingProgress() {
  const total = packingItems.length;
  if (total === 0) return;
  const checked = packingItems.filter(i => i.checked).length;
  const pct = Math.round((checked / total) * 100);

  const pctText = document.getElementById('packingPctText');
  const bar = document.getElementById('packingProgressBar');
  const stamp = document.getElementById('packingStatusStamp');

  if (pctText) pctText.textContent = `${pct}% Packed (${checked}/${total})`;
  if (bar) bar.style.width = `${pct}%`;

  if (stamp) {
    if (pct === 100) {
      stamp.textContent = '🎉 100% Bag Ready to Zip!';
      stamp.style.color = '#155724';
      stamp.style.background = '#d4edda';
    } else if (pct >= 50) {
      stamp.textContent = '✈️ Getting Closer!';
      stamp.style.color = '#721c24';
      stamp.style.background = '#f8d7da';
    } else {
      stamp.textContent = '📌 Time to Start Packing!';
      stamp.style.color = '#856404';
      stamp.style.background = '#fff3cd';
    }
  }
}

// ==========================================================
// 5. BUDGET TRACKER & EXPENSES
// ==========================================================
function renderBudgetBreakdown() {
  const symbol = currencySymbols[currentCurrency] || '$';
  const totalBudget = activeTrip.totalBudget || 2200;

  // Calculate total spent
  const totalSpent = loggedExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const remaining = Math.max(0, totalBudget - totalSpent);
  const spentPct = Math.round((totalSpent / totalBudget) * 100);

  document.getElementById('budgetTotalDisplay').textContent = `${symbol}${totalBudget.toLocaleString()}`;
  document.getElementById('budgetSpentDisplay').textContent = `${symbol}${Math.round(totalSpent).toLocaleString()}`;
  document.getElementById('budgetRemainingDisplay').textContent = `${symbol}${Math.round(remaining).toLocaleString()}`;
  document.getElementById('budgetCurrencyLabel').textContent = `Currency: ${currentCurrency} (${symbol})`;
  document.getElementById('budgetSpentPct').textContent = `${spentPct}% of budget logged`;

  // Render category progress bars
  const container = document.getElementById('categoryBarsContainer');
  if (!container) return;
  container.innerHTML = '';

  expenseCategories.forEach(cat => {
    // Calculate category spending from loggedExpenses
    const catSpent = loggedExpenses
      .filter(e => e.category === cat.name)
      .reduce((sum, e) => sum + e.amount, 0);

    const catBudget = Math.round((cat.allocatedPct / 100) * totalBudget);
    const catPct = Math.min(100, Math.round((catSpent / catBudget) * 100)) || 0;

    const barEl = document.createElement('div');
    barEl.className = 'cat-bar-item';
    barEl.innerHTML = `
      <div class="cat-bar-labels">
        <span>${cat.name} (${cat.allocatedPct}%)</span>
        <span>${symbol}${catSpent} / ${symbol}${catBudget}</span>
      </div>
      <div class="cat-bar-track">
        <div class="cat-bar-fill" style="width: ${catPct}%; background-color: ${cat.color};"></div>
      </div>
    `;
    container.appendChild(barEl);
  });
}

function renderExpenseLog() {
  const listEl = document.getElementById('expenseLogList');
  if (!listEl) return;
  const symbol = currencySymbols[currentCurrency] || '$';

  listEl.innerHTML = '';
  loggedExpenses.slice().reverse().forEach(exp => {
    const item = document.createElement('div');
    item.className = 'expense-item';
    item.innerHTML = `
      <div class="expense-item-info">
        <span class="expense-item-title">${exp.title}</span>
        <span class="expense-item-cat">${exp.category} • ${exp.date}</span>
      </div>
      <span class="expense-item-cost">${symbol}${exp.amount}</span>
    `;
    listEl.appendChild(item);
  });
}

function handleNewExpense(e) {
  e.preventDefault();
  const nameInput = document.getElementById('expenseName');
  const catInput = document.getElementById('expenseCategory');
  const amtInput = document.getElementById('expenseAmount');

  const title = nameInput.value.trim();
  const category = catInput.value;
  const amount = parseFloat(amtInput.value);

  if (!title || isNaN(amount) || amount <= 0) return;

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const newExp = {
    id: Date.now(),
    tripId: activeTrip.id,
    title: title,
    category: category,
    amount: amount,
    date: dateStr
  };

  loggedExpenses.push(newExp);
  if (window.TravelMateDB) {
    TravelMateDB.saveExpense(newExp);
  }

  nameInput.value = '';
  amtInput.value = '';

  renderBudgetBreakdown();
  renderExpenseLog();
  showToast(`Receipt logged: ${title} ✨`);
}

function changeBudgetCurrency(newCurr) {
  currentCurrency = newCurr;
  renderBudgetBreakdown();
  renderExpenseLog();
  showToast(`Budget switched to ${newCurr}!`);
}

// Newsletter subscription simulation
function handleNewsletterSubscribe() {
  const input = document.getElementById('newsletterEmail');
  if (input && input.value.includes('@')) {
    input.value = '';
    showToast('💌 Welcome to the Postcard Club! Check your inbox.');
  } else {
    showToast('Please enter a cute valid email address!');
  }
}
