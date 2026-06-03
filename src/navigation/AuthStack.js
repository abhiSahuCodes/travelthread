import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingScreen } from '../screens/auth/OnboardingScreen';
import { AuthScreen } from '../screens/auth/AuthScreen';
import { EmailVerifyPendingScreen } from '../screens/auth/EmailVerifyPendingScreen';
import { ResetPasswordScreen } from '../screens/auth/ResetPasswordScreen';

const Stack = createNativeStackNavigator();

export const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="AuthScreen" component={AuthScreen} />
      <Stack.Screen name="EmailVerifyPending" component={EmailVerifyPendingScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </Stack.Navigator>
  );
};