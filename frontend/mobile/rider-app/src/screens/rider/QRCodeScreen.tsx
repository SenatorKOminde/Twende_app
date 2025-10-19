import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, Card, Button, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import QRCode from 'react-native-qrcode-svg';

import { useApi } from '@/shared/api';
import { formatTime, formatDate, getStatusText, getStatusColor } from '@/shared/utils';
import { RiderStackParamList } from '@/navigation/RiderNavigator';
import { Booking } from '@/shared/types';

type QRCodeScreenNavigationProp = StackNavigationProp<RiderStackParamList, 'QRCode'>;
type QRCodeScreenRouteProp = RouteProp<RiderStackParamList, 'QRCode'>;

const QRCodeScreen: React.FC = () => {
  const navigation = useNavigation<QRCodeScreenNavigationProp>();
  const route = useRoute<QRCodeScreenRouteProp>();
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

  const generateQRData = () => {
    if (!booking) return '';
    
    return JSON.stringify({
      booking_id: booking.id,
      qr_code: booking.qr_code,
      timestamp: Date.now(),
    });
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Button mode="text" onPress={handleBack} icon="arrow-left">
          Back
        </Button>
        <Text variant="titleMedium" style={styles.headerTitle}>
          Boarding Pass
        </Text>
      </View>

      <View style={styles.content}>
        {/* Booking Info Card */}
        <Card style={styles.infoCard}>
          <Card.Content>
            <View style={styles.routeInfo}>
              <Text variant="titleMedium" style={styles.routeTitle}>
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
            
            {booking.seat_number && (
              <View style={styles.seatInfo}>
                <Text variant="bodySmall" style={styles.seatLabel}>
                  Seat Number
                </Text>
                <Text variant="headlineSmall" style={styles.seatValue}>
                  {booking.seat_number}
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* QR Code Card */}
        <Card style={styles.qrCard}>
          <Card.Content style={styles.qrContent}>
            <Text variant="titleMedium" style={styles.qrTitle}>
              Scan to Board
            </Text>
            <Text variant="bodySmall" style={styles.qrSubtitle}>
              Show this QR code to the driver
            </Text>
            
            <View style={styles.qrContainer}>
              <QRCode
                value={generateQRData()}
                size={200}
                color="#000"
                backgroundColor="#fff"
                logoSize={30}
                logoMargin={2}
                logoBorderRadius={15}
                quietZone={10}
              />
            </View>
            
            <Text variant="bodySmall" style={styles.qrCodeText}>
              {booking.qr_code}
            </Text>
          </Card.Content>
        </Card>

        {/* Instructions Card */}
        <Card style={styles.instructionsCard}>
          <Card.Content>
            <Text variant="titleSmall" style={styles.instructionsTitle}>
              Boarding Instructions
            </Text>
            <Text variant="bodySmall" style={styles.instructionText}>
              • Arrive at the pickup point 5 minutes before departure
            </Text>
            <Text variant="bodySmall" style={styles.instructionText}>
              • Show this QR code to the driver
            </Text>
            <Text variant="bodySmall" style={styles.instructionText}>
              • Keep your phone charged for the journey
            </Text>
            <Text variant="bodySmall" style={styles.instructionText}>
              • Follow the driver's instructions for boarding
            </Text>
          </Card.Content>
        </Card>
      </View>
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
  content: {
    flex: 1,
    padding: 16,
  },
  infoCard: {
    marginBottom: 16,
    elevation: 2,
  },
  routeInfo: {
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
  timeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
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
  seatInfo: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  seatLabel: {
    color: '#666',
    marginBottom: 4,
  },
  seatValue: {
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  qrCard: {
    marginBottom: 16,
    elevation: 2,
  },
  qrContent: {
    alignItems: 'center',
  },
  qrTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  qrSubtitle: {
    color: '#666',
    marginBottom: 24,
  },
  qrContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
  },
  qrCodeText: {
    fontFamily: 'monospace',
    color: '#666',
    textAlign: 'center',
  },
  instructionsCard: {
    elevation: 2,
  },
  instructionsTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  instructionText: {
    color: '#666',
    marginBottom: 8,
  },
});

export default QRCodeScreen;
