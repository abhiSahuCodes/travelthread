import React, { useState, useRef } from 'react';
import { StyleSheet, View, Text, Image, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient as SvgLinearGradient, Stop, Rect } from 'react-native-svg';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../constants/theme';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    icon: 'location-on',
    title: 'Pin your places',
    description: 'Drop pins as you explore the world',
  },
  {
    id: '2',
    icon: 'timeline',
    title: 'Relive every trip',
    description: 'Chronological memory threads for you',
  },
  {
    id: '3',
    icon: 'bubble-chart',
    title: 'See your world',
    description: 'Heatmaps and detailed travel stats',
  },
];

const LOGO_BASE64 = 'data:image/png;base64,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';

export const OnboardingScreen = ({ navigation }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef(null);

  const handleScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / width);
    if (index !== activeIndex && index >= 0 && index < SLIDES.length) {
      setActiveIndex(index);
    }
  };

  const renderItem = ({ item }) => {
    return (
      <View style={styles.slideContainer}>
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <MaterialIcons name={item.icon} size={32} color={COLORS.accent.light} />
          </View>
          <Text style={styles.slideTitle}>{item.title}</Text>
          <Text style={styles.slideDescription}>{item.description}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <SvgLinearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#0F0C29" />
            <Stop offset="100%" stopColor="#1A1A3E" />
          </SvgLinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#grad)" />
      </Svg>

      {/* World Map Texture Overlay */}
      <Image
        source={{ uri: 'https://www.transparenttextures.com/patterns/world-map.png' }}
        style={styles.mapPattern}
        resizeMode="repeat"
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Header Section */}
        <View style={styles.header}>
          <Image
            source={{ uri: LOGO_BASE64 }}
            style={styles.logo}
          />
          <Text style={styles.brandName}>TravelThread</Text>
          <Text style={styles.brandSubtitle}>Every place. Every memory. One thread.</Text>
        </View>

        {/* Carousel Section */}
        <View style={styles.carouselContainer}>
          <FlatList
            ref={flatListRef}
            data={SLIDES}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            snapToInterval={width}
            decelerationRate="fast"
          />

          {/* Dots Indicator */}
          <View style={styles.dotsContainer}>
            {SLIDES.map((_, index) => {
              const isActive = index === activeIndex;
              return (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    isActive ? styles.dotActive : styles.dotInactive,
                  ]}
                />
              );
            })}
          </View>
        </View>

        {/* Footer Actions */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={() => navigation.navigate('AuthScreen', { initialTab: 'signup' })}
            activeOpacity={0.8}
          >
            <Text style={styles.getStartedText}>Get started</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('AuthScreen', { initialTab: 'login' })}
            activeOpacity={0.8}
          >
            <Text style={styles.loginText}>Log in</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0C29',
  },
  mapPattern: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.08,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    paddingHorizontal: SPACING.pagePad,
  },
  logo: {
    width: 64,
    height: 64,
    resizeMode: 'contain',
    marginBottom: 16,
  },
  brandName: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Inter_700Bold',
  },
  brandSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    color: '#CBD5E1', // slate-300
    opacity: 0.8,
    marginTop: 8,
    textAlign: 'center',
    fontFamily: 'Inter_400Regular',
  },
  carouselContainer: {
    marginVertical: 20,
  },
  slideContainer: {
    width: width,
    paddingHorizontal: SPACING.pagePad + 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: width - (SPACING.pagePad * 2) - 8,
    height: 200,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(124, 58, 237, 0.2)', // primary-container (violet) / 20%
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  slideTitle: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
  },
  slideDescription: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    color: '#CBD5E1', // slate-300
    textAlign: 'center',
    marginTop: 4,
    fontFamily: 'Inter_400Regular',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    backgroundColor: '#FFFFFF',
  },
  dotActive: {
    width: 16,
    opacity: 1,
  },
  dotInactive: {
    width: 8,
    opacity: 0.3,
  },
  footer: {
    paddingHorizontal: SPACING.pagePad,
    paddingBottom: 24,
    alignItems: 'center',
  },
  getStartedButton: {
    width: '100%',
    height: 56,
    backgroundColor: COLORS.accent.primary, // #7C3AED
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 12,
  },
  getStartedText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter_600SemiBold',
  },
  loginButton: {
    width: '100%',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#CBD5E1', // slate-300
    fontFamily: 'Inter_500Medium',
  },
});

