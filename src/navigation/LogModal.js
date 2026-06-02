import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NewTripSetupScreen } from '../screens/log/NewTripSetupScreen';
import { LogPlaceScreen } from '../screens/log/LogPlaceScreen';

const Stack = createNativeStackNavigator();

export const LogModal = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="NewTripSetup" component={NewTripSetupScreen} />
      <Stack.Screen name="LogPlace" component={LogPlaceScreen} />
    </Stack.Navigator>
  );
};