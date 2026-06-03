import React, { useCallback, useRef, useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapLibreGL from '@maplibre/maplibre-react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';

const MAP_STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';

const COLORS = {
  primary: '#630ed4',
  primaryAlt: '#7C3AED',
  surface: '#ffffff',
  surfaceContainerLow: '#f5f2ff',
  surfaceContainerHigh: '#e8e5ff',
  surfaceContainerLowest: '#ffffff',
  onSurface: '#1a1a2e',
  secondary: '#505f76',
  outline: '#7b7487',
  outlineVariant: '#ccc3d8',
  white: '#ffffff',
};

const SNAP_POINTS = ['35%', '60%'];

const MOCK_PLACES = [
  {
    id: 'p1',
    name: 'Kyoto Zen Garden',
    note: 'Temple meditation & tea',
    time: '09:30 AM',
    latitude: 35.03,
    longitude: 135.74,
    coverImage: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400',
    spend: 2400,
    currency: '¥',
  },
  {
    id: 'p2',
    name: 'Dotonbori District',
    note: 'Street food & neon lights',
    time: '06:45 PM',
    latitude: 34.6687,
    longitude: 135.5052,
    coverImage: 'https://images.unsplash.com/photo-1509587584298-0f3b3a3a1797?w=400',
    spend: 3800,
    currency: '¥',
  },
  {
    id: 'p3',
    name: 'Himeji Castle',
    note: 'White Heron historic site',
    time: '01:15 PM',
    latitude: 34.8394,
    longitude: 134.6939,
    coverImage: 'https://images.unsplash.com/photo-1590559899731-a382839e5549?w=400',
    spend: 1500,
    currency: '¥',
  },
];

export const TripDetailMapScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { trip } = route.params ?? {};

  const [selectedPlaceId, setSelectedPlaceId] = useState(MOCK_PLACES[0]?.id);
  const [isMapReady, setIsMapReady] = useState(false);

  const cameraRef = useRef(null);
  const bottomSheetRef = useRef(null);

  const centerCoordinate = [trip?.longitude ?? 135.7, trip?.latitude ?? 35.0];

  const handlePlaceCardPress = useCallback((place) => {
    setSelectedPlaceId(place.id);
    cameraRef.current?.flyTo([place.longitude, place.latitude], 600);
  }, []);

  const handlePlaceDetailPress = useCallback(
    (place) => navigation.navigate('PlaceDetail', { place, trip }),
    [navigation, trip]
  );

  // Build GeoJSON line for dashed route
  const routeGeoJSON = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: MOCK_PLACES.map((p) => [p.longitude, p.latitude]),
        },
      },
    ],
  };

  return (
    <View style={styles.root}>
      {/* ── Map ── */}
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
          zoomLevel={8}
          centerCoordinate={centerCoordinate}
          animationDuration={0}
        />

        {isMapReady && (
          <>
            {/* Dashed route path */}
            <MapLibreGL.ShapeSource id="route" shape={routeGeoJSON}>
              <MapLibreGL.LineLayer
                id="routeLine"
                style={{
                  lineColor: COLORS.primaryAlt,
                  lineWidth: 2,
                  lineDasharray: [2, 2],
                }}
              />
            </MapLibreGL.ShapeSource>

            {/* Place pins */}
            {MOCK_PLACES.map((place, idx) => (
              <MapLibreGL.PointAnnotation
                key={place.id}
                id={`place-pin-${place.id}`}
                coordinate={[place.longitude, place.latitude]}
                onSelected={() => handlePlaceCardPress(place)}
              >
                <Pressable onPress={() => handlePlaceCardPress(place)}>
                  <View
                    style={[
                      styles.pinCircle,
                      place.id === selectedPlaceId && styles.pinCircleActive,
                    ]}
                  >
                    <Text style={styles.pinNumber}>{idx + 1}</Text>
                  </View>
                </Pressable>
              </MapLibreGL.PointAnnotation>
            ))}
          </>
        )}
      </MapLibreGL.MapView>

      {/* ── App bar ── */}
      <View style={[styles.appBar, { paddingTop: insets.top + 4 }]}>
        <View style={styles.appBarLeft}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
          >
            <Text style={styles.backIcon}>←</Text>
          </Pressable>
          <Text style={styles.appBarTitle} numberOfLines={1}>
            {trip?.name ?? 'Trip'}{trip?.year ? ` — ${trip.year}` : ''}
          </Text>
        </View>
        <Pressable style={styles.moreBtn}>
          <Text style={styles.moreIcon}>⋮</Text>
        </Pressable>
      </View>

      {/* ── Bottom sheet ── */}
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={SNAP_POINTS}
        handleIndicatorStyle={styles.sheetHandle}
        backgroundStyle={styles.sheetBackground}
      >
        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statChip}>
            <Text style={styles.statChipIcon}>📍</Text>
            <Text style={styles.statChipText}>{MOCK_PLACES.length} places visited</Text>
          </View>
          <View style={styles.statChip}>
            <Text style={styles.statChipIcon}>💰</Text>
            <Text style={styles.statChipText}>
              ¥{MOCK_PLACES.reduce((s, p) => s + p.spend, 0).toLocaleString()} total
            </Text>
          </View>
        </View>

        {/* Place cards */}
        <BottomSheetScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.placeCardsList}
        >
          {MOCK_PLACES.map((place) => (
            <Pressable
              key={place.id}
              style={({ pressed }) => [
                styles.placeCard,
                place.id === selectedPlaceId && styles.placeCardActive,
                pressed && { transform: [{ scale: 0.97 }] },
              ]}
              onPress={() => handlePlaceCardPress(place)}
              onLongPress={() => handlePlaceDetailPress(place)}
            >
              <Image
                source={{ uri: place.coverImage }}
                style={styles.placeCardImage}
                resizeMode="cover"
              />
              <View style={styles.placeCardBody}>
                <Text style={styles.placeCardName} numberOfLines={1}>{place.name}</Text>
                <Text style={styles.placeCardNote} numberOfLines={1}>{place.note}</Text>
                <Text
                  style={[
                    styles.placeCardTime,
                    place.id !== selectedPlaceId && styles.placeCardTimeDim,
                  ]}
                >
                  {place.time}
                </Text>
              </View>
            </Pressable>
          ))}
        </BottomSheetScrollView>

        {/* Detail list */}
        <View style={styles.detailList}>
          {MOCK_PLACES.map((place, idx) => (
            <Pressable
              key={place.id}
              style={({ pressed }) => [
                styles.detailRow,
                pressed && { backgroundColor: COLORS.surfaceContainerLow },
              ]}
              onPress={() => handlePlaceDetailPress(place)}
            >
              <View style={styles.detailBadge}>
                <Text style={styles.detailBadgeNum}>{idx + 1}</Text>
              </View>
              <View style={styles.detailRowBody}>
                <Text style={styles.detailRowTitle}>{place.name}</Text>
                <Text style={styles.detailRowSub} numberOfLines={1}>{place.note}</Text>
              </View>
              <Text style={styles.detailRowArrow}>›</Text>
            </Pressable>
          ))}
        </View>
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F5F0E8' },
  map: { flex: 1 },

  appBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: COLORS.surface,
    zIndex: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 4,
  },
  appBarLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 4 },
  backBtn: { padding: 8, marginLeft: -8, borderRadius: 999 },
  backIcon: { fontSize: 22, color: COLORS.secondary },
  appBarTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.onSurface,
    letterSpacing: -0.2,
    flex: 1,
    marginLeft: 4,
  },
  moreBtn: { padding: 8, borderRadius: 999 },
  moreIcon: { fontSize: 22, color: COLORS.secondary },

  pinCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primaryAlt,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  pinCircleActive: {
    width: 36,
    height: 36,
    borderRadius: 18,
    shadowColor: COLORS.primaryAlt,
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  pinNumber: { color: COLORS.white, fontSize: 11, fontWeight: '700' },

  sheetBackground: {
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  sheetHandle: { backgroundColor: '#cbd5e1', width: 48 },
  statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginBottom: 12 },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: `${COLORS.outlineVariant}50`,
    borderRadius: 12,
  },
  statChipIcon: { fontSize: 14 },
  statChipText: { fontSize: 13, fontWeight: '500', color: COLORS.secondary },

  placeCardsList: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  placeCard: {
    width: 180,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceContainerLowest,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: `${COLORS.outlineVariant}33`,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  placeCardActive: { borderWidth: 2, borderColor: COLORS.primaryAlt },
  placeCardImage: {
    width: '100%',
    height: 96,
    backgroundColor: COLORS.surfaceContainerHigh,
  },
  placeCardBody: { padding: 10 },
  placeCardName: { fontSize: 13, fontWeight: '600', color: COLORS.onSurface, lineHeight: 18 },
  placeCardNote: { fontSize: 11, color: `${COLORS.secondary}B3`, marginTop: 2 },
  placeCardTime: { fontSize: 10, fontWeight: '600', color: COLORS.primaryAlt, marginTop: 6 },
  placeCardTimeDim: { color: `${COLORS.secondary}80` },

  detailList: {
    marginHorizontal: 20,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: `${COLORS.outlineVariant}18`,
    paddingTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 8,
    gap: 12,
  },
  detailBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${COLORS.primaryAlt}1A`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailBadgeNum: { fontSize: 12, fontWeight: '700', color: COLORS.primaryAlt },
  detailRowBody: { flex: 1 },
  detailRowTitle: { fontSize: 14, fontWeight: '600', color: COLORS.onSurface },
  detailRowSub: { fontSize: 12, color: COLORS.secondary, marginTop: 2 },
  detailRowArrow: { fontSize: 20, color: COLORS.outlineVariant, fontWeight: '300' },
});
