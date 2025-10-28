import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Card, Button, Chip, List } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { useApi } from '@/shared/api';
import { formatTime, getStatusColor, getStatusText } from '@/shared/utils';
import { DriverStackParamList } from '@/navigation/DriverNavigator';
import { Booking } from '@/shared/types';

type PassengersScreenNavigationProp = StackNavigationProp<DriverStackParamList, 'DriverTabs'>;

const PassengersScreen: React.FC = () => {
  const navigation = useNavigation<PassengersScreenNavigationProp>();
  const api = useApi();
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPassengers();
  }, []);

  const loadPassengers = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/driver/passengers/');
      setBookings(response.data.results || []);
    } catch (error) {
      console.error('Error loading passengers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPassengers();
    setRefreshing(false);
  };

  const handleCheckIn = async (booking: Booking) => {
    try {
      await api.post(`/driver/bookings/${booking.id}/checkin/`);
      await loadPassengers();
    } catch (error) {
      console.error('Error checking in passenger:', error);
    }
  };

  const handleScanQR = (scheduleId: number) => {
    navigation.navigate('QRScanner', { scheduleId });
  };

  const renderPassengerItem = ({ item: booking }: { item: Booking }) => {
    const statusColor = getStatusColor(booking.status);
    const statusText = getStatusText(booking.status);
    const canCheckIn = booking.status === 'RESERVED';

    return (
      <Card style={styles.passengerCard}>
        <Card.Content>
          <View style={styles.passengerHeader}>
            <Text variant="titleSmall">
              {booking.rider.first_name} {booking.rider.last_name}
            </Text>
            <Chip
              mode="outlined"
              textStyle={[styles.statusChip, { color: statusColor }]}
              style={[styles.statusChip, { borderColor: statusColor }]}
            >
              {statusText}
            </Chip>
          </View>
          
          <Text variant="bodyMedium" style={styles.routeText}>
            {booking.schedule.route.origin} → {booking.schedule.route.destination}
          </Text>
          
          <Text variant="bodySmall" style={styles.departureTime}>
            Departure: {formatTime(booking.schedule.departure_time)}
          </Text>
          
          {booking.seat_number && (
            <Text variant="bodySmall" style={styles.seatNumber}>
              Seat: {booking.seat_number}
            </Text>
          )}
          
          <View style={styles.passengerActions}>
            {canCheckIn && (
              <Button
                mode="contained"
                onPress={() => handleCheckIn(booking)}
                style={styles.actionButton}
                compact
              >
                Check In
              </Button>
            )}
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text variant="headlineSmall" style={styles.emptyTitle}>
        No Passengers
      </Text>
      <Text variant="bodyMedium" style={styles.emptyText}>
        No passengers booked for your trips today
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.headerTitle}>
          Passengers
        </Text>
        <Button
          mode="outlined"
          onPress={() => handleScanQR(1)}
          style={styles.scanButton}
          compact
        >
          Scan QR
        </Button>
      </View>

      <FlatList
        data={bookings}
        renderItem={renderPassengerItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontWeight: 'bold',
    color: '#10B981',
  },
  scanButton: {
    borderColor: '#10B981',
  },
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  passengerCard: {
    marginBottom: 12,
    elevation: 2,
  },
  passengerHeader: {
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
  routeText: {
    marginBottom: 4,
    fontWeight: '500',
  },
  departureTime: {
    color: '#666',
    marginBottom: 4,
  },
  seatNumber: {
    color: '#666',
    marginBottom: 12,
  },
  passengerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    color: '#666',
    marginBottom: 8,
  },
  emptyText: {
    color: '#999',
    textAlign: 'center',
  },
});

export default PassengersScreen;
