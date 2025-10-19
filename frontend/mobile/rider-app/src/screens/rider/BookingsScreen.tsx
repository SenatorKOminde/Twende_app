import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Card, Button, Chip, FAB } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { useApi } from '@/shared/api';
import { formatDate, formatTime, getStatusColor, getStatusText } from '@/shared/utils';
import { RiderStackParamList } from '@/navigation/RiderNavigator';
import { Booking } from '@/shared/types';

type BookingsScreenNavigationProp = StackNavigationProp<RiderStackParamList, 'RiderTabs'>;

const BookingsScreen: React.FC = () => {
  const navigation = useNavigation<BookingsScreenNavigationProp>();
  const api = useApi();
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/bookings/');
      setBookings(response.data.results || []);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBookings();
    setRefreshing(false);
  };

  const handleBookingPress = (booking: Booking) => {
    navigation.navigate('BookingDetails', { bookingId: booking.id });
  };

  const handleCancelBooking = async (booking: Booking) => {
    try {
      await api.post(`/bookings/${booking.id}/cancel/`);
      await loadBookings();
    } catch (error) {
      console.error('Error cancelling booking:', error);
    }
  };

  const handleShowQR = (booking: Booking) => {
    navigation.navigate('QRCode', { bookingId: booking.id });
  };

  const renderBookingItem = ({ item: booking }: { item: Booking }) => {
    const statusColor = getStatusColor(booking.status);
    const statusText = getStatusText(booking.status);
    const canCancel = booking.status === 'RESERVED';
    const canShowQR = booking.status === 'RESERVED' || booking.status === 'CHECKED_IN';

    return (
      <Card style={styles.bookingCard} onPress={() => handleBookingPress(booking)}>
        <Card.Content>
          <View style={styles.bookingHeader}>
            <Text variant="titleSmall">
              {booking.schedule.route.origin} → {booking.schedule.route.destination}
            </Text>
            <Chip
              mode="outlined"
              textStyle={[styles.statusChip, { color: statusColor }]}
              style={[styles.statusChip, { borderColor: statusColor }]}
            >
              {statusText}
            </Chip>
          </View>
          
          <Text variant="bodyMedium" style={styles.departureTime}>
            Departure: {formatTime(booking.schedule.departure_time)}
          </Text>
          
          <Text variant="bodySmall" style={styles.bookingDate}>
            {formatDate(booking.schedule.departure_time)}
          </Text>
          
          {booking.seat_number && (
            <Text variant="bodySmall" style={styles.seatNumber}>
              Seat: {booking.seat_number}
            </Text>
          )}
          
          <View style={styles.bookingActions}>
            {canShowQR && (
              <Button
                mode="outlined"
                onPress={() => handleShowQR(booking)}
                style={styles.actionButton}
                compact
              >
                Show QR
              </Button>
            )}
            
            {canCancel && (
              <Button
                mode="outlined"
                onPress={() => handleCancelBooking(booking)}
                style={[styles.actionButton, styles.cancelButton]}
                compact
                textColor="#EF4444"
              >
                Cancel
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
        No Bookings Yet
      </Text>
      <Text variant="bodyMedium" style={styles.emptyText}>
        Your upcoming rides will appear here
      </Text>
      <Button
        mode="contained"
        onPress={() => navigation.navigate('Home')}
        style={styles.emptyButton}
      >
        Book Your First Ride
      </Button>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.headerTitle}>
          My Rides
        </Text>
      </View>

      <FlatList
        data={bookings}
        renderItem={renderBookingItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('Home')}
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
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  bookingCard: {
    marginBottom: 12,
    elevation: 2,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusChip: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  departureTime: {
    marginBottom: 4,
    fontWeight: '500',
  },
  bookingDate: {
    color: '#666',
    marginBottom: 4,
  },
  seatNumber: {
    color: '#666',
    marginBottom: 12,
  },
  bookingActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
  cancelButton: {
    borderColor: '#EF4444',
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
    marginBottom: 24,
  },
  emptyButton: {
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#3B82F6',
  },
});

export default BookingsScreen;
