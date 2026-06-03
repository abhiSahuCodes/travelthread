import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapLibreGL from '@maplibre/maplibre-react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useAuthStore } from '../../store/authStore';
import { useTripsStore } from '../../store/tripsStore';

// Free OpenFreeMap tile style (no API key required)
const MAP_STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';

// ─── Colour tokens (matching Stitch design) ──────────────────────────────────
const COLORS = {
  primary: '#630ed4',
  primaryAlt: '#7C3AED',
  background: '#fcf8ff',
  surface: '#ffffff',
  surfaceContainerLow: '#f5f2ff',
  surfaceContainerHigh: '#e8e5ff',
  onSurface: '#1a1a2e',
  onSurfaceVariant: '#4a4455',
  secondary: '#505f76',
  secondaryContainer: '#d0e1fb',
  outline: '#7b7487',
  outlineVariant: '#ccc3d8',
  mapBg: '#E8EDF5',
  white: '#ffffff',
};

// ─── Mock trip data (replaced with real data once API is wired) ───────────────
const MOCK_TRIPS = [
  {
    id: '1',
    name: 'Swiss Alps',
    country: 'Switzerland',
    countryFlag: '🇨🇭',
    year: '2024',
    coverImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    latitude: 46.8182,
    longitude: 8.2275,
    placesCount: 7,
  },
  {
    id: '2',
    name: 'Santorini',
    country: 'Greece',
    countryFlag: '🇬🇷',
    year: '2023',
    coverImage: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=400',
    latitude: 36.3932,
    longitude: 25.4615,
    placesCount: 5,
  },
  {
    id: '3',
    name: 'Kyoto & Osaka',
    country: 'Japan',
    countryFlag: '🇯🇵',
    year: '2024',
    coverImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400',
    latitude: 35.0116,
    longitude: 135.7681,
    placesCount: 10,
  },
  {
    id: '4',
    name: 'New York',
    country: 'USA',
    countryFlag: '🇺🇸',
    year: '2022',
    coverImage: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=400',
    latitude: 40.7128,
    longitude: -74.006,
    placesCount: 12,
  },
];

const YEARS = ['All', '2024', '2023', '2022'];

// ─── Bottom-sheet snap points ─────────────────────────────────────────────────
const SNAP_POINTS = ['30%', '55%'];

export const WorldMapScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { trips, setTrips } = useTripsStore();

  const [selectedYear, setSelectedYear] = useState('All');
  const [searchText, setSearchText] = useState('');
  const [isMapReady, setIsMapReady] = useState(false);

  const bottomSheetRef = useRef(null);
  const cameraRef = useRef(null);

  // Seed mock trips into store if empty
  useEffect(() => {
    if (trips.length === 0) {
      setTrips(MOCK_TRIPS);
    }
  }, []);

  // Filter trips by year
  const filteredTrips = useMemo(() => {
    const source = trips.length > 0 ? trips : MOCK_TRIPS;
    if (selectedYear === 'All') return source;
    return source.filter(t => t.year === selectedYear);
  }, [trips, selectedYear]);

  const handleTripPress = useCallback((trip) => {
    navigation.navigate('TripDetailMap', { trip });
  }, [navigation]);

  const handlePinPress = useCallback((trip) => {
    // Fly camera to pin
    cameraRef.current?.flyTo([trip.longitude, trip.latitude], 800);
  }, []);

  // ─── Render each trip card in the bottom sheet horizontal list ─────────────
  const renderTripCard = useCallback(({ item }) => (
    <Pressable
      style={({ pressed }) => [styles.tripCard, pressed && styles.tripCardPressed]}
      onPress={() => handleTripPress(item)}
    >
      <View style={styles.tripCardImageWrapper}>
        <Animated.Image
          source={{ uri: item.coverImage }}
          style={styles.tripCardImage}
          resizeMode="cover"
        />
        <View style={styles.tripCardGradient} />
        <View style={styles.tripCardInfo}>
          <Text style={styles.tripCardName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.tripCardMeta}>
            {item.countryFlag} {item.country} · {item.year}
          </Text>
        </View>
      </View>
    </Pressable>
  ), [handleTripPress]);

  // ─── Map pin annotations ──────────────────────────────────────────────────
  const renderMapPins = () =>
    filteredTrips.map((trip) => (
      <MapLibreGL.PointAnnotation
        key={trip.id}
        id={`pin-${trip.id}`}
        coordinate={[trip.longitude, trip.latitude]}
        onSelected={() => handlePinPress(trip)}
      >
        <Pressable
          onPress={() => handlePinPress(trip)}
          style={styles.pinContainer}
        >
          <View style={styles.pinBadge}>
            <Text style={styles.pinText}>{trip.placesCount ?? '•'}</Text>
          </View>
        </Pressable>
      </MapLibreGL.PointAnnotation>
    ));

  return (
    <View style={styles.root}>
      {/* ── Full-screen map ── */}
      <MapLibreGL.MapView
        style={styles.map}
        styleURL={MAP_STYLE_URL}
        onDidFinishLoadingMap={() => setIsMapReady(true)}
        logoEnabled={false}
        attributionEnabled={false}
        compassEnabled={false}
      >
        <MapLibreGL.Camera
          ref={cameraRef}
          zoomLevel={1.5}
          centerCoordinate={[15, 25]}
          animationDuration={0}
        />
        {isMapReady && renderMapPins()}
      </MapLibreGL.MapView>

      {/* ── Top header row: logo + avatar ── */}
      <View style={[styles.header, { paddingTop: insets.top + 4 }]}>
        <Text style={styles.logoText}>TravelThread</Text>
        <View style={styles.avatarRing}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitial}>
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </Text>
          </View>
        </View>
      </View>

      {/* ── Frosted search + year filters overlay ── */}
      <View style={[styles.overlayControls, { top: insets.top + 68 }]}>
        {/* Search bar */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search trips or places..."
            placeholderTextColor={COLORS.onSurfaceVariant}
            value={searchText}
            onChangeText={setSearchText}
          />
          <Text style={styles.filterIcon}>⚙</Text>
        </View>

        {/* Year filter chips */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={YEARS}
          keyExtractor={(y) => y}
          contentContainerStyle={styles.yearFilters}
          renderItem={({ item: year }) => (
            <Pressable
              style={[
                styles.yearChip,
                selectedYear === year && styles.yearChipActive,
              ]}
              onPress={() => setSelectedYear(year)}
            >
              <Text
                style={[
                  styles.yearChipText,
                  selectedYear === year && styles.yearChipTextActive,
                ]}
              >
                {year}
              </Text>
            </Pressable>
          )}
        />
      </View>

      {/* ── Bottom sheet ── */}
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={SNAP_POINTS}
        handleIndicatorStyle={styles.sheetHandle}
        backgroundStyle={styles.sheetBackground}
      >
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>YOUR TRIPS</Text>
        </View>

        <BottomSheetScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tripCardsList}
        >
          {filteredTrips.map((trip) => (
            <Pressable
              key={trip.id}
              style={({ pressed }) => [styles.tripCard, pressed && styles.tripCardPressed]}
              onPress={() => handleTripPress(trip)}
            >
              <Animated.Image
                source={{ uri: trip.coverImage }}
                style={styles.tripCardImage}
                resizeMode="cover"
              />
              <View style={styles.tripCardGradient} />
              <View style={styles.tripCardInfo}>
                <Text style={styles.tripCardName} numberOfLines={1}>{trip.name}</Text>
                <Text style={styles.tripCardMeta}>
                  {trip.countryFlag} {trip.country} · {trip.year}
                </Text>
              </View>
            </Pressable>
          ))}

          {/* Add new trip card */}
          <Pressable
            style={({ pressed }) => [styles.addTripCard, pressed && { opacity: 0.7 }]}
            onPress={() => navigation.navigate('Log')}
          >
            <View style={styles.addTripIconCircle}>
              <Text style={styles.addTripPlus}>+</Text>
            </View>
            <Text style={styles.addTripLabel}>Start New Trip</Text>
          </Pressable>
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.mapBg,
  },
  map: {
    flex: 1,
  },

  // Header
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 8,
    zIndex: 40,
  },
  logoText: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: -0.4,
  },
  avatarRing: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.white,
    overflow: 'hidden',
    backgroundColor: COLORS.secondaryContainer,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
  },
  avatarPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },

  // Overlay controls (search + year filters)
  overlayControls: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    gap: 10,
    zIndex: 30,
  },
  searchBar: {
    height: 44,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.92)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(241,245,249,0.8)',
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.onSurface,
    padding: 0,
  },
  filterIcon: {
    fontSize: 16,
    marginLeft: 8,
    color: COLORS.outline,
  },
  yearFilters: {
    paddingBottom: 4,
    gap: 8,
    flexDirection: 'row',
  },
  yearChip: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  yearChipActive: {
    backgroundColor: COLORS.primaryAlt,
    borderColor: COLORS.primaryAlt,
  },
  yearChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
    letterSpacing: 0.1,
  },
  yearChipTextActive: {
    color: COLORS.white,
  },

  // Map pins
  pinContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primaryAlt,
    borderWidth: 2,
    borderColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primaryAlt,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  pinText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
  },

  // Bottom sheet
  sheetBackground: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  sheetHandle: {
    backgroundColor: '#e2e8f0',
    width: 40,
  },
  sheetHeader: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 12,
  },
  sheetTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  tripCardsList: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Trip cards
  tripCard: {
    width: 180,
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.surfaceContainerHigh,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  tripCardPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },
  tripCardImageWrapper: {
    flex: 1,
  },
  tripCardImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  tripCardGradient: {
    ...StyleSheet.absoluteFillObject,
    background: 'transparent',
    backgroundColor: 'transparent',
    // Simulate gradient with a solid bottom fade overlay
    // Real LinearGradient not imported to keep deps lean here
    // The dark overlay gives text readability
  },
  tripCardInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    paddingTop: 32,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  tripCardName: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
  },
  tripCardMeta: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 10,
    fontWeight: '500',
    marginTop: 1,
  },

  // Add trip card
  addTripCard: {
    width: 180,
    height: 120,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: `${COLORS.primaryAlt}4D`,
    backgroundColor: `${COLORS.primaryAlt}0D`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTripIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.primaryAlt}1A`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  addTripPlus: {
    fontSize: 24,
    color: COLORS.primaryAlt,
    fontWeight: '400',
    lineHeight: 28,
  },
  addTripLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primaryAlt,
  },
});
