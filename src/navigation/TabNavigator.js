import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MapStack } from './MapStack';
import { TimelineStack } from './TimelineStack';
import { InsightsStack } from './InsightsStack';
import { ProfileStack } from './ProfileStack';
import { View } from 'react-native';
import { COLORS } from '../constants/theme';
import { TabBarIcon } from '../components/layout/TabBarIcon';

const Tab = createBottomTabNavigator();
const EmptyLogComponent = () => <View />;

export const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.accent.primary,
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: {
          backgroundColor: COLORS.surface.white,
          borderTopWidth: 1,
          borderTopColor: COLORS.border.default,
        }
      }}
    >
      <Tab.Screen name="Map" component={MapStack} options={{ tabBarIcon: ({ color }) => <TabBarIcon color={color} name="Map" /> }} />
      <Tab.Screen name="Timeline" component={TimelineStack} options={{ tabBarIcon: ({ color }) => <TabBarIcon color={color} name="Timeline" /> }} />
      <Tab.Screen 
        name="Log" 
        component={EmptyLogComponent}
        options={{
          tabBarLabel: () => null,
          tabBarIcon: () => (
            <View style={{
              backgroundColor: COLORS.accent.primary,
              width: 56, height: 56, borderRadius: 28,
              justifyContent: 'center', alignItems: 'center',
              shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
              marginBottom: 20
            }}>
              <TabBarIcon color="#FFF" name="+" />
            </View>
          )
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('LogModal');
          },
        })}
      />
      <Tab.Screen name="Insights" component={InsightsStack} options={{ tabBarIcon: ({ color }) => <TabBarIcon color={color} name="Insights" /> }} />
      <Tab.Screen name="Profile" component={ProfileStack} options={{ tabBarIcon: ({ color }) => <TabBarIcon color={color} name="Profile" /> }} />
    </Tab.Navigator>
  );
};