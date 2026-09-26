const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

// Load environment variables from .env
function loadEnv() {
  const envCandidates = [
    path.join(__dirname, '.env'),
    path.join(__dirname, '..', '.env'),
    path.join(process.cwd(), '.env')
  ];
  for (const envPath of envCandidates) {
    if (fs.existsSync(envPath)) {
      try {
        if (typeof process.loadEnvFile === 'function') {
          process.loadEnvFile(envPath);
        } else {
          const content = fs.readFileSync(envPath, 'utf8');
          for (const line of content.split(/\r?\n/)) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;
            const eqIdx = trimmed.indexOf('=');
            if (eqIdx > 0) {
              const k = trimmed.slice(0, eqIdx).trim();
              let v = trimmed.slice(eqIdx + 1).trim();
              if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
                v = v.slice(1, -1);
              }
              if (!process.env[k]) {
                process.env[k] = v;
              }
            }
          }
        }
      } catch (err) {
        console.warn('Note: Could not load .env file:', err.message);
      }
    }
  }
}
loadEnv();

const configuredPort = Number.parseInt(process.env.PORT, 10);
const PORT = Number.isInteger(configuredPort) && configuredPort > 0 && configuredPort <= 65535
  ? configuredPort
  : 3000;
const DB_PATH = fs.existsSync(path.join(__dirname, 'travelmate.db'))
  ? path.join(__dirname, 'travelmate.db')
  : (fs.existsSync(path.join(__dirname, '..', 'travelmate.db'))
      ? path.join(__dirname, '..', 'travelmate.db')
      : path.join(__dirname, 'travelmate.db'));

const STATIC_DIR = fs.existsSync(path.join(__dirname, 'index.html'))
  ? __dirname
  : path.join(__dirname, 'TravelMate');

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

// --- GROQ AI INTEGRATION (openai/gpt-oss-120b) ---
async function generateTripWithGroq(body) {
  const apiKey = process.env.XAI_API_KEY || process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === '$$$$$') {
    throw new Error('Groq API key not configured. Please set your valid key in .env (replace XAI_API_KEY=$$$$$ with your key).');
  }

  const destination = (body.destination || '').trim();
  if (!destination) {
    throw new Error('Destination is required.');
  }

  const depDate = body.depDate || '2026-10-15';
  const retDate = body.retDate || '2026-10-20';
  const budget = parseFloat(body.budget) || 2000;
  const currency = body.currency || 'USD';
  const travellers = parseInt(body.travellers) || 2;
  const travellerType = body.travellerType || 'couple';
  const style = body.style || body.travel_style || 'Cultural & Historic';
  const accommodation = body.accommodation || body.hotel || 'Boutique Hotel';
  const pace = body.pace || 'Balanced & Steady';
  const notes = body.notes || '';

  const start = new Date(depDate);
  const end = new Date(retDate);
  let diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  if (isNaN(diffDays) || diffDays < 1) diffDays = 3;
  if (diffDays > 14) diffDays = 14;

  const prompt = `You are TravelMate AI, an expert travel designer. Create a comprehensive, realistic, and aesthetic travel scrapbook itinerary for the following preferences:

Destination: ${destination}
Dates: ${depDate} to ${retDate} (${diffDays} Days)
Budget: ${budget} ${currency}
Travellers: ${travellers} (${travellerType})
Style: ${style}
Accommodation: ${accommodation}
Pace: ${pace}
Special Notes / Wishes: ${notes || 'None'}

Weather & Packing Instructions:
- Infer the realistic local season and climate in ${destination} for the travel dates (${depDate} to ${retDate}).
- Generate packing suggestions specifically tailored to this weather (e.g. rain gear, light cottons, thermal layers, walking shoes, sun care).

Return ONLY a valid JSON object matching this schema:
{
  "summary": {
    "title": "Aesthetic scrapbook title",
    "destination": "${destination}",
    "city": "Primary city name",
    "dates": "${depDate} to ${retDate} (${diffDays} Days)",
    "currency": "${currency}",
    "budget": ${budget},
    "travellers": "${travellers} Traveller(s)",
    "travel_style": "${style}",
    "accommodation": "Specific recommended hotel or inn name",
    "pace": "${pace}",
    "weather_overview": "Seasonal climate summary for these dates"
  },
  "days": [
    {
      "dayNum": 1,
      "subtitle": "Short subtitle (e.g. Arrival & Lanterns)",
      "theme": "Theme description of the day",
      "city": "City or neighborhood for this day",
      "hotel": "Hotel name for this day",
      "morning": {
        "time": "08:30 AM - 11:30 AM",
        "title": "Morning activity title",
        "desc": "Morning activity description",
        "chips": ["emoji chip 1", "emoji chip 2", "emoji chip 3"]
      },
      "afternoon": {
        "time": "01:00 PM - 04:30 PM",
        "title": "Afternoon activity title",
        "desc": "Afternoon activity description",
        "chips": ["emoji chip 1", "emoji chip 2", "emoji chip 3"]
      },
      "evening": {
        "time": "06:30 PM - 09:30 PM",
        "title": "Evening activity title",
        "desc": "Evening activity description",
        "chips": ["emoji chip 1", "emoji chip 2", "emoji chip 3"]
      }
    }
  ],
  "packing": [
    {
      "item_text": "Item name and brief weather/utility context",
      "category": "clothes"
    }
  ],
  "budget": [
    {
      "title": "Planned expense line item",
      "category": "Hotel & Stay",
      "amount": 500,
      "date_logged": "Day 1"
    }
  ]
}

Important Constraints:
1. Provide exactly ${diffDays} days in "days", numbered 1 to ${diffDays}.
2. "packing" must contain 8-12 items. Category MUST strictly be one of: "clothes", "toiletries", "tech", "documents". Include weather-appropriate items.
3. "budget" must contain 5-8 realistic line items summing close to ${budget} ${currency}. Category MUST strictly be one of: "Hotel & Stay", "Food & Dining", "Activities & Entry", "Transport & Metro", "Souvenirs & Gifts".`;

  let lastError;
  const maxRetries = 2;

  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-120b',
          messages: [
            {
              role: 'system',
              content: 'You are TravelMate AI. Output strictly valid JSON without markdown fences, explanation, or extra keys.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errMsg = `Groq API responded with status ${response.status}`;
        try {
          const errJson = JSON.parse(errorText);
          if (errJson.error?.message) {
            errMsg = errJson.error.message;
          }
        } catch {}

        if ((response.status === 429 || response.status >= 500) && attempt <= maxRetries) {
          await new Promise(r => setTimeout(r, 1500 * attempt));
          continue;
        }
        throw new Error(errMsg);
      }

      const resData = await response.json();
      let rawContent = resData.choices?.[0]?.message?.content;
      if (!rawContent) {
        throw new Error('Groq returned empty response content.');
      }

      rawContent = rawContent.trim();
      if (rawContent.startsWith('```json')) {
        rawContent = rawContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (rawContent.startsWith('```')) {
        rawContent = rawContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      const aiData = JSON.parse(rawContent);

      if (!aiData.days || !Array.isArray(aiData.days) || aiData.days.length === 0) {
        throw new Error('AI generated invalid itinerary days structure.');
      }

      const tripId = 'trip_' + Date.now();
      const tripTitle = aiData.summary?.title || `${destination} Scrapbook`;
      const tripDates = aiData.summary?.dates || `${depDate} to ${retDate} (${diffDays} Days)`;
      const tripCity = aiData.summary?.city || destination;
      const tripHotel = aiData.summary?.accommodation || accommodation;
      const tripTravellers = aiData.summary?.travellers || `${travellers} Traveller(s)`;
      const tripPace = aiData.summary?.pace || pace;
      const tripStyle = aiData.summary?.travel_style || style;
      const tripNotes = notes || aiData.summary?.weather_overview || '';

      // 1. Save trip to database
      db.prepare(`
        INSERT INTO trips (id, title, destination, dates, budget, currency, travellers, travel_style, accommodation, pace, notes, city)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        tripId,
        tripTitle,
        destination,
        tripDates,
        budget,
        currency,
        tripTravellers,
        tripStyle,
        tripHotel,
        tripPace,
        tripNotes,
        tripCity
      );

      // 2. Save itinerary days
      const insItin = db.prepare(`
        INSERT INTO itinerary (trip_id, day_number, subtitle, theme, city, hotel, morning, afternoon, evening)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (let i = 0; i < aiData.days.length; i++) {
        const d = aiData.days[i];
        insItin.run(
          tripId,
          d.dayNum || (i + 1),
          d.subtitle || `Day ${i + 1}`,
          d.theme || 'Scrapbook Adventures',
          d.city || tripCity,
          d.hotel || tripHotel,
          typeof d.morning === 'object' ? JSON.stringify(d.morning) : (d.morning || ''),
          typeof d.afternoon === 'object' ? JSON.stringify(d.afternoon) : (d.afternoon || ''),
          typeof d.evening === 'object' ? JSON.stringify(d.evening) : (d.evening || '')
        );
      }

      // 3. Save packing items
      const packingItems = Array.isArray(aiData.packing) ? aiData.packing : [];
      const insPack = db.prepare(`
        INSERT INTO packing (id, trip_id, item_text, category, is_checked)
        VALUES (?, ?, ?, ?, ?)
      `);
      const packBaseId = Date.now();
      for (let i = 0; i < packingItems.length; i++) {
        const p = packingItems[i];
        const validCats = ['clothes', 'toiletries', 'tech', 'documents'];
        const cat = validCats.includes(p.category) ? p.category : 'clothes';
        insPack.run(packBaseId + i, tripId, p.item_text || 'Travel item', cat, 0);
      }

      // 4. Save budget items
      const budgetItems = Array.isArray(aiData.budget) ? aiData.budget : [];
      const insBudget = db.prepare(`
        INSERT INTO budget (id, trip_id, title, category, amount, date_logged)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      const budgetBaseId = Date.now() + 1000;
      for (let i = 0; i < budgetItems.length; i++) {
        const b = budgetItems[i];
        const validBudgetCats = ['Hotel & Stay', 'Food & Dining', 'Activities & Entry', 'Transport & Metro', 'Souvenirs & Gifts'];
        let bCat = b.category || 'Activities & Entry';
        if (!validBudgetCats.includes(bCat)) {
          if (bCat.toLowerCase().includes('hotel') || bCat.toLowerCase().includes('stay')) bCat = 'Hotel & Stay';
          else if (bCat.toLowerCase().includes('food') || bCat.toLowerCase().includes('dine') || bCat.toLowerCase().includes('dining')) bCat = 'Food & Dining';
          else if (bCat.toLowerCase().includes('transport') || bCat.toLowerCase().includes('transit')) bCat = 'Transport & Metro';
          else if (bCat.toLowerCase().includes('souvenir') || bCat.toLowerCase().includes('gift')) bCat = 'Souvenirs & Gifts';
          else bCat = 'Activities & Entry';
        }
        insBudget.run(
          budgetBaseId + i,
          tripId,
          b.title || 'Planned Expense',
          bCat,
          parseFloat(b.amount) || 50,
          b.date_logged || `Day ${Math.min(i + 1, diffDays)}`
        );
      }

      return {
        success: true,
        tripId,
        trip: {
          id: tripId,
          title: tripTitle,
          destination,
          dates: tripDates,
          budget,
          currency,
          travellers: tripTravellers,
          travel_style: tripStyle,
          accommodation: tripHotel,
          pace: tripPace,
          city: tripCity,
          weather_overview: aiData.summary?.weather_overview || ''
        },
        days: aiData.days,
        packing: packingItems,
        budget: budgetItems
      };
    } catch (err) {
      lastError = err?.message === 'fetch failed'
        ? new Error('Could not connect to Groq. Check that the backend host has internet access and can reach api.groq.com.')
        : err;
      if (attempt <= maxRetries && !err.message.includes('not configured')) {
        await new Promise(r => setTimeout(r, 1500 * attempt));
      }
    }
  }

  throw lastError;
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

  // 0. POST /generate-trip or POST /api/generate-trip (Groq AI Trip Generation)
  if ((pathname === '/generate-trip' || pathname === '/api/generate-trip') && method === 'POST') {
    try {
      const body = await parseBody(req);
      if (!body.destination || !body.destination.trim()) {
        return sendJSON(res, 400, { error: 'Destination is required.' });
      }

      const generated = await generateTripWithGroq(body);
      return sendJSON(res, 201, generated);
    } catch (err) {
      console.error('Trip generation error:', err.message);
      const isAuthOrConfig = err.message.includes('not configured') || err.message.includes('API key') || err.message.includes('401');
      return sendJSON(res, isAuthOrConfig ? 400 : 502, { error: err.message });
    }
  }

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
  const staticRoot = path.resolve(STATIC_DIR);
  const requestedPath = pathname === '/' ? 'index.html' : pathname.replace(/^[/\\]+/, '');
  let filePath = path.resolve(staticRoot, requestedPath);
  const isInsideStaticRoot = filePath.startsWith(`${staticRoot}${path.sep}`);
  const requestsHiddenPath = requestedPath.split(/[/\\]+/).some(segment => segment.startsWith('.'));

  if (!isInsideStaticRoot || requestsHiddenPath) {
    res.writeHead(404);
    return res.end('File Not Found');
  }

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
