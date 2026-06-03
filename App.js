import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { RootNavigator } from './src/navigation/RootNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { StyleSheet, View, Text } from 'react-native';
import { initDatabase } from './src/db/index';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MapLibreGL from '@maplibre/maplibre-react-native';

// OpenFreeMap does not require a Mapbox token
MapLibreGL.setAccessToken(null);

const queryClient = new QueryClient();

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  React.useEffect(() => {
    initDatabase().catch(console.error);
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading Fonts...</Text>
      </View>
    );
  }

  const linking = {
    prefixes: ['travelthread://'],
    config: {
      screens: {
        Auth: {
          screens: {
            AuthScreen: 'verify',
            ResetPassword: 'reset-password',
          },
        },
        Main: {
          screens: {
            Map: {
              screens: {
                TripDetailMap: 'trip/:tripId',
                PlaceDetail: 'place/:placeId',
              },
            },
          },
        },
      },
    },
  };

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={styles.container}>
        <SafeAreaProvider>
          <NavigationContainer linking={linking}>
            <RootNavigator />
          </NavigationContainer>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center'
  }
});
