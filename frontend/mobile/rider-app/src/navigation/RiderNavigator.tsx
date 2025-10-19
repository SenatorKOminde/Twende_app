import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';

import HomeScreen from '@/screens/rider/HomeScreen';
import BookingsScreen from '@/screens/rider/BookingsScreen';
import SubscriptionsScreen from '@/screens/rider/SubscriptionsScreen';
import ProfileScreen from '@/screens/rider/ProfileScreen';
import TrackingScreen from '@/screens/rider/TrackingScreen';
import QRCodeScreen from '@/screens/rider/QRCodeScreen';
import BookingDetailsScreen from '@/screens/rider/BookingDetailsScreen';
import RouteDetailsScreen from '@/screens/rider/RouteDetailsScreen';

export type RiderTabParamList = {
  Home: undefined;
  Bookings: undefined;
  Subscriptions: undefined;
  Profile: undefined;
};

export type RiderStackParamList = {
  RiderTabs: undefined;
  Tracking: { scheduleId: number };
  QRCode: { bookingId: number };
  BookingDetails: { bookingId: number };
  RouteDetails: { routeId: number };
};

const Tab = createBottomTabNavigator<RiderTabParamList>();
const Stack = createStackNavigator<RiderStackParamList>();

const RiderTabs: React.FC = () => {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Bookings') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Subscriptions') {
            iconName = focused ? 'card' : 'card-outline';
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
        name="Bookings" 
        component={BookingsScreen}
        options={{ title: 'My Rides' }}
      />
      <Tab.Screen 
        name="Subscriptions" 
        component={SubscriptionsScreen}
        options={{ title: 'Passes' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

const RiderNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#fff' },
      }}
    >
      <Stack.Screen name="RiderTabs" component={RiderTabs} />
      <Stack.Screen name="Tracking" component={TrackingScreen} />
      <Stack.Screen name="QRCode" component={QRCodeScreen} />
      <Stack.Screen name="BookingDetails" component={BookingDetailsScreen} />
      <Stack.Screen name="RouteDetails" component={RouteDetailsScreen} />
    </Stack.Navigator>
  );
};

export default RiderNavigator;
