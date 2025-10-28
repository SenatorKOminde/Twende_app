import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Button, Chip, FAB } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { useAuth } from '@/shared/auth';
import { useApi } from '@/shared/api';
import { useLocation } from '@/shared/hooks';
import { formatTime, formatDate, getTimeUntil } from '@/shared/utils';
import { RiderStackParamList } from '@/navigation/RiderNavigator';
import { Route, Schedule, Subscription } from '@/shared/types';

type HomeScreenNavigationProp = StackNavigationProp<RiderStackParamList, 'RiderTabs'>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user } = useAuth();
  const api = useApi();
  const { location, getCurrentLocation } = useLocation();
  
  const [routes, setRoutes] = useState<Route[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
    getCurrentLocation();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        loadRoutes(),
        loadSchedules(),
        loadSubscription(),
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRoutes = async () => {
    try {
      const response = await api.get('/routes/');
      setRoutes(response.data.results || []);
    } catch (error) {
      console.error('Error loading routes:', error);
    }
  };

  const loadSchedules = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await api.get(`/schedules/?date=${today}`);
      setSchedules(response.data.results || []);
    } catch (error) {
      console.error('Error loading schedules:', error);
    }
  };

  const loadSubscription = async () => {
    try {
      const response = await api.get('/subscriptions/current/');
      setSubscription(response.data);
    } catch (error) {
      console.error('Error loading subscription:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleBookRide = (schedule: Schedule) => {
    navigation.navigate('RouteDetails', { routeId: schedule.route.id });
  };

  const handleViewSubscription = () => {
    navigation.navigate('Subscriptions');
  };

  const handleViewBookings = () => {
    navigation.navigate('Bookings');
  };

  const getUpcomingSchedules = () => {
    const now = new Date();
    return schedules
      .filter(schedule => new Date(schedule.departure_time) > now)
      .sort((a, b) => new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime())
      .slice(0, 5);
  };

  const upcomingSchedules = getUpcomingSchedules();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text variant="headlineSmall" style={styles.welcomeText}>
            Welcome back, {user?.first_name}!
          </Text>
          <Text variant="bodyMedium" style={styles.subtitleText}>
            Ready for your next ride?
          </Text>
        </View>

        {/* Subscription Status */}
        {subscription && (
          <Card style={styles.subscriptionCard}>
            <Card.Content>
              <View style={styles.subscriptionHeader}>
                <Text variant="titleMedium">Your Pass</Text>
                <Chip
                  mode="outlined"
                  textStyle={styles.chipText}
                  style={[
                    styles.chip,
                    { backgroundColor: subscription.active ? '#E8F5E8' : '#FFF3CD' }
                  ]}
                >
                  {subscription.active ? 'Active' : 'Inactive'}
                </Chip>
              </View>
              <Text variant="bodyLarge" style={styles.subscriptionPlan}>
                {subscription.plan.name}
              </Text>
              <Text variant="bodyMedium" style={styles.ridesRemaining}>
                {subscription.rides_remaining} rides remaining
              </Text>
              <Button
                mode="outlined"
                onPress={handleViewSubscription}
                style={styles.subscriptionButton}
              >
                Manage Pass
              </Button>
            </Card.Content>
          </Card>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Quick Actions
          </Text>
          <View style={styles.actionButtons}>
            <Button
              mode="contained"
              onPress={handleViewBookings}
              style={styles.actionButton}
              icon="calendar"
            >
              My Rides
            </Button>
            <Button
              mode="outlined"
              onPress={handleViewSubscription}
              style={styles.actionButton}
              icon="card"
            >
              Passes
            </Button>
          </View>
        </View>

        {/* Upcoming Schedules */}
        <View style={styles.schedulesSection}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Upcoming Departures
          </Text>
          {upcomingSchedules.length > 0 ? (
            upcomingSchedules.map((schedule) => (
              <Card key={schedule.id} style={styles.scheduleCard}>
                <Card.Content>
                  <View style={styles.scheduleHeader}>
                    <Text variant="titleSmall">
                      {schedule.route.origin} → {schedule.route.destination}
                    </Text>
                    <Text variant="bodySmall" style={styles.timeText}>
                      {getTimeUntil(schedule.departure_time)}
                    </Text>
                  </View>
                  <Text variant="bodyMedium" style={styles.departureTime}>
                    Departure: {formatTime(schedule.departure_time)}
                  </Text>
                  <Text variant="bodySmall" style={styles.seatsText}>
                    {schedule.seats_available} seats available
                  </Text>
                  <Button
                    mode="contained"
                    onPress={() => handleBookRide(schedule)}
                    style={styles.bookButton}
                    disabled={schedule.seats_available === 0}
                  >
                    Book Ride
                  </Button>
                </Card.Content>
              </Card>
            ))
          ) : (
            <Card style={styles.emptyCard}>
              <Card.Content>
                <Text variant="bodyMedium" style={styles.emptyText}>
                  No upcoming departures today
                </Text>
              </Card.Content>
            </Card>
          )}
        </View>

        {/* Location Info */}
        {location && (
          <Card style={styles.locationCard}>
            <Card.Content>
              <Text variant="titleSmall">Your Location</Text>
              <Text variant="bodySmall" style={styles.locationText}>
                Lat: {location.coords.latitude.toFixed(4)}, 
                Lng: {location.coords.longitude.toFixed(4)}
              </Text>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('RouteDetails', { routeId: 1 })}
        label="Book Ride"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  welcomeSection: {
    padding: 20,
    backgroundColor: '#3B82F6',
  },
  welcomeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  subtitleText: {
    color: '#E3F2FD',
    marginTop: 4,
  },
  subscriptionCard: {
    margin: 16,
    marginTop: 8,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  chip: {
    height: 28,
  },
  chipText: {
    fontSize: 12,
  },
  subscriptionPlan: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  ridesRemaining: {
    color: '#666',
    marginBottom: 16,
  },
  subscriptionButton: {
    alignSelf: 'flex-start',
  },
  quickActions: {
    padding: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  schedulesSection: {
    padding: 16,
    paddingTop: 0,
  },
  scheduleCard: {
    marginBottom: 12,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeText: {
    color: '#3B82F6',
    fontWeight: 'bold',
  },
  departureTime: {
    marginBottom: 4,
  },
  seatsText: {
    color: '#666',
    marginBottom: 12,
  },
  bookButton: {
    alignSelf: 'flex-start',
  },
  emptyCard: {
    marginBottom: 12,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
  locationCard: {
    margin: 16,
    marginTop: 0,
  },
  locationText: {
    color: '#666',
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#3B82F6',
  },
});

export default HomeScreen;
