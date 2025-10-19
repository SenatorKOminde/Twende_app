import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, Chip, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { useApi } from '@/shared/api';
import { formatTime, formatDate, getStatusText, getStatusColor } from '@/shared/utils';
import { DriverStackParamList } from '@/navigation/DriverNavigator';
import { Schedule, Booking } from '@/shared/types';

type TripDetailsScreenNavigationProp = StackNavigationProp<DriverStackParamList, 'TripDetails'>;
type TripDetailsScreenRouteProp = RouteProp<DriverStackParamList, 'TripDetails'>;

const TripDetailsScreen: React.FC = () => {
  const navigation = useNavigation<TripDetailsScreenNavigationProp>();
  const route = useRoute<TripDetailsScreenRouteProp>();
  const api = useApi();
  
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { scheduleId } = route.params;

  useEffect(() => {
    loadTripDetails();
  }, [scheduleId]);

  const loadTripDetails = async () => {
    try {
      setIsLoading(true);
      const [scheduleResponse, bookingsResponse] = await Promise.all([
        api.get(`/driver/schedules/${scheduleId}/`),
        api.get(`/driver/schedules/${scheduleId}/bookings/`),
      ]);
      
      setSchedule(scheduleResponse.data);
      setBookings(bookingsResponse.data.results || []);
    } catch (error) {
      console.error('Error loading trip details:', error);
      Alert.alert('Error', 'Failed to load trip details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleStartTrip = async () => {
    if (!schedule) return;

    try {
      await api.post(`/driver/schedules/${schedule.id}/start/`);
      await loadTripDetails();
      Alert.alert('Success', 'Trip started successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to start trip');
    }
  };

  const handleEndTrip = async () => {
    if (!schedule) return;

    Alert.alert(
      'End Trip',
      'Are you sure you want to end this trip?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Trip',
          onPress: async () => {
            try {
              await api.post(`/driver/schedules/${schedule.id}/end/`);
              await loadTripDetails();
              Alert.alert('Success', 'Trip ended successfully!');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to end trip');
            }
          },
        },
      ]
    );
  };

  const handleScanQR = () => {
    navigation.navigate('QRScanner', { scheduleId: schedule!.id });
  };

  const handleTrackLocation = () => {
    navigation.navigate('LocationTracking', { scheduleId: schedule!.id });
  };

  const handleCheckInPassenger = async (booking: Booking) => {
    try {
      await api.post(`/driver/bookings/${booking.id}/checkin/`);
      await loadTripDetails();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to check in passenger');
    }
  };

  if (isLoading || !schedule) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const statusColor = getStatusColor(schedule.status);
  const statusText = getStatusText(schedule.status);
  const canStart = schedule.status === 'SCHEDULED';
  const canEnd = schedule.status === 'DEPARTED';
  const canScan = schedule.status === 'BOARDING' || schedule.status === 'DEPARTED';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Button mode="text" onPress={handleBack} icon="arrow-left">
          Back
        </Button>
        <Text variant="titleMedium" style={styles.headerTitle}>
          Trip Details
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Trip Info Card */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.tripHeader}>
              <Text variant="titleLarge" style={styles.routeTitle}>
                {schedule.route.origin} → {schedule.route.destination}
              </Text>
              <Chip
                mode="outlined"
                textStyle={[styles.statusChip, { color: statusColor }]}
                style={[styles.statusChip, { borderColor: statusColor }]}
              >
                {statusText}
              </Chip>
            </View>
            
            <Divider style={styles.divider} />
            
            <View style={styles.timeInfo}>
              <View style={styles.timeItem}>
                <Text variant="bodySmall" style={styles.timeLabel}>
                  Departure Time
                </Text>
                <Text variant="bodyLarge" style={styles.timeValue}>
                  {formatTime(schedule.departure_time)}
                </Text>
              </View>
              
              <View style={styles.timeItem}>
                <Text variant="bodySmall" style={styles.timeLabel}>
                  Date
                </Text>
                <Text variant="bodyLarge" style={styles.timeValue}>
                  {formatDate(schedule.departure_time)}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Trip Actions Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Trip Actions
            </Text>
            
            <View style={styles.actionsContainer}>
              {canStart && (
                <Button
                  mode="contained"
                  onPress={handleStartTrip}
                  style={styles.actionButton}
                  icon="play"
                >
                  Start Trip
                </Button>
              )}
              
              {canEnd && (
                <Button
                  mode="outlined"
                  onPress={handleEndTrip}
                  style={styles.actionButton}
                  icon="stop"
                >
                  End Trip
                </Button>
              )}
              
              {canScan && (
                <Button
                  mode="outlined"
                  onPress={handleScanQR}
                  style={styles.actionButton}
                  icon="qrcode"
                >
                  Scan QR Code
                </Button>
              )}
              
              <Button
                mode="outlined"
                onPress={handleTrackLocation}
                style={styles.actionButton}
                icon="map"
              >
                Track Location
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Passengers Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Passengers ({bookings.length})
            </Text>
            
            {bookings.length > 0 ? (
              bookings.map((booking) => (
                <View key={booking.id} style={styles.passengerItem}>
                  <View style={styles.passengerInfo}>
                    <Text variant="bodyLarge" style={styles.passengerName}>
                      {booking.rider.first_name} {booking.rider.last_name}
                    </Text>
                    <Text variant="bodySmall" style={styles.passengerSeat}>
                      Seat: {booking.seat_number || 'Not assigned'}
                    </Text>
                    <Chip
                      mode="outlined"
                      textStyle={styles.passengerStatus}
                      style={[
                        styles.passengerStatus,
                        { 
                          borderColor: booking.status === 'CHECKED_IN' ? '#10B981' : '#F59E0B',
                          backgroundColor: booking.status === 'CHECKED_IN' ? '#E8F5E8' : '#FFF3CD'
                        }
                      ]}
                    >
                      {booking.status === 'CHECKED_IN' ? 'Checked In' : 'Reserved'}
                    </Chip>
                  </View>
                  
                  {booking.status === 'RESERVED' && (
                    <Button
                      mode="outlined"
                      onPress={() => handleCheckInPassenger(booking)}
                      style={styles.checkInButton}
                      compact
                    >
                      Check In
                    </Button>
                  )}
                </View>
              ))
            ) : (
              <Text variant="bodyMedium" style={styles.noPassengersText}>
                No passengers booked for this trip
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
    color: '#10B981',
  },
  scrollView: {
    flex: 1,
  },
  card: {
    margin: 16,
    marginBottom: 0,
    elevation: 2,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  routeTitle: {
    fontWeight: 'bold',
    flex: 1,
  },
  statusChip: {
    height: 28,
    fontSize: 12,
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 16,
  },
  timeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeItem: {
    flex: 1,
  },
  timeLabel: {
    color: '#666',
    marginBottom: 4,
  },
  timeValue: {
    fontWeight: 'bold',
  },
  cardTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  actionsContainer: {
    gap: 12,
  },
  actionButton: {
    marginBottom: 8,
  },
  passengerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  passengerInfo: {
    flex: 1,
  },
  passengerName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  passengerSeat: {
    color: '#666',
    marginBottom: 8,
  },
  passengerStatus: {
    height: 24,
    fontSize: 10,
    fontWeight: 'bold',
  },
  checkInButton: {
    marginLeft: 12,
  },
  noPassengersText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
});

export default TripDetailsScreen;
