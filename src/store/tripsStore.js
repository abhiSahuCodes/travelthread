import { create } from 'zustand';

export const useTripsStore = create((set) => ({
  trips: [],
  selectedTripId: null,
  setTrips: (trips) => set({ trips }),
  upsertTrip: (trip) => set((state) => {
    const existingIndex = state.trips.findIndex(t => t.id === trip.id);
    if (existingIndex >= 0) {
      const newTrips = [...state.trips];
      newTrips[existingIndex] = trip;
      return { trips: newTrips };
    }
    return { trips: [...state.trips, trip] };
  }),
  removeTrip: (tripId) => set((state) => ({
    trips: state.trips.filter(t => t.id !== tripId)
  })),
  setSelectedTripId: (id) => set({ selectedTripId: id }),
}));
