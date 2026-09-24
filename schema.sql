-- Minimal Persistent Database Schema for TravelMate
-- Stores only essential data: trips, itinerary, packing, budget

CREATE TABLE IF NOT EXISTS trips (
    id TEXT PRIMARY KEY,
    destination TEXT NOT NULL,
    dates TEXT NOT NULL,
    budget REAL NOT NULL,
    currency TEXT DEFAULT 'USD',
    travellers TEXT NOT NULL,
    travel_style TEXT,
    accommodation TEXT,
    pace TEXT,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS itinerary (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trip_id TEXT NOT NULL,
    day_number INTEGER NOT NULL,
    city TEXT NOT NULL,
    hotel TEXT NOT NULL,
    morning_schedule TEXT,
    afternoon_schedule TEXT,
    evening_schedule TEXT,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS packing (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trip_id TEXT NOT NULL,
    item_text TEXT NOT NULL,
    category TEXT NOT NULL,
    is_checked INTEGER DEFAULT 0,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS budget (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trip_id TEXT NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    amount REAL NOT NULL,
    date_logged TEXT,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
);
