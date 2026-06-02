import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WorldMapScreen } from '../screens/map/WorldMapScreen';
import { TripDetailMapScreen } from '../screens/map/TripDetailMapScreen';
import { PlaceDetailSheet } from '../screens/map/PlaceDetailSheet';

const Stack = createNativeStackNavigator();

export const MapStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="WorldMap" component={WorldMapScreen} />
      <Stack.Screen name="TripDetailMap" component={TripDetailMapScreen} />
      <Stack.Screen name="PlaceDetail" component={PlaceDetailSheet} />
    </Stack.Navigator>
  );
};