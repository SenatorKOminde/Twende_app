import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, Chip, List } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { useApi } from '@/shared/api';
import { formatTime, formatDate, getTimeUntil } from '@/shared/utils';
import { RiderStackParamList } from '@/navigation/RiderNavigator';
import { Route, Schedule } from '@/shared/types';

type RouteDetailsScreenNavigationProp = StackNavigationProp<RiderStackParamList, 'RouteDetails'>;
type RouteDetailsScreenRouteProp = RouteProp<RiderStackParamList, 'RouteDetails'>;

const RouteDetailsScreen: React.FC = () => {
  const navigation = useNavigation<RouteDetailsScreenNavigationProp>();
  const route = useRoute<RouteDetailsScreenRouteProp>();
  const api = useApi();
  
  const [routeData, setRouteData] = useState<Route | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { routeId } = route.params;

  useEffect(() => {
    loadRouteData();
  }, [routeId]);

  const loadRouteData = async () => {
    try {
      setIsLoading(true);
      const [routeResponse, schedulesResponse] = await Promise.all([
        api.get(`/routes/${routeId}/`),
        api.get(`/schedules/?route_id=${routeId}&date=${new Date().toISOString().split('T')[0]}`),
      ]);
      
      setRouteData(routeResponse.data);
      setSchedules(schedulesResponse.data.results || []);
    } catch (error) {
      console.error('Error loading route data:', error);
      Alert.alert('Error', 'Failed to load route information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleBookSchedule = async (schedule: Schedule) => {
    try {
      const response = await api.post('/bookings/', {
        schedule_id: schedule.id,
      });
      
      Alert.alert(
        'Booking Confirmed',
        'Your ride has been booked successfully!',
        [
          {
            text: 'View Booking',
            onPress: () => navigation.navigate('BookingDetails', { bookingId: response.data.id }),
          },
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Booking Failed', error.message || 'Failed to book ride');
    }
  };

  const getUpcomingSchedules = () => {
    const now = new Date();
    return schedules
      .filter(schedule => new Date(schedule.departure_time) > now)
      .sort((a, b) => new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime());
  };

  const upcomingSchedules = getUpcomingSchedules();

  if (isLoading || !routeData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Button mode="text" onPress={handleBack} icon="arrow-left">
          Back
        </Button>
        <Text variant="titleMedium" style={styles.headerTitle}>
          Route Details
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Route Info Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.routeTitle}>
              {routeData.origin} → {routeData.destination}
            </Text>
            
            <View style={styles.routeInfo}>
              <View style={styles.infoItem}>
                <Text variant="bodySmall" style={styles.infoLabel}>
                  Estimated Duration
                </Text>
                <Text variant="bodyLarge" style={styles.infoValue}>
                  {routeData.estimated_duration_mins} minutes
                </Text>
              </View>
              
              <View style={styles.infoItem}>
                <Text variant="bodySmall" style={styles.infoLabel}>
                  Route Status
                </Text>
                <Chip
                  mode="outlined"
                  textStyle={styles.statusChip}
                  style={[
                    styles.statusChip,
                    { backgroundColor: routeData.active ? '#E8F5E8' : '#FFF3CD' }
                  ]}
                >
                  {routeData.active ? 'Active' : 'Inactive'}
                </Chip>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Route Stops Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Route Stops
            </Text>
            
            <List.Item
              title="Origin"
              description={routeData.origin}
              left={(props) => <List.Icon {...props} icon="map-marker" color="#10B981" />}
            />
            
            <List.Item
              title="Destination"
              description={routeData.destination}
              left={(props) => <List.Icon {...props} icon="flag" color="#EF4444" />}
            />
          </Card.Content>
        </Card>

        {/* Available Schedules Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Available Departures
            </Text>
            
            {upcomingSchedules.length > 0 ? (
              upcomingSchedules.map((schedule) => (
                <View key={schedule.id} style={styles.scheduleItem}>
                  <View style={styles.scheduleInfo}>
                    <Text variant="bodyLarge" style={styles.scheduleTime}>
                      {formatTime(schedule.departure_time)}
                    </Text>
                    <Text variant="bodySmall" style={styles.scheduleDate}>
                      {formatDate(schedule.departure_time)}
                    </Text>
                    <Text variant="bodySmall" style={styles.seatsAvailable}>
                      {schedule.seats_available} seats available
                    </Text>
                  </View>
                  
                  <View style={styles.scheduleActions}>
                    <Text variant="bodySmall" style={styles.timeUntil}>
                      {getTimeUntil(schedule.departure_time)}
                    </Text>
                    <Button
                      mode="contained"
                      onPress={() => handleBookSchedule(schedule)}
                      style={styles.bookButton}
                      disabled={schedule.seats_available === 0}
                      compact
                    >
                      Book
                    </Button>
                  </View>
                </View>
              ))
            ) : (
              <Text variant="bodyMedium" style={styles.noSchedulesText}>
                No upcoming departures today
              </Text>
            )}
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    marginLeft: 16,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  scrollView: {
    flex: 1,
  },
  card: {
    margin: 16,
    marginBottom: 0,
    elevation: 2,
  },
  routeTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  routeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
  },
  infoLabel: {
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontWeight: 'bold',
  },
  statusChip: {
    height: 28,
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  scheduleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  scheduleInfo: {
    flex: 1,
  },
  scheduleTime: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  scheduleDate: {
    color: '#666',
    marginBottom: 4,
  },
  seatsAvailable: {
    color: '#666',
  },
  scheduleActions: {
    alignItems: 'flex-end',
  },
  timeUntil: {
    color: '#3B82F6',
    marginBottom: 8,
  },
  bookButton: {
    minWidth: 80,
  },
  noSchedulesText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
});

export default RouteDetailsScreen;
