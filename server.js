const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const PORT = 3000;
const DB_PATH = path.join(__dirname, 'travelmate.db');
const STATIC_DIR = path.join(__dirname, 'TravelMate');

// Initialize SQLite database
const db = new DatabaseSync(DB_PATH);

// Create tables from schema
db.exec(`
  CREATE TABLE IF NOT EXISTS trips (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    destination TEXT NOT NULL,
    dates TEXT NOT NULL,
    budget REAL NOT NULL,
    currency TEXT DEFAULT 'USD',
    travellers TEXT NOT NULL,
    travel_style TEXT,
    accommodation TEXT,
    pace TEXT,
    notes TEXT,
    city TEXT
  );

  CREATE TABLE IF NOT EXISTS itinerary (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trip_id TEXT NOT NULL,
    day_number INTEGER NOT NULL,
    subtitle TEXT,
    theme TEXT,
    city TEXT,
    hotel TEXT,
    morning TEXT,
    afternoon TEXT,
    evening TEXT
  );

  CREATE TABLE IF NOT EXISTS packing (
    id INTEGER PRIMARY KEY,
    trip_id TEXT NOT NULL,
    item_text TEXT NOT NULL,
    category TEXT NOT NULL,
    is_checked INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS budget (
    id INTEGER PRIMARY KEY,
    trip_id TEXT NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    amount REAL NOT NULL,
    date_logged TEXT
  );
`);

// Seed default trip if DB is empty
const tripCount = db.prepare('SELECT COUNT(*) as count FROM trips').get().count;
if (tripCount === 0) {
  const insertTrip = db.prepare(`
    INSERT INTO trips (id, title, destination, dates, budget, currency, travellers, travel_style, accommodation, pace, notes, city)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertTrip.run(
    'kyoto',
    'Kyoto & Nara Heritage Walk',
    'Kyoto, Japan',
    'Oct 15 - Oct 20 (5 Days)',
    2200,
    'USD',
    '2 Travellers (Couple)',
    '🏛️ Cultural & Historic',
    'Gion Kumo Boutique Inn',
    'Balanced & Steady',
    'Visit historic shrines and try matcha soft serve!',
    'Kyoto & Nara, Japan'
  );

  const insertItinerary = db.prepare(`
    INSERT INTO itinerary (trip_id, day_number, subtitle, theme, city, hotel, morning, afternoon, evening)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const kyotoDays = [
    {
      day: 1, sub: 'Arrival & Lanterns', theme: 'Gion Canal Stroll & Tea Houses', city: 'Kyoto Old Quarter', hotel: 'Gion Kumo Boutique Inn',
      m: JSON.stringify({ time: '09:00 AM - 12:00 PM', title: 'Arrival & Check-in at Gion Ryokan', desc: 'Land at Kansai Airport, catch the Haruka Express, and check in.', chips: ['🚆 Haruka Express', '🧳 Luggage Drop', '🌸 Welcome Matcha'] }),
      a: JSON.stringify({ time: '01:30 PM - 05:00 PM', title: 'Walk Stone Paths of Ninenzaka', desc: 'Wander preserved Edo-period alleys lined with teahouses.', chips: ['🏮 Wooden Pagodas', '🍡 Dango Snack', '📸 Polaroid Spot'] }),
      e: JSON.stringify({ time: '06:30 PM - 09:30 PM', title: 'Lantern Dining along Shirakawa Canal', desc: 'Cozy seasonal kaiseki banquet featuring fresh yuba.', chips: ['🍲 Kaiseki Dinner', '🍶 Sake Tasting', '✨ River Night Walk'] })
    },
    {
      day: 2, sub: 'Bamboo Groves', theme: 'Arashiyama River & Forest Whispers', city: 'Arashiyama, Kyoto', hotel: 'Gion Kumo Boutique Inn',
      m: JSON.stringify({ time: '07:30 AM - 11:30 AM', title: 'Arashiyama Bamboo Forest & Tenryu-ji', desc: 'Beat the morning crowds at the bamboo grove.', chips: ['🎋 Tall Bamboo', '🧘 Zen Rock Garden', '🍵 Cloud Tea'] }),
      a: JSON.stringify({ time: '01:00 PM - 04:30 PM', title: 'Romantic Sagano Scenic Train Ride', desc: 'Vintage train following the forested curves of Hozu River.', chips: ['🚂 Romantic Railway', '🍁 Maple Views', '🛶 River Rapids'] }),
      e: JSON.stringify({ time: '06:00 PM - 08:30 PM', title: 'Tofu Hotpot & Pontocho Alley Stroll', desc: 'Sample classic Yudofu hotpot and stroll Pontocho.', chips: ['🍲 Yudofu Hotpot', '🏮 Pontocho Alleys', '🌙 River Breezes'] })
    },
    {
      day: 3, sub: 'Golden Pavilion', theme: 'Kinkaku-ji & Zen Reflection', city: 'Northern Kyoto', hotel: 'Gion Kumo Boutique Inn',
      m: JSON.stringify({ time: '09:00 AM - 12:00 PM', title: 'Kinkaku-ji (Golden Pavilion)', desc: 'Marvel at the gold-leaf-covered pavilion over the mirror pond.', chips: ['✨ Golden Pavilion', '🍵 Matcha Bowls', '📷 Postcard Views'] }),
      a: JSON.stringify({ time: '02:00 PM - 05:00 PM', title: 'Philosopher’s Path & Ginkaku-ji', desc: 'A calm stone path canal walk with craft shops.', chips: ['🐈 Canal Cats', '🎨 Handcraft Ceramic', '🚶 Peaceful Walk'] }),
      e: JSON.stringify({ time: '06:30 PM - 09:00 PM', title: 'Sizzling Okonomiyaki Feast', desc: 'Savory cabbage pancake grilled at chef counter.', chips: ['🥞 Savory Pancake', '🍺 Craft IPA', '🥢 Chef Counter'] })
    }
  ];

  for (const d of kyotoDays) {
    insertItinerary.run('kyoto', d.day, d.sub, d.theme, d.city, d.hotel, d.m, d.a, d.e);
  }

  const insertPacking = db.prepare(`
    INSERT INTO packing (id, trip_id, item_text, category, is_checked)
    VALUES (?, ?, ?, ?, ?)
  `);

  const initialPacking = [
    { id: 1, text: 'Cozy Oversized Cardigan', cat: 'clothes', checked: 1 },
    { id: 2, text: 'Comfortable Walking Sneakers', cat: 'clothes', checked: 1 },
    { id: 3, text: 'Breathable Cotton Tees', cat: 'clothes', checked: 0 },
    { id: 4, text: 'Hydrating Facial Mist', cat: 'toiletries', checked: 1 },
    { id: 5, text: 'Sunscreen SPF 50+', cat: 'toiletries', checked: 1 },
    { id: 6, text: 'Polaroid Instant Camera + Film', cat: 'tech', checked: 1 },
    { id: 7, text: 'Universal Travel Plug Adapter', cat: 'tech', checked: 0 },
    { id: 8, text: 'Passport & Waterproof Pouch', cat: 'documents', checked: 1 },
    { id: 9, text: 'Printed Hotel Bookings', cat: 'documents', checked: 1 }
  ];

  for (const p of initialPacking) {
    insertPacking.run(p.id, 'kyoto', p.text, p.cat, p.checked);
  }

  const insertBudget = db.prepare(`
    INSERT INTO budget (id, trip_id, title, category, amount, date_logged)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const initialBudget = [
    { id: 1, title: 'Ryokan Deposit & Taxes', cat: 'Hotel & Stay', amt: 850, d: 'Oct 15' },
    { id: 2, title: 'Kiyomizu-dera Entry & Amulets', cat: 'Activities & Entry', amt: 45, d: 'Oct 15' },
    { id: 3, title: 'Matcha Parfait & Dango', cat: 'Food & Dining', amt: 28, d: 'Oct 15' },
    { id: 4, title: 'IC Transit Card Top-Up', cat: 'Transport & Metro', amt: 60, d: 'Oct 16' },
    { id: 5, title: 'Kaiseki Dinner Banquet', cat: 'Food & Dining', amt: 140, d: 'Oct 16' }
  ];

  for (const b of initialBudget) {
    insertBudget.run(b.id, 'kyoto', b.title, b.cat, b.amt, b.d);
  }
}

// Request helper
function parseBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', chunk => data += chunk);
    req.on('end', () => {
      try {
        resolve(JSON.parse(data || '{}'));
      } catch {
        resolve({});
      }
    });
  });
}

function sendJSON(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(payload));
}

// Server router
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;
  const method = req.method;

  // Handle CORS Preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }

  // --- API ROUTES ---

  // 1. GET /api/trips (List all trips)
  if (pathname === '/api/trips' && method === 'GET') {
    const trips = db.prepare('SELECT * FROM trips ORDER BY ROWID DESC').all();
    return sendJSON(res, 200, trips);
  }

  // 2. POST /api/trips (Create trip with itinerary, packing, budget)
  if (pathname === '/api/trips' && method === 'POST') {
    const body = await parseBody(req);
    const tripId = body.id || 'trip_' + Date.now();

    db.prepare(`
      INSERT INTO trips (id, title, destination, dates, budget, currency, travellers, travel_style, accommodation, pace, notes, city)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      tripId,
      body.title || `${body.destination} Scrapbook`,
      body.destination,
      body.dates,
      body.budget || 2000,
      body.currency || 'USD',
      body.travellers || '1 Solo',
      body.travel_style || body.style || 'Cultural',
      body.accommodation || body.hotel || 'Boutique Hotel',
      body.pace || 'Balanced',
      body.notes || '',
      body.city || body.destination
    );

    // Save itinerary days if provided
    if (Array.isArray(body.days)) {
      const stmt = db.prepare(`
        INSERT INTO itinerary (trip_id, day_number, subtitle, theme, city, hotel, morning, afternoon, evening)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const d of body.days) {
        stmt.run(
          tripId,
          d.dayNum || d.day || 1,
          d.subtitle || `Day ${d.dayNum}`,
          d.theme || 'Exploration',
          d.city || body.destination,
          d.hotel || body.accommodation,
          typeof d.morning === 'object' ? JSON.stringify(d.morning) : d.morning,
          typeof d.afternoon === 'object' ? JSON.stringify(d.afternoon) : d.afternoon,
          typeof d.evening === 'object' ? JSON.stringify(d.evening) : d.evening
        );
      }
    }

    return sendJSON(res, 201, { success: true, tripId });
  }

  // 3. GET /api/trips/:id (Get full trip data: details, days, packing, budget)
  const tripMatch = pathname.match(/^\/api\/trips\/([^/]+)$/);
  if (tripMatch && method === 'GET') {
    const tripId = tripMatch[1];
    const trip = db.prepare('SELECT * FROM trips WHERE id = ?').get(tripId);
    if (!trip) return sendJSON(res, 404, { error: 'Trip not found' });

    const rawDays = db.prepare('SELECT * FROM itinerary WHERE trip_id = ? ORDER BY day_number ASC').all(tripId);
    const days = rawDays.map(d => ({
      dayNum: d.day_number,
      subtitle: d.subtitle,
      theme: d.theme,
      city: d.city,
      hotel: d.hotel,
      morning: typeof d.morning === 'string' && d.morning.startsWith('{') ? JSON.parse(d.morning) : d.morning,
      afternoon: typeof d.afternoon === 'string' && d.afternoon.startsWith('{') ? JSON.parse(d.afternoon) : d.afternoon,
      evening: typeof d.evening === 'string' && d.evening.startsWith('{') ? JSON.parse(d.evening) : d.evening
    }));

    const packing = db.prepare('SELECT * FROM packing WHERE trip_id = ?').all(tripId);
    const budget = db.prepare('SELECT * FROM budget WHERE trip_id = ?').all(tripId);

    return sendJSON(res, 200, { trip, days, packing, budget });
  }

  // 4. PUT /api/trips/:id (Edit trip)
  if (tripMatch && method === 'PUT') {
    const tripId = tripMatch[1];
    const body = await parseBody(req);
    const existing = db.prepare('SELECT * FROM trips WHERE id = ?').get(tripId);
    if (!existing) return sendJSON(res, 404, { error: 'Trip not found' });

    db.prepare(`
      UPDATE trips
      SET title = ?, destination = ?, dates = ?, budget = ?, currency = ?, travellers = ?, travel_style = ?, accommodation = ?, pace = ?, notes = ?
      WHERE id = ?
    `).run(
      body.title || existing.title,
      body.destination || existing.destination,
      body.dates || existing.dates,
      body.budget !== undefined ? body.budget : existing.budget,
      body.currency || existing.currency,
      body.travellers || existing.travellers,
      body.travel_style || existing.travel_style,
      body.accommodation || existing.accommodation,
      body.pace || existing.pace,
      body.notes !== undefined ? body.notes : existing.notes,
      tripId
    );

    return sendJSON(res, 200, { success: true });
  }

  // 5. DELETE /api/trips/:id (Delete trip and cascade)
  if (tripMatch && method === 'DELETE') {
    const tripId = tripMatch[1];
    db.prepare('DELETE FROM trips WHERE id = ?').run(tripId);
    db.prepare('DELETE FROM itinerary WHERE trip_id = ?').run(tripId);
    db.prepare('DELETE FROM packing WHERE trip_id = ?').run(tripId);
    db.prepare('DELETE FROM budget WHERE trip_id = ?').run(tripId);
    return sendJSON(res, 200, { success: true });
  }

  // 6. Packing operations: POST /api/trips/:id/packing
  const packMatch = pathname.match(/^\/api\/trips\/([^/]+)\/packing$/);
  if (packMatch && method === 'POST') {
    const tripId = packMatch[1];
    const body = await parseBody(req);

    if (body.action === 'add') {
      const stmt = db.prepare(`
        INSERT INTO packing (id, trip_id, item_text, category, is_checked)
        VALUES (?, ?, ?, ?, ?)
      `);
      stmt.run(body.id || Date.now(), tripId, body.text, body.category, body.checked ? 1 : 0);
      return sendJSON(res, 201, { success: true });
    }

    if (body.action === 'toggle') {
      db.prepare('UPDATE packing SET is_checked = ? WHERE id = ?').run(body.checked ? 1 : 0, body.id);
      return sendJSON(res, 200, { success: true });
    }

    if (body.action === 'delete') {
      db.prepare('DELETE FROM packing WHERE id = ?').run(body.id);
      return sendJSON(res, 200, { success: true });
    }
  }

  // 7. Budget operations: POST /api/trips/:id/budget
  const budgetMatch = pathname.match(/^\/api\/trips\/([^/]+)\/budget$/);
  if (budgetMatch && method === 'POST') {
    const tripId = budgetMatch[1];
    const body = await parseBody(req);
    const stmt = db.prepare(`
      INSERT INTO budget (id, trip_id, title, category, amount, date_logged)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(body.id || Date.now(), tripId, body.title, body.category, body.amount, body.date || 'Today');
    return sendJSON(res, 201, { success: true });
  }

  // --- STATIC FILE SERVING ---
  let filePath = path.join(STATIC_DIR, pathname === '/' ? 'index.html' : pathname);
  if (!fs.existsSync(filePath)) {
    filePath = path.join(STATIC_DIR, 'index.html');
  }

  const ext = path.extname(filePath);
  const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml'
  };

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      return res.end('File Not Found');
    }
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/plain' });
    res.end(content);
  });
});

server.listen(PORT, () => {
  console.log(`TravelMate backend listening on http://localhost:${PORT}`);
});
