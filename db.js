/* ==========================================================
   TRAVELMATE - MINIMAL PERSISTENT DATABASE (IndexedDB)
   Stores:
   - trips: destination, dates, budget, travellers, preferences
   - itinerary: trip ID, day, city, hotel, activities
   - packing: trip ID and items
   - budget: trip ID, categories and amounts
   ========================================================== */

const DB_NAME = 'TravelMateDB';
const DB_VERSION = 1;

let dbInstance = null;

const TravelMateDB = {
  // Open and initialize the database
  init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // 1. Trips Store
        if (!db.objectStoreNames.contains('trips')) {
          db.createObjectStore('trips', { keyPath: 'id' });
        }

        // 2. Itinerary Store
        if (!db.objectStoreNames.contains('itinerary')) {
          const itStore = db.createObjectStore('itinerary', { keyPath: 'id', autoIncrement: true });
          itStore.createIndex('tripId', 'tripId', { unique: false });
        }

        // 3. Packing Store
        if (!db.objectStoreNames.contains('packing')) {
          const packStore = db.createObjectStore('packing', { keyPath: 'id' });
          packStore.createIndex('tripId', 'tripId', { unique: false });
        }

        // 4. Budget Store
        if (!db.objectStoreNames.contains('budget')) {
          const budgetStore = db.createObjectStore('budget', { keyPath: 'id' });
          budgetStore.createIndex('tripId', 'tripId', { unique: false });
        }
      };

      request.onsuccess = (event) => {
        dbInstance = event.target.result;
        resolve(dbInstance);
      };

      request.onerror = (event) => {
        console.error('IndexedDB error:', event.target.error);
        reject(event.target.error);
      };
    });
  },

  // --- TRIPS ---
  getAllTrips() {
    return new Promise((resolve, reject) => {
      const tx = dbInstance.transaction('trips', 'readonly');
      const store = tx.objectStore('trips');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  },

  saveTrip(trip) {
    return new Promise((resolve, reject) => {
      const tx = dbInstance.transaction('trips', 'readwrite');
      const store = tx.objectStore('trips');
      const req = store.put(trip);
      req.onsuccess = () => resolve(trip);
      req.onerror = () => reject(req.error);
    });
  },

  // --- ITINERARY ---
  getItinerary(tripId) {
    return new Promise((resolve, reject) => {
      const tx = dbInstance.transaction('itinerary', 'readonly');
      const store = tx.objectStore('itinerary');
      const index = store.index('tripId');
      const req = index.getAll(tripId);
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  },

  saveItineraryDays(tripId, days) {
    return new Promise((resolve, reject) => {
      const tx = dbInstance.transaction('itinerary', 'readwrite');
      const store = tx.objectStore('itinerary');
      const index = store.index('tripId');
      const req = index.getAllKeys(tripId);

      req.onsuccess = () => {
        // Clear previous days for this trip
        req.result.forEach(key => store.delete(key));
        // Add new days
        days.forEach(day => {
          store.add({
            tripId: tripId,
            day: day.dayNum,
            subtitle: day.subtitle,
            theme: day.theme,
            city: day.city,
            hotel: day.hotel,
            morning: day.morning,
            afternoon: day.afternoon,
            evening: day.evening
          });
        });
        tx.oncomplete = () => resolve(true);
      };
      req.onerror = () => reject(req.error);
    });
  },

  // --- PACKING ---
  getPacking(tripId) {
    return new Promise((resolve, reject) => {
      const tx = dbInstance.transaction('packing', 'readonly');
      const store = tx.objectStore('packing');
      const index = store.index('tripId');
      const req = index.getAll(tripId);
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  },

  savePackingItem(item) {
    return new Promise((resolve, reject) => {
      const tx = dbInstance.transaction('packing', 'readwrite');
      const store = tx.objectStore('packing');
      const req = store.put(item);
      req.onsuccess = () => resolve(item);
      req.onerror = () => reject(req.error);
    });
  },

  deletePackingItem(itemId) {
    return new Promise((resolve, reject) => {
      const tx = dbInstance.transaction('packing', 'readwrite');
      const store = tx.objectStore('packing');
      const req = store.delete(itemId);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  },

  // --- BUDGET ---
  getExpenses(tripId) {
    return new Promise((resolve, reject) => {
      const tx = dbInstance.transaction('budget', 'readonly');
      const store = tx.objectStore('budget');
      const index = store.index('tripId');
      const req = index.getAll(tripId);
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  },

  saveExpense(expense) {
    return new Promise((resolve, reject) => {
      const tx = dbInstance.transaction('budget', 'readwrite');
      const store = tx.objectStore('budget');
      const req = store.put(expense);
      req.onsuccess = () => resolve(expense);
      req.onerror = () => reject(req.error);
    });
  }
};
