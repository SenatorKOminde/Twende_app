import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';

import HomeScreen from '@/screens/driver/HomeScreen';
import ScheduleScreen from '@/screens/driver/ScheduleScreen';
import PassengersScreen from '@/screens/driver/PassengersScreen';
import ProfileScreen from '@/screens/driver/ProfileScreen';
import QRScannerScreen from '@/screens/driver/QRScannerScreen';
import TripDetailsScreen from '@/screens/driver/TripDetailsScreen';
import LocationTrackingScreen from '@/screens/driver/LocationTrackingScreen';

export type DriverTabParamList = {
  Home: undefined;
  Schedule: undefined;
  Passengers: undefined;
  Profile: undefined;
};

export type DriverStackParamList = {
  DriverTabs: undefined;
  QRScanner: { scheduleId: number };
  TripDetails: { scheduleId: number };
  LocationTracking: { scheduleId: number };
};

const Tab = createBottomTabNavigator<DriverTabParamList>();
const Stack = createStackNavigator<DriverStackParamList>();

const DriverTabs: React.FC = () => {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Schedule') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Passengers') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outline,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ title: 'Home' }}
      />
      <Tab.Screen 
        name="Schedule" 
        component={ScheduleScreen}
        options={{ title: 'Schedule' }}
      />
      <Tab.Screen 
        name="Passengers" 
        component={PassengersScreen}
        options={{ title: 'Passengers' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

const DriverNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#fff' },
      }}
    >
      <Stack.Screen name="DriverTabs" component={DriverTabs} />
      <Stack.Screen name="QRScanner" component={QRScannerScreen} />
      <Stack.Screen name="TripDetails" component={TripDetailsScreen} />
      <Stack.Screen name="LocationTracking" component={LocationTrackingScreen} />
    </Stack.Navigator>
  );
};

export default DriverNavigator;
