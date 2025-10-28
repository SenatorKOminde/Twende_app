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
import { DriverStackParamList } from '@/navigation/DriverNavigator';
import { Schedule } from '@/shared/types';

type HomeScreenNavigationProp = StackNavigationProp<DriverStackParamList, 'DriverTabs'>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user } = useAuth();
  const api = useApi();
  const { location, getCurrentLocation } = useLocation();
  
  const [todaySchedules, setTodaySchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadTodaySchedules();
    getCurrentLocation();
  }, []);

  const loadTodaySchedules = async () => {
    try {
      setIsLoading(true);
      const today = new Date().toISOString().split('T')[0];
      const response = await api.get(`/driver/schedules/?date=${today}`);
      setTodaySchedules(response.data.results || []);
    } catch (error) {
      console.error('Error loading today\'s schedules:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTodaySchedules();
    setRefreshing(false);
  };

  const handleStartTrip = (schedule: Schedule) => {
    navigation.navigate('TripDetails', { scheduleId: schedule.id });
  };

  const handleScanQR = (schedule: Schedule) => {
    navigation.navigate('QRScanner', { scheduleId: schedule.id });
  };

  const handleTrackLocation = (schedule: Schedule) => {
    navigation.navigate('LocationTracking', { scheduleId: schedule.id });
  };

  const getUpcomingSchedules = () => {
    const now = new Date();
    return todaySchedules
      .filter(schedule => new Date(schedule.departure_time) > now)
      .sort((a, b) => new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime())
      .slice(0, 3);
  };

  const getActiveSchedules = () => {
    const now = new Date();
    return todaySchedules.filter(schedule => 
      schedule.status === 'BOARDING' || schedule.status === 'DEPARTED'
    );
  };

  const upcomingSchedules = getUpcomingSchedules();
  const activeSchedules = getActiveSchedules();

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
            Welcome, {user?.first_name}!
          </Text>
          <Text variant="bodyMedium" style={styles.subtitleText}>
            Ready for your next trip?
          </Text>
        </View>

        {/* Active Trips */}
        {activeSchedules.length > 0 && (
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Active Trips
            </Text>
            {activeSchedules.map((schedule) => (
              <Card key={schedule.id} style={styles.scheduleCard}>
                <Card.Content>
                  <View style={styles.scheduleHeader}>
                    <Text variant="titleSmall">
                      {schedule.route.origin} → {schedule.route.destination}
                    </Text>
                    <Chip
                      mode="outlined"
                      textStyle={styles.statusChip}
                      style={[
                        styles.statusChip,
                        { backgroundColor: schedule.status === 'BOARDING' ? '#E8F5E8' : '#FFF3CD' }
                      ]}
                    >
                      {schedule.status}
                    </Chip>
                  </View>
                  <Text variant="bodyMedium" style={styles.departureTime}>
                    Departure: {formatTime(schedule.departure_time)}
                  </Text>
                  <Text variant="bodySmall" style={styles.seatsText}>
                    {schedule.seats_booked} / {schedule.seats_total} passengers
                  </Text>
                  <View style={styles.scheduleActions}>
                    <Button
                      mode="outlined"
                      onPress={() => handleScanQR(schedule)}
                      style={styles.actionButton}
                      compact
                    >
                      Scan QR
                    </Button>
                    <Button
                      mode="contained"
                      onPress={() => handleTrackLocation(schedule)}
                      style={styles.actionButton}
                      compact
                    >
                      Track Location
                    </Button>
                  </View>
                </Card.Content>
              </Card>
            ))}
          </View>
        )}

        {/* Upcoming Trips */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Upcoming Trips
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
                    {schedule.seats_booked} / {schedule.seats_total} passengers
                  </Text>
                  <Button
                    mode="contained"
                    onPress={() => handleStartTrip(schedule)}
                    style={styles.startButton}
                  >
                    Start Trip
                  </Button>
                </Card.Content>
              </Card>
            ))
          ) : (
            <Card style={styles.emptyCard}>
              <Card.Content>
                <Text variant="bodyMedium" style={styles.emptyText}>
                  No upcoming trips today
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
        icon="map"
        style={styles.fab}
        onPress={() => navigation.navigate('LocationTracking', { scheduleId: 1 })}
        label="Track Location"
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
    backgroundColor: '#10B981',
  },
  welcomeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  subtitleText: {
    color: '#E8F5E8',
    marginTop: 4,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  scheduleCard: {
    marginBottom: 12,
    elevation: 2,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusChip: {
    height: 28,
    fontSize: 12,
    fontWeight: 'bold',
  },
  timeText: {
    color: '#10B981',
    fontWeight: 'bold',
  },
  departureTime: {
    marginBottom: 4,
    fontWeight: '500',
  },
  seatsText: {
    color: '#666',
    marginBottom: 12,
  },
  scheduleActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
  startButton: {
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
    backgroundColor: '#10B981',
  },
});

export default HomeScreen;
