import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, Chip, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { useApi } from '@/shared/api';
import { formatTime, formatDate, getStatusText, getStatusColor } from '@/shared/utils';
import { RiderStackParamList } from '@/navigation/RiderNavigator';
import { Booking } from '@/shared/types';

type BookingDetailsScreenNavigationProp = StackNavigationProp<RiderStackParamList, 'BookingDetails'>;
type BookingDetailsScreenRouteProp = RouteProp<RiderStackParamList, 'BookingDetails'>;

const BookingDetailsScreen: React.FC = () => {
  const navigation = useNavigation<BookingDetailsScreenNavigationProp>();
  const route = useRoute<BookingDetailsScreenRouteProp>();
  const api = useApi();
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { bookingId } = route.params;

  useEffect(() => {
    loadBooking();
  }, [bookingId]);

  const loadBooking = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/bookings/${bookingId}/`);
      setBooking(response.data);
    } catch (error) {
      console.error('Error loading booking:', error);
      Alert.alert('Error', 'Failed to load booking information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleCancelBooking = async () => {
    if (!booking) return;

    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.post(`/bookings/${booking.id}/cancel/`);
              Alert.alert('Success', 'Booking cancelled successfully');
              navigation.goBack();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to cancel booking');
            }
          },
        },
      ]
    );
  };

  const handleShowQR = () => {
    navigation.navigate('QRCode', { bookingId: booking!.id });
  };

  const handleTrackRide = () => {
    navigation.navigate('Tracking', { scheduleId: booking!.schedule.id });
  };

  if (isLoading || !booking) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const statusColor = getStatusColor(booking.status);
  const statusText = getStatusText(booking.status);
  const canCancel = booking.status === 'RESERVED';
  const canShowQR = booking.status === 'RESERVED' || booking.status === 'CHECKED_IN';
  const canTrack = booking.status === 'RESERVED' || booking.status === 'CHECKED_IN';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Button mode="text" onPress={handleBack} icon="arrow-left">
          Back
        </Button>
        <Text variant="titleMedium" style={styles.headerTitle}>
          Booking Details
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Route Info Card */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.routeHeader}>
              <Text variant="titleLarge" style={styles.routeTitle}>
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
            
            <Divider style={styles.divider} />
            
            <View style={styles.timeInfo}>
              <View style={styles.timeItem}>
                <Text variant="bodySmall" style={styles.timeLabel}>
                  Departure Time
                </Text>
                <Text variant="bodyLarge" style={styles.timeValue}>
                  {formatTime(booking.schedule.departure_time)}
                </Text>
              </View>
              
              <View style={styles.timeItem}>
                <Text variant="bodySmall" style={styles.timeLabel}>
                  Date
                </Text>
                <Text variant="bodyLarge" style={styles.timeValue}>
                  {formatDate(booking.schedule.departure_time)}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Booking Info Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Booking Information
            </Text>
            
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.infoLabel}>
                Booking ID:
              </Text>
              <Text variant="bodyMedium" style={styles.infoValue}>
                #{booking.id}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.infoLabel}>
                Seat Number:
              </Text>
              <Text variant="bodyMedium" style={styles.infoValue}>
                {booking.seat_number || 'Not assigned'}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.infoLabel}>
                Booking Date:
              </Text>
              <Text variant="bodyMedium" style={styles.infoValue}>
                {formatDate(booking.created_at)}
              </Text>
            </View>
            
            {booking.check_in_time && (
              <View style={styles.infoRow}>
                <Text variant="bodyMedium" style={styles.infoLabel}>
                  Check-in Time:
                </Text>
                <Text variant="bodyMedium" style={styles.infoValue}>
                  {formatTime(booking.check_in_time)}
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Route Details Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Route Details
            </Text>
            
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.infoLabel}>
                Origin:
              </Text>
              <Text variant="bodyMedium" style={styles.infoValue}>
                {booking.schedule.route.origin}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.infoLabel}>
                Destination:
              </Text>
              <Text variant="bodyMedium" style={styles.infoValue}>
                {booking.schedule.route.destination}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.infoLabel}>
                Estimated Duration:
              </Text>
              <Text variant="bodyMedium" style={styles.infoValue}>
                {booking.schedule.route.estimated_duration_mins} minutes
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.infoLabel}>
                Seats Available:
              </Text>
              <Text variant="bodyMedium" style={styles.infoValue}>
                {booking.schedule.seats_available}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Actions Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Actions
            </Text>
            
            <View style={styles.actionsContainer}>
              {canShowQR && (
                <Button
                  mode="contained"
                  onPress={handleShowQR}
                  style={styles.actionButton}
                  icon="qrcode"
                >
                  Show QR Code
                </Button>
              )}
              
              {canTrack && (
                <Button
                  mode="outlined"
                  onPress={handleTrackRide}
                  style={styles.actionButton}
                  icon="map"
                >
                  Track Ride
                </Button>
              )}
              
              {canCancel && (
                <Button
                  mode="outlined"
                  onPress={handleCancelBooking}
                  style={[styles.actionButton, styles.cancelButton]}
                  textColor="#EF4444"
                  icon="cancel"
                >
                  Cancel Booking
                </Button>
              )}
            </View>
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
  routeHeader: {
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    color: '#666',
    flex: 1,
  },
  infoValue: {
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  actionsContainer: {
    gap: 12,
  },
  actionButton: {
    marginBottom: 8,
  },
  cancelButton: {
    borderColor: '#EF4444',
  },
});

export default BookingDetailsScreen;
