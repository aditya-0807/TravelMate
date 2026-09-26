-- SQLite schema used by server.js for persisted trips and trip details.

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
