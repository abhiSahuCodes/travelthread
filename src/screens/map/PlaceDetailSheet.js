import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const COLORS = {
  primary: '#630ed4',
  primaryAlt: '#7C3AED',
  surface: '#ffffff',
  surfaceContainer: '#efecff',
  surfaceContainerLow: '#f5f2ff',
  surfaceContainerHigh: '#e8e5ff',
  surfaceContainerLowest: '#ffffff',
  onSurface: '#1a1a2e',
  onSurfaceVariant: '#4a4455',
  secondary: '#505f76',
  outline: '#7b7487',
  outlineVariant: '#ccc3d8',
  surfaceDim: '#dad7f3',
};

// ─── Mock gallery images for a place ─────────────────────────────────────────
const GALLERY_IMAGES = [
  'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600',
  'https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=600',
  'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=600',
];

// ─── Mock custom fields ───────────────────────────────────────────────────────
const CUSTOM_FIELDS = [
  { label: 'Weather', value: '☁ Cloudy' },
  { label: 'Mood', value: '😌 Peaceful' },
  { label: 'Transport', value: '🚌 Bus' },
];

export const PlaceDetailSheet = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { place, trip } = route.params ?? {};

  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
  const galleryRef = useRef(null);

  // Use passed place data or fall back to rich mock data
  const placeData = place ?? {
    id: 'p1',
    name: 'Fushimi Inari Taisha',
    note:
      'The walk through the thousands of torii gates was incredibly peaceful in the afternoon light. The forest surrounding the shrine felt ancient and full of mystery. Definitely one of the highlights of my time in Kyoto.',
    time: '2:34 PM',
    latitude: 34.9671,
    longitude: 135.7727,
    spend: 2400,
    currency: '¥',
  };

  const tripName = trip?.name ?? 'Kyoto & Osaka';
  const tripYear = trip?.year ?? '2024';
  const dateStr = `Apr 14, ${tripYear}`;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `📍 ${placeData.name} — ${placeData.note?.slice(0, 100)}`,
        title: `TravelThread • ${placeData.name}`,
      });
    } catch (_) {}
  };

  const handleGalleryScroll = (event) => {
    const idx = Math.round(event.nativeEvent.contentOffset.x / (SCREEN_W - 40 - 16));
    setActiveGalleryIndex(Math.max(0, Math.min(idx, GALLERY_IMAGES.length - 1)));
  };

  return (
    <View style={styles.root}>
      {/* Hero backdrop */}
      <ImageBackground
        source={{ uri: GALLERY_IMAGES[0] }}
        style={styles.heroBg}
        resizeMode="cover"
      >
        <View style={styles.heroOverlay} />
      </ImageBackground>

      {/* Dismiss / back button over hero */}
      <View style={[styles.heroControls, { top: insets.top + 12 }]}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [styles.heroBackBtn, pressed && { opacity: 0.6 }]}
        >
          <Text style={styles.heroBackIcon}>←</Text>
        </Pressable>
      </View>

      {/* Bottom sheet container */}
      <View style={styles.sheet}>
        {/* Drag handle */}
        <View style={styles.dragHandle} />

        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 90 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.headerSection}>
            <Text style={styles.placeName}>{placeData.name}</Text>
            <Text style={styles.placeMeta}>
              {tripName} · {dateStr} · {placeData.time}
            </Text>
            <View style={styles.locationPill}>
              <Text style={styles.locationPillIcon}>📍</Text>
              <Text style={styles.locationPillText}>
                {placeData.name}, {tripName?.split(' ')[0] ?? 'Kyoto'}
              </Text>
            </View>
          </View>

          {/* Gallery */}
          <View style={styles.gallerySection}>
            <FlatList
              ref={galleryRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              data={GALLERY_IMAGES}
              keyExtractor={(_, i) => String(i)}
              onScroll={handleGalleryScroll}
              scrollEventThrottle={16}
              renderItem={({ item }) => (
                <Image
                  source={{ uri: item }}
                  style={styles.galleryImage}
                  resizeMode="cover"
                />
              )}
              ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
              contentContainerStyle={styles.galleryList}
              decelerationRate="fast"
            />
            {/* Gallery dots */}
            <View style={styles.galleryDots}>
              {GALLERY_IMAGES.map((_, i) => (
                <View
                  key={i}
                  style={[styles.dot, i === activeGalleryIndex && styles.dotActive]}
                />
              ))}
            </View>
          </View>

          {/* Notes */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>NOTES</Text>
            <Text style={styles.noteText}>{placeData.note}</Text>
          </View>

          {/* Spend row */}
          <View style={styles.spendRow}>
            <Text style={styles.spendLabel}>Spent</Text>
            <Text style={styles.spendValue}>
              {placeData.currency ?? '¥'}
              {(placeData.spend ?? 0).toLocaleString()}
            </Text>
          </View>

          {/* Custom fields */}
          <View style={styles.section}>
            <View style={styles.fieldsCard}>
              {CUSTOM_FIELDS.map((field, idx) => (
                <View
                  key={field.label}
                  style={[
                    styles.fieldRow,
                    idx % 2 === 1 && styles.fieldRowTinted,
                    idx < CUSTOM_FIELDS.length - 1 && styles.fieldRowBorder,
                  ]}
                >
                  <Text style={styles.fieldLabel}>{field.label}</Text>
                  <Text style={styles.fieldValue}>{field.value}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Sticky bottom action bar */}
        <View
          style={[
            styles.actionBar,
            { paddingBottom: Math.max(insets.bottom, 12) },
          ]}
        >
          <Pressable
            style={({ pressed }) => [styles.btnOutline, pressed && { opacity: 0.7 }]}
            onPress={() => navigation.navigate('EditPlace', { place: placeData })}
          >
            <Text style={styles.btnOutlineText}>Edit place</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.btnFilled, pressed && { opacity: 0.85 }]}
            onPress={handleShare}
          >
            <Text style={styles.btnFilledText}>Share memory</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.surfaceDim,
  },

  // Hero backdrop
  heroBg: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.22)',
  },

  // Hero controls
  heroControls: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroBackBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBackIcon: {
    fontSize: 22,
    color: '#fff',
    fontWeight: '300',
  },

  // Bottom sheet (takes 92% of screen)
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '92%',
    backgroundColor: COLORS.surfaceContainerLowest,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 20,
    zIndex: 10,
  },
  dragHandle: {
    width: 32,
    height: 4,
    backgroundColor: '#e5e5e5',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 0,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },

  // Header section
  headerSection: {
    marginTop: 12,
    marginBottom: 20,
  },
  placeName: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.onSurface,
    letterSpacing: -0.2,
    lineHeight: 28,
    marginBottom: 4,
  },
  placeMeta: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.secondary,
    letterSpacing: 0.1,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 999,
  },
  locationPillIcon: {
    fontSize: 14,
  },
  locationPillText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.onSurfaceVariant,
  },

  // Gallery
  gallerySection: {
    marginBottom: 24,
    marginHorizontal: -20,
  },
  galleryList: {
    paddingHorizontal: 20,
  },
  galleryImage: {
    width: SCREEN_W - 40,
    height: 200,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceContainerHigh,
  },
  galleryDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.outlineVariant,
  },
  dotActive: {
    backgroundColor: COLORS.primaryAlt,
    width: 16,
    borderRadius: 3,
  },

  // Sections
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.5,
    color: COLORS.secondary,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  noteText: {
    fontSize: 15,
    lineHeight: 25,
    color: COLORS.onSurfaceVariant,
    fontWeight: '400',
  },

  // Spend row
  spendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.surfaceContainer,
  },
  spendLabel: {
    fontSize: 14,
    color: COLORS.secondary,
  },
  spendValue: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.primaryAlt,
    letterSpacing: -0.2,
  },

  // Custom fields card
  fieldsCard: {
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
    borderRadius: 12,
    overflow: 'hidden',
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.surfaceContainerLowest,
  },
  fieldRowTinted: {
    backgroundColor: `${COLORS.surfaceContainerLow}80`,
  },
  fieldRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: `${COLORS.surfaceContainer}80`,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.secondary,
    letterSpacing: 0.1,
  },
  fieldValue: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.onSurface,
  },

  // Action bar
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 14,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceContainerHigh,
  },
  btnOutline: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primaryAlt,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnOutlineText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primaryAlt,
    letterSpacing: 0.1,
  },
  btnFilled: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.primaryAlt,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primaryAlt,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  btnFilledText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 0.1,
  },
});
