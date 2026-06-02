import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AllTripsTimelineScreen } from '../screens/timeline/AllTripsTimelineScreen';
import { TripPlacesTimelineScreen } from '../screens/timeline/TripPlacesTimelineScreen';

const Stack = createNativeStackNavigator();

export const TimelineStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AllTripsTimeline" component={AllTripsTimelineScreen} />
      <Stack.Screen name="TripPlacesTimeline" component={TripPlacesTimelineScreen} />
    </Stack.Navigator>
  );
};