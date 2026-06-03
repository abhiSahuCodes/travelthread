import * as SQLite from 'expo-sqlite';
import { getMigrations } from './migrations';

let db = null;

export const initDatabase = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync('travelthread.db');
    const statements = getMigrations();
    for (const stmt of statements) {
      await db.execAsync(stmt);
    }
  }
};

export const clearDatabase = async () => {
  if (db) {
    const tables = ['trips', 'places', 'place_photos', 'place_voice_notes', 'custom_field_definitions', 'sync_queue'];
    for (const table of tables) {
      await db.execAsync(`DROP TABLE IF EXISTS ${table}`);
    }
    await initDatabase();
  }
};

export const upsertTrips = async (trips) => {};
export const getTrips = async () => {
  if(!db) return [];
  const result = await db.getAllAsync('SELECT * FROM trips;');
  return result;
};
export const getTripById = async (tripId) => { return null; };
export const deleteTrip = async (tripId) => {};

export const upsertPlaces = async (places) => {};
export const getPlacesByTrip = async (tripId) => { return []; };
export const getPlaceById = async (placeId) => { return null; };
export const deletePlace = async (placeId) => {};

export const upsertPhotos = async (photos) => {};
export const getPhotosByPlace = async (placeId) => { return []; };
export const deletePhoto = async (photoId) => {};

export const upsertVoiceNotes = async (notes) => {};
export const getVoiceNotesByPlace = async (placeId) => { return []; };
export const deleteVoiceNote = async (noteId) => {};

export const upsertCustomFieldDefs = async (defs) => {};
export const getCustomFieldDefs = async () => { return []; };

export const enqueueSync = async (item) => { return "temp-id"; };
export const getPendingSyncItems = async () => { return []; };
export const updateSyncItem = async (id, patch) => {};
export const removeSyncItem = async (id) => {};
export const getSyncQueueCount = async () => {
  if(!db) return 0;
  const result = await db.getFirstAsync('SELECT COUNT(*) as count FROM sync_queue WHERE status = ?', ['pending']);
  return result ? result.count : 0;
};
