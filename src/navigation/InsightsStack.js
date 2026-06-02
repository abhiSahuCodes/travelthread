import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatsOverviewScreen } from '../screens/insights/StatsOverviewScreen';
import { HeatmapScreen } from '../screens/insights/HeatmapScreen';

const Stack = createNativeStackNavigator();

export const InsightsStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StatsOverview" component={StatsOverviewScreen} />
      <Stack.Screen name="Heatmap" component={HeatmapScreen} />
    </Stack.Navigator>
  );
};