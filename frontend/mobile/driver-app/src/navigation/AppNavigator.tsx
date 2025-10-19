import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '@/shared/auth';

import AuthNavigator from './AuthNavigator';
import DriverNavigator from './DriverNavigator';
import LoadingScreen from '@/screens/LoadingScreen';

const Stack = createStackNavigator();

const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="Driver" component={DriverNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
