import { apiClient } from '../client';

/** GET /api/trips/:tripId/places — fetch all places for a trip */
export const getPlaces = async (tripId) => {
  const res = await apiClient.get(`/api/trips/${tripId}/places`);
  return res.data; // { places: Place[] }
};

/** GET /api/trips/:tripId/places/:placeId — fetch a single place */
export const getPlace = async (tripId, placeId) => {
  const res = await apiClient.get(`/api/trips/${tripId}/places/${placeId}`);
  return res.data; // { place: Place }
};

/** POST /api/trips/:tripId/places — log a new place */
export const logPlace = async (tripId, data) => {
  const res = await apiClient.post(`/api/trips/${tripId}/places`, data);
  return res.data; // { place: Place }
};

/** PATCH /api/trips/:tripId/places/:placeId — edit a logged place */
export const updatePlace = async (tripId, placeId, data) => {
  const res = await apiClient.patch(`/api/trips/${tripId}/places/${placeId}`, data);
  return res.data;
};

/** DELETE /api/trips/:tripId/places/:placeId — remove a logged place */
export const deletePlace = async (tripId, placeId) => {
  const res = await apiClient.delete(`/api/trips/${tripId}/places/${placeId}`);
  return res.data;
};
