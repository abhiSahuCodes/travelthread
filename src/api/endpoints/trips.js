import { apiClient } from '../client';

/** GET /api/trips — fetch all trips for the authenticated user */
export const getTrips = async () => {
  const res = await apiClient.get('/api/trips');
  return res.data; // { trips: Trip[] }
};

/** GET /api/trips/:id — fetch a single trip with its places */
export const getTrip = async (tripId) => {
  const res = await apiClient.get(`/api/trips/${tripId}`);
  return res.data; // { trip: Trip }
};

/** POST /api/trips — create a new trip */
export const createTrip = async (data) => {
  const res = await apiClient.post('/api/trips', data);
  return res.data; // { trip: Trip }
};

/** PATCH /api/trips/:id — update trip metadata */
export const updateTrip = async (tripId, data) => {
  const res = await apiClient.patch(`/api/trips/${tripId}`, data);
  return res.data;
};

/** DELETE /api/trips/:id — delete a trip */
export const deleteTrip = async (tripId) => {
  const res = await apiClient.delete(`/api/trips/${tripId}`);
  return res.data;
};
