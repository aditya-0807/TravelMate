/* ==========================================================
   TRAVELMATE - SCRIPT.JS
   Connected frontend to minimal backend API (SQLite database)
   Operations: Create, View, Edit, Delete trips + Load/Save Itinerary, Packing, Budget
   ========================================================== */

// The backend serves the frontend in production, so use the current origin.
// Keep the local API origin only for standalone local development.
const API_BASE = window.TRAVELMATE_API_BASE ?? (
  window.location.protocol === 'file:' ||
  (['localhost', '127.0.0.1'].includes(window.location.hostname) && window.location.port !== '3000')
    ? 'http://localhost:3000'
    : ''
);

const currencySymbols = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  INR: '₹'
};

let currentCurrency = 'USD';
let currentDayIndex = 1;

// Fallback initial data in case backend is offline
const fallbackTrips = {
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
          desc: 'Land at Kansai Airport, catch the Haruka Express, and check in.',
          chips: ['🚆 Haruka Express', '🧳 Luggage Drop', '🌸 Welcome Matcha']
        },
        afternoon: {
          time: '01:30 PM - 05:00 PM',
          title: 'Walk the Stone Paths of Ninenzaka',
          desc: 'Wander preserved Edo-period alleys lined with traditional teahouses.',
          chips: ['🏮 Wooden Pagodas', '🍡 Dango Snack', '📸 Polaroid Spot']
        },
        evening: {
          time: '06:30 PM - 09:30 PM',
          title: 'Lantern Dining along Shirakawa Canal',
          desc: 'Cozy seasonal kaiseki banquet featuring fresh yuba.',
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
          title: 'Arashiyama Bamboo Forest & Tenryu-ji',
          desc: 'Beat the crowds to experience morning wind through bamboo stalks.',
          chips: ['🎋 Tall Bamboo', '🧘 Zen Rock Garden', '🍵 Cloud Tea']
        },
        afternoon: {
          time: '01:00 PM - 04:30 PM',
          title: 'Romantic Sagano Scenic Train Ride',
          desc: 'Vintage train following the forested curves of Hozu River.',
          chips: ['🚂 Romantic Railway', '🍁 Maple Views', '🛶 River Rapids']
        },
        evening: {
          time: '06:00 PM - 08:30 PM',
          title: 'Tofu Hotpot & Pontocho Alley Stroll',
          desc: 'Sample classic Kyoto boiled Yudofu hotpot and stroll Pontocho.',
          chips: ['🍲 Yudofu Hotpot', '🏮 Pontocho Alleys', '🌙 River Breezes']
        }
      }
    ]
  }
};

let activeTrip = fallbackTrips.kyoto;
let allTrips = [];
let packingItems = [];
let loggedExpenses = [];

let expenseCategories = [
  { name: 'Hotel & Stay', allocatedPct: 40, spent: 850, color: '#A2D2FF' },
  { name: 'Food & Dining', allocatedPct: 25, spent: 420, color: '#FFCCD5' },
  { name: 'Activities & Entry', allocatedPct: 15, spent: 210, color: '#C7F9CC' },
  { name: 'Transport & Metro', allocatedPct: 12, spent: 160, color: '#FFF1A8' },
  { name: 'Souvenirs & Gifts', allocatedPct: 8, spent: 80, color: '#E0C3FC' }
];

// --- Backend API Connectors ---
const api = {
  async getTrips() {
    try {
      const res = await fetch(`${API_BASE}/api/trips`);
      if (!res.ok) throw new Error('API error');
      return await res.json();
    } catch {
      return null;
    }
  },

  async getTrip(id) {
    try {
      const res = await fetch(`${API_BASE}/api/trips/${id}`);
      if (!res.ok) throw new Error('API error');
      return await res.json();
    } catch {
      return null;
    }
  },

  async createTrip(tripData) {
    try {
      const res = await fetch(`${API_BASE}/api/trips`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tripData)
      });
      return await res.json();
    } catch (err) {
      console.warn('Backend offline, using local state:', err);
      return { success: true, tripId: tripData.id };
    }
  },

  async updateTrip(id, tripData) {
    try {
      const res = await fetch(`${API_BASE}/api/trips/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tripData)
      });
      return await res.json();
    } catch (err) {
      console.warn('Backend update error:', err);
      return { success: true };
    }
  },

  async deleteTrip(id) {
    try {
      const res = await fetch(`${API_BASE}/api/trips/${id}`, {
        method: 'DELETE'
      });
      return await res.json();
    } catch (err) {
      console.warn('Backend delete error:', err);
      return { success: true };
    }
  },

  async packingOp(tripId, data) {
    try {
      await fetch(`${API_BASE}/api/trips/${tripId}/packing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (err) {
      console.warn('Backend packing error:', err);
    }
  },

  async budgetOp(tripId, data) {
    try {
      await fetch(`${API_BASE}/api/trips/${tripId}/budget`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (err) {
      console.warn('Backend budget error:', err);
    }
  },

  async generateTrip(tripPreferences) {
    let res;
    try {
      res = await fetch(`${API_BASE}/generate-trip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tripPreferences)
      });
    } catch {
      const backend = API_BASE || window.location.origin;
      throw new Error(`Cannot reach the TravelMate server at ${backend}. Make sure the backend is running and reachable.`);
    }
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || `HTTP ${res.status}: Failed to generate trip`);
    }
    return data;
  }
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', async () => {
  setupNavigation();
  setupMobileMenu();
  await loadInitialData();
});

async function loadInitialData() {
  const backendTrips = await api.getTrips();

  if (backendTrips && backendTrips.length > 0) {
    allTrips = backendTrips;
    renderMyTripsGrid(allTrips);
    await loadTripById(allTrips[0].id);
  } else {
    // Fallback to local
    allTrips = [fallbackTrips.kyoto];
    renderMyTripsGrid(allTrips);
    renderItineraryHeader();
    renderDayTabs();
    renderDaySchedule(1);
    renderPackingList();
    renderBudgetBreakdown();
    renderExpenseLog();
  }
}

// ==========================================================
// 1. PAGE NAVIGATION
// ==========================================================
function setupNavigation() {}

function navigateTo(pageId) {
  const allSections = document.querySelectorAll('.page-section');
  allSections.forEach(section => section.classList.remove('active'));

  const targetSection = document.getElementById(`page-${pageId}`);
  if (targetSection) targetSection.classList.add('active');

  const navBtns = document.querySelectorAll('.nav-item');
  navBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.page === pageId);
  });

  const navLinks = document.getElementById('navLinks');
  if (navLinks && navLinks.classList.contains('mobile-open')) {
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
  setTimeout(() => toast.classList.remove('show'), 3200);
}

// ==========================================================
// 2. VIEW / LOAD TRIP DETAILS (Itinerary, Packing, Budget)
// ==========================================================
async function loadTripById(tripId) {
  const data = await api.getTrip(tripId);

  if (data && data.trip) {
    activeTrip = {
      id: data.trip.id,
      title: data.trip.title,
      destination: data.trip.destination,
      dates: data.trip.dates,
      travellers: data.trip.travellers,
      style: data.trip.travel_style,
      hotel: data.trip.accommodation,
      city: data.trip.city || data.trip.destination,
      totalBudget: data.trip.budget,
      currency: data.trip.currency || 'USD',
      days: data.days && data.days.length > 0 ? data.days : fallbackTrips.kyoto.days
    };

    currentCurrency = activeTrip.currency;
    currentDayIndex = 1;

    packingItems = (data.packing || []).map(p => ({
      id: p.id,
      text: p.item_text,
      category: p.category,
      checked: p.is_checked === 1
    }));

    loggedExpenses = (data.budget || []).map(b => ({
      id: b.id,
      title: b.title,
      category: b.category,
      amount: b.amount,
      date: b.date_logged || 'Today'
    }));
  }

  renderItineraryHeader();
  renderDayTabs();
  renderDaySchedule(1);
  renderPackingList();
  renderBudgetBreakdown();
  renderExpenseLog();
}

function renderItineraryHeader() {
  document.getElementById('itineraryStyleTag').textContent = activeTrip.style || '🏛️ Cultural';
  document.getElementById('itineraryDestinationTitle').textContent = activeTrip.title;
  document.getElementById('itineraryDatesDisplay').textContent = `📅 ${activeTrip.dates} • ${activeTrip.travellers}`;
  document.getElementById('itineraryHotelDisplay').textContent = activeTrip.hotel;
  document.getElementById('itineraryCityDisplay').textContent = activeTrip.city;
}

function renderDayTabs() {
  const container = document.getElementById('dayTabsContainer');
  if (!container) return;
  container.innerHTML = '';

  activeTrip.days.forEach(day => {
    const dayBtn = document.createElement('button');
    dayBtn.className = `day-tab ${day.dayNum === currentDayIndex ? 'active' : ''}`;
    dayBtn.onclick = () => selectDay(day.dayNum);
    dayBtn.innerHTML = `
      <span class="day-title">Day ${day.dayNum}</span>
      <span class="day-subtitle">${day.subtitle || 'Explore'}</span>
    `;
    container.appendChild(dayBtn);
  });
}

function selectDay(dayNum) {
  currentDayIndex = dayNum;
  const tabs = document.querySelectorAll('.day-tab');
  tabs.forEach((tab, index) => {
    tab.classList.toggle('active', index + 1 === dayNum);
  });
  renderDaySchedule(dayNum);
}

function renderDaySchedule(dayNum) {
  const container = document.getElementById('dayScheduleContainer');
  if (!container) return;

  const dayData = activeTrip.days.find(d => d.dayNum === dayNum) || activeTrip.days[0];
  if (!dayData) return;

  const renderChips = (chips) => Array.isArray(chips) ? chips.map(c => `<span class="slot-chip">${c}</span>`).join('') : '';

  container.innerHTML = `
    <div class="day-overview-bar">
      <div>
        <span class="badge-cute">Day ${dayData.dayNum} of ${activeTrip.days.length}</span>
        <h3>${dayData.theme || 'Day Schedule'}</h3>
      </div>
      <div class="day-stats-pill">
        🏨 ${dayData.hotel || activeTrip.hotel} • 📍 ${dayData.city || activeTrip.city}
      </div>
    </div>

    <div class="timeline-schedules">
      <div class="time-slot-card">
        <div class="slot-left">
          <span class="slot-tag morning">🌅 Morning</span>
          <span class="slot-time">${dayData.morning?.time || '09:00 AM - 12:00 PM'}</span>
        </div>
        <div class="slot-right">
          <h4>${dayData.morning?.title || 'Morning Walk'}</h4>
          <p class="slot-activity-desc">${dayData.morning?.desc || 'Explore local neighborhood and coffee shops.'}</p>
          <div class="slot-meta-chips">${renderChips(dayData.morning?.chips || ['☕ Morning Cafe', '🚶 Stroll'])}</div>
        </div>
      </div>

      <div class="time-slot-card">
        <div class="slot-left">
          <span class="slot-tag afternoon">☀️ Afternoon</span>
          <span class="slot-time">${dayData.afternoon?.time || '01:30 PM - 05:00 PM'}</span>
        </div>
        <div class="slot-right">
          <h4>${dayData.afternoon?.title || 'Afternoon Adventure'}</h4>
          <p class="slot-activity-desc">${dayData.afternoon?.desc || 'Sightseeing landmark attractions and capturing polaroids.'}</p>
          <div class="slot-meta-chips">${renderChips(dayData.afternoon?.chips || ['📸 Photo Spot', '🛍️ Crafts'])}</div>
        </div>
      </div>

      <div class="time-slot-card">
        <div class="slot-left">
          <span class="slot-tag evening">🌙 Evening</span>
          <span class="slot-time">${dayData.evening?.time || '06:30 PM - 09:30 PM'}</span>
        </div>
        <div class="slot-right">
          <h4>${dayData.evening?.title || 'Evening Dinner'}</h4>
          <p class="slot-activity-desc">${dayData.evening?.desc || 'Delicious dinner banquet and relaxed evening stroll.'}</p>
          <div class="slot-meta-chips">${renderChips(dayData.evening?.chips || ['🍲 Dinner', '✨ Night Stroll'])}</div>
        </div>
      </div>
    </div>
  `;
}

// ==========================================================
// 3. CREATE, EDIT & DELETE TRIPS (CRUD)
// ==========================================================
async function handleTripPlanSubmit(e) {
  if (e && e.preventDefault) e.preventDefault();

  const destinationInput = document.getElementById('destinationInput');
  const destination = destinationInput ? destinationInput.value.trim() : '';
  const depDate = document.getElementById('departureDate').value;
  const retDate = document.getElementById('returnDate').value;
  const budget = parseFloat(document.getElementById('budgetAmount').value) || 1500;
  const currency = document.getElementById('budgetCurrency').value;
  const travellers = parseInt(document.getElementById('travellerCount').value) || 1;
  const style = document.getElementById('travelStyle').value;
  const accommodation = document.getElementById('accommodationType').value;
  const pace = document.getElementById('travelPace').value;
  const notesInput = document.getElementById('tripNotes');
  const notes = notesInput ? notesInput.value.trim() : '';

  const travellerTypeRadio = document.querySelector('input[name="travellerType"]:checked');
  const travellerType = travellerTypeRadio ? travellerTypeRadio.value : 'couple';

  if (!destination) {
    showToast('⚠️ Please enter a destination!');
    return;
  }

  const submitBtn = document.getElementById('planSubmitBtn') || (e?.target ? e.target.querySelector('button[type="submit"]') : null);
  const resetBtn = document.getElementById('planResetBtn');
  const originalBtnHTML = '<span>✨ Create Scrapbook Itinerary ✨</span>';

  // Loading state
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>⏳ Consulting Groq AI (gpt-oss-120b)...</span>';
  }
  if (resetBtn) resetBtn.disabled = true;
  hidePlanError();
  showToast('✨ Groq AI is crafting your personalized trip scrapbook...');

  try {
    const payload = {
      destination,
      depDate,
      retDate,
      budget,
      currency,
      travellers,
      travellerType,
      style,
      accommodation,
      pace,
      notes
    };

    const result = await api.generateTrip(payload);

    if (result && result.success) {
      // Reload trips from database
      const updatedTrips = await api.getTrips();
      if (updatedTrips) {
        allTrips = updatedTrips;
        renderMyTripsGrid(allTrips);
      }

      await loadTripById(result.tripId);
      navigateTo('itinerary');
      showToast(`✨ Generated "${activeTrip.title}" with Groq AI!`);
    } else {
      throw new Error(result.error || 'Failed to generate itinerary');
    }
  } catch (err) {
    console.error('Groq Trip generation error:', err);
    showPlanError(err.message || 'Error generating trip with Groq AI. Click retry to try again.');
    showToast(`❌ ${err.message || 'Generation failed. Click retry.'}`);
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      const errBox = document.getElementById('planErrorBox');
      if (errBox && errBox.style.display !== 'none') {
        submitBtn.innerHTML = '<span>🔄 Retry Trip Generation</span>';
      } else {
        submitBtn.innerHTML = originalBtnHTML;
      }
    }
    if (resetBtn) resetBtn.disabled = false;
  }
}

function showPlanError(msg) {
  const box = document.getElementById('planErrorBox');
  const text = document.getElementById('planErrorText');
  if (box && text) {
    text.textContent = msg;
    box.style.display = 'block';
  }
}

function hidePlanError() {
  const box = document.getElementById('planErrorBox');
  if (box) box.style.display = 'none';
  const submitBtn = document.getElementById('planSubmitBtn');
  if (submitBtn && !submitBtn.disabled) {
    submitBtn.innerHTML = '<span>✨ Create Scrapbook Itinerary ✨</span>';
  }
}

function retryTripPlanSubmit() {
  const form = document.getElementById('tripPlanForm');
  if (form) {
    if (typeof form.requestSubmit === 'function') {
      form.requestSubmit();
    } else {
      handleTripPlanSubmit({ preventDefault: () => {}, target: form });
    }
  }
}

async function editTripPrompt(tripId) {
  const trip = allTrips.find(t => t.id === tripId) || activeTrip;
  const newTitle = prompt('Edit Trip Title:', trip.title);
  if (!newTitle) return;

  const newBudget = prompt('Edit Budget Amount:', trip.budget || trip.totalBudget || 2000);
  const budgetNum = parseFloat(newBudget);

  const payload = {
    title: newTitle,
    budget: isNaN(budgetNum) ? trip.budget : budgetNum
  };

  await api.updateTrip(tripId, payload);
  const updatedTrips = await api.getTrips();
  if (updatedTrips) {
    allTrips = updatedTrips;
    renderMyTripsGrid(allTrips);
  }
  if (activeTrip.id === tripId) {
    await loadTripById(tripId);
  }
  showToast('Trip updated in database! ✨');
}

async function deleteTripPrompt(tripId) {
  const confirmDelete = confirm('Are you sure you want to remove this trip scrapbook from the database?');
  if (!confirmDelete) return;

  await api.deleteTrip(tripId);
  showToast('Trip deleted from database 🗑️');

  const updatedTrips = await api.getTrips();
  if (updatedTrips && updatedTrips.length > 0) {
    allTrips = updatedTrips;
    renderMyTripsGrid(allTrips);
    if (activeTrip.id === tripId) {
      await loadTripById(allTrips[0].id);
    }
  } else {
    allTrips = [];
    renderMyTripsGrid([]);
  }
}

function renderMyTripsGrid(trips) {
  const grid = document.getElementById('myTripsGrid');
  if (!grid) return;
  grid.innerHTML = '';

  if (trips.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
        <p style="font-family: var(--font-hand); font-size: 1.6rem; color: var(--ink-secondary);">
          No saved trips yet. Click "+ Plan Trip" to create one! 🌸
        </p>
      </div>
    `;
    return;
  }

  const covers = [
    'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80'
  ];

  trips.forEach((trip, index) => {
    const card = document.createElement('div');
    card.className = 'trip-scrapbook-card';
    const cover = covers[index % covers.length];
    const currSym = currencySymbols[trip.currency] || '$';

    card.innerHTML = `
      <div class="washi-tape ${index % 2 === 0 ? 'mint-tape' : 'pink-tape'}"></div>
      <div class="trip-stamp-status stamp-upcoming">Saved</div>
      <div class="trip-cover-img" style="background-image: url('${cover}');"></div>
      <div class="trip-card-body">
        <span class="trip-destination-tag">${trip.destination}</span>
        <h3>${trip.title}</h3>
        <p class="trip-dates">📅 ${trip.dates}</p>
        <div class="trip-meta-tags">
          <span class="tag-pill tag-pink">👥 ${trip.travellers}</span>
          <span class="tag-pill tag-yellow">${currSym}${trip.budget}</span>
          <span class="tag-pill tag-mint">${trip.travel_style || 'Travel'}</span>
        </div>
        <div class="trip-card-actions">
          <button class="btn-secondary btn-sm" onclick="loadTripAndSwitch('${trip.id}')">Open Itinerary</button>
          <div style="display: flex; gap: 0.3rem;">
            <button class="btn-ghost-sm" onclick="editTripPrompt('${trip.id}')" title="Edit trip">✏️ Edit</button>
            <button class="btn-ghost-sm" onclick="deleteTripPrompt('${trip.id}')" title="Delete trip" style="color: #e63946;">🗑️</button>
          </div>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

async function loadTripAndSwitch(tripId) {
  await loadTripById(tripId);
  navigateTo('itinerary');
  showToast(`Loaded ${activeTrip.title}!`);
}

function updateTravellerCount(defaultNum) {
  document.getElementById('travellerCount').value = defaultNum;
  const pills = document.querySelectorAll('#travellerTypeGroup .radio-pill');
  pills.forEach(pill => {
    const radio = pill.querySelector('input');
    pill.classList.toggle('active', radio.checked);
  });
}

function stepCount(delta) {
  const input = document.getElementById('travellerCount');
  let val = parseInt(input.value) || 1;
  val = Math.max(1, Math.min(30, val + delta));
  input.value = val;
}

function quickFillPlan(destinationName, travelStyle) {
  document.getElementById('destinationInput').value = destinationName;
  document.getElementById('travelStyle').value = travelStyle;
  navigateTo('plan');
  showToast(`Filled in ${destinationName}! Ready to customize.`);
}

// ==========================================================
// 4. PACKING LIST (Connected to Backend Database)
// ==========================================================
function renderPackingList() {
  const categories = ['clothes', 'toiletries', 'tech', 'documents'];

  categories.forEach(cat => {
    const listEl = document.getElementById(`packingList-${cat}`);
    const countEl = document.getElementById(`count-${cat}`);
    if (!listEl) return;

    const itemsInCat = packingItems.filter(i => i.category === cat);
    const checkedCount = itemsInCat.filter(i => i.checked).length;

    if (countEl) countEl.textContent = `${checkedCount}/${itemsInCat.length}`;

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

async function togglePackingItem(itemId) {
  const item = packingItems.find(i => i.id === itemId);
  if (item) {
    item.checked = !item.checked;
    await api.packingOp(activeTrip.id, { action: 'toggle', id: itemId, checked: item.checked });
    renderPackingList();
  }
}

async function deletePackingItem(itemId) {
  packingItems = packingItems.filter(i => i.id !== itemId);
  await api.packingOp(activeTrip.id, { action: 'delete', id: itemId });
  renderPackingList();
  showToast('Item removed from luggage checklist');
}

async function addCustomPackingItem() {
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
  await api.packingOp(activeTrip.id, { action: 'add', id: newItem.id, text: newItem.text, category: newItem.category, checked: false });
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
// 5. BUDGET TRACKER (Connected to Backend Database)
// ==========================================================
function renderBudgetBreakdown() {
  const symbol = currencySymbols[currentCurrency] || '$';
  const totalBudget = activeTrip.totalBudget || activeTrip.budget || 2200;

  const totalSpent = loggedExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const remaining = Math.max(0, totalBudget - totalSpent);
  const spentPct = Math.round((totalSpent / totalBudget) * 100) || 0;

  document.getElementById('budgetTotalDisplay').textContent = `${symbol}${totalBudget.toLocaleString()}`;
  document.getElementById('budgetSpentDisplay').textContent = `${symbol}${Math.round(totalSpent).toLocaleString()}`;
  document.getElementById('budgetRemainingDisplay').textContent = `${symbol}${Math.round(remaining).toLocaleString()}`;
  document.getElementById('budgetCurrencyLabel').textContent = `Currency: ${currentCurrency} (${symbol})`;
  document.getElementById('budgetSpentPct').textContent = `${spentPct}% of budget logged`;

  const container = document.getElementById('categoryBarsContainer');
  if (!container) return;
  container.innerHTML = '';

  expenseCategories.forEach(cat => {
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

async function handleNewExpense(e) {
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
  await api.budgetOp(activeTrip.id, newExp);

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

function handleNewsletterSubscribe() {
  const input = document.getElementById('newsletterEmail');
  if (input && input.value.includes('@')) {
    input.value = '';
    showToast('💌 Welcome to the Postcard Club! Check your inbox.');
  } else {
    showToast('Please enter a cute valid email address!');
  }
}
