export const getMigrations = () => {
  return [
    `CREATE TABLE IF NOT EXISTS trips (
      id              TEXT PRIMARY KEY,
      user_id         TEXT NOT NULL,
      name            TEXT NOT NULL,
      destinations    TEXT NOT NULL,
      cover_photo_url TEXT,
      start_date      TEXT NOT NULL,
      end_date        TEXT,
      tags            TEXT NOT NULL,
      intro_note      TEXT,
      is_archived     INTEGER NOT NULL DEFAULT 0,
      place_count     INTEGER DEFAULT 0,
      centroid_lat    REAL,
      centroid_lng    REAL,
      created_at      TEXT NOT NULL,
      updated_at      TEXT NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS places (
      id              TEXT PRIMARY KEY,
      trip_id         TEXT NOT NULL,
      user_id         TEXT NOT NULL,
      name            TEXT NOT NULL,
      address         TEXT,
      latitude        REAL NOT NULL,
      longitude       REAL NOT NULL,
      visited_at      TEXT NOT NULL,
      logged_at       TEXT NOT NULL,
      notes           TEXT,
      spend_amount    REAL,
      spend_currency  TEXT,
      category        TEXT NOT NULL DEFAULT 'Other',
      custom_fields   TEXT NOT NULL DEFAULT '{}',
      visit_order     INTEGER NOT NULL,
      created_at      TEXT NOT NULL,
      updated_at      TEXT NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS place_photos (
      id              TEXT PRIMARY KEY,
      place_id        TEXT NOT NULL,
      cloudinary_id   TEXT,
      remote_url      TEXT,
      thumbnail_url   TEXT,
      local_uri       TEXT,
      display_order   INTEGER NOT NULL,
      captured_at     TEXT,
      created_at      TEXT NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS place_voice_notes (
      id              TEXT PRIMARY KEY,
      place_id        TEXT NOT NULL,
      cloudinary_id   TEXT,
      remote_url      TEXT,
      local_uri       TEXT,
      duration_sec    INTEGER,
      display_order   INTEGER NOT NULL DEFAULT 0,
      created_at      TEXT NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS custom_field_definitions (
      id              TEXT PRIMARY KEY,
      user_id         TEXT NOT NULL,
      name            TEXT NOT NULL,
      field_type      TEXT NOT NULL,
      options         TEXT NOT NULL DEFAULT '[]',
      default_value   TEXT,
      display_order   INTEGER NOT NULL DEFAULT 0,
      created_at      TEXT NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS sync_queue (
      id              TEXT PRIMARY KEY,
      operation       TEXT NOT NULL,
      endpoint        TEXT NOT NULL,
      payload         TEXT NOT NULL,
      local_files     TEXT NOT NULL DEFAULT '[]',
      retries         INTEGER NOT NULL DEFAULT 0,
      status          TEXT NOT NULL DEFAULT 'pending',
      created_at      TEXT NOT NULL
    );`,
    `CREATE INDEX IF NOT EXISTS idx_trips_user ON trips(user_id);`,
    `CREATE INDEX IF NOT EXISTS idx_places_trip ON places(trip_id, visit_order);`,
    `CREATE INDEX IF NOT EXISTS idx_photos_place ON place_photos(place_id, display_order);`,
    `CREATE INDEX IF NOT EXISTS idx_voice_place ON place_voice_notes(place_id, display_order);`,
    `CREATE INDEX IF NOT EXISTS idx_queue_status ON sync_queue(status, created_at);`
  ];
};
