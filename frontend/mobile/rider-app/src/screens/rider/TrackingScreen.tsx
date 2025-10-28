import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, Card, Button, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import MapView, { Marker, Polyline } from 'react-native-maps';

import { useApi } from '@/shared/api';
import { useWebSocket } from '@/shared/websocket';
import { formatTime, getTimeUntil, calculateDistance, formatDistance } from '@/shared/utils';
import { RiderStackParamList } from '@/navigation/RiderNavigator';
import { Schedule, DriverLocation } from '@/shared/types';

type TrackingScreenNavigationProp = StackNavigationProp<RiderStackParamList, 'Tracking'>;
type TrackingScreenRouteProp = RouteProp<RiderStackParamList, 'Tracking'>;

const TrackingScreen: React.FC = () => {
  const navigation = useNavigation<TrackingScreenNavigationProp>();
  const route = useRoute<TrackingScreenRouteProp>();
  const api = useApi();
  const { socket, isConnected } = useWebSocket();
  
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [driverLocation, setDriverLocation] = useState<DriverLocation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [eta, setEta] = useState<string>('Calculating...');

  const { scheduleId } = route.params;

  useEffect(() => {
    loadSchedule();
    connectToTracking();
    
    return () => {
      if (socket) {
        socket.emit('leave_tracking', { schedule_id: scheduleId });
      }
    };
  }, [scheduleId]);

  const loadSchedule = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/schedules/${scheduleId}/`);
      setSchedule(response.data);
    } catch (error) {
      console.error('Error loading schedule:', error);
      Alert.alert('Error', 'Failed to load schedule information');
    } finally {
      setIsLoading(false);
    }
  };

  const connectToTracking = () => {
    if (socket && isConnected) {
      socket.emit('join_tracking', { schedule_id: scheduleId });
      
      socket.on('driver_location_update', (data: DriverLocation) => {
        setDriverLocation(data);
        calculateETA(data);
      });
      
      socket.on('schedule_status_update', (data: any) => {
        if (schedule) {
          setSchedule({ ...schedule, status: data.status });
        }
      });
    }
  };

  const calculateETA = (location: DriverLocation) => {
    if (!schedule) return;
    
    // Simple ETA calculation based on distance and average speed
    const distance = calculateDistance(
      location.lat,
      location.lng,
      parseFloat(schedule.route.origin_lat || '0'),
      parseFloat(schedule.route.origin_lng || '0')
    );
    
    const averageSpeed = 30; // km/h
    const timeInHours = distance / averageSpeed;
    const timeInMinutes = Math.round(timeInHours * 60);
    
    if (timeInMinutes < 1) {
      setEta('Arriving now');
    } else if (timeInMinutes < 60) {
      setEta(`${timeInMinutes} minutes`);
    } else {
      const hours = Math.floor(timeInMinutes / 60);
      const minutes = timeInMinutes % 60;
      setEta(`${hours}h ${minutes}m`);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const getMapRegion = () => {
    if (driverLocation) {
      return {
        latitude: driverLocation.lat,
        longitude: driverLocation.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
    }
    
    if (schedule) {
      return {
        latitude: parseFloat(schedule.route.origin_lat || '-1.2921'),
        longitude: parseFloat(schedule.route.origin_lng || '36.8219'),
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    }
    
    return {
      latitude: -1.2921,
      longitude: 36.8219,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
  };

  const getRouteCoordinates = () => {
    if (!schedule) return [];
    
    // This would typically come from the route's polyline data
    // For now, return a simple route between origin and destination
    return [
      {
        latitude: parseFloat(schedule.route.origin_lat || '-1.2921'),
        longitude: parseFloat(schedule.route.origin_lng || '36.8219'),
      },
      {
        latitude: parseFloat(schedule.route.destination_lat || '-1.2921'),
        longitude: parseFloat(schedule.route.destination_lng || '36.8219'),
      },
    ];
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Button mode="text" onPress={handleBack} icon="arrow-left">
          Back
        </Button>
        <Text variant="titleMedium" style={styles.headerTitle}>
          Track Your Ride
        </Text>
      </View>

      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          region={getMapRegion()}
          showsUserLocation
          showsMyLocationButton
        >
          {/* Route Polyline */}
          <Polyline
            coordinates={getRouteCoordinates()}
            strokeColor="#3B82F6"
            strokeWidth={3}
          />
          
          {/* Driver Location Marker */}
          {driverLocation && (
            <Marker
              coordinate={{
                latitude: driverLocation.lat,
                longitude: driverLocation.lng,
              }}
              title="Your Bus"
              description={`ETA: ${eta}`}
              pinColor="#3B82F6"
            />
          )}
          
          {/* Origin Marker */}
          <Marker
            coordinate={{
              latitude: parseFloat(schedule.route.origin_lat || '-1.2921'),
              longitude: parseFloat(schedule.route.origin_lng || '36.8219'),
            }}
            title="Pickup Point"
            pinColor="#10B981"
          />
          
          {/* Destination Marker */}
          <Marker
            coordinate={{
              latitude: parseFloat(schedule.route.destination_lat || '-1.2921'),
              longitude: parseFloat(schedule.route.destination_lng || '36.8219'),
            }}
            title="Destination"
            pinColor="#EF4444"
          />
        </MapView>
      </View>

      <View style={styles.infoContainer}>
        <Card style={styles.infoCard}>
          <Card.Content>
            <View style={styles.routeInfo}>
              <Text variant="titleMedium" style={styles.routeTitle}>
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
            
            <View style={styles.timeInfo}>
              <View style={styles.timeItem}>
                <Text variant="bodySmall" style={styles.timeLabel}>
                  Scheduled Departure
                </Text>
                <Text variant="bodyLarge" style={styles.timeValue}>
                  {formatTime(schedule.departure_time)}
                </Text>
              </View>
              
              <View style={styles.timeItem}>
                <Text variant="bodySmall" style={styles.timeLabel}>
                  ETA to Pickup
                </Text>
                <Text variant="bodyLarge" style={styles.etaValue}>
                  {eta}
                </Text>
              </View>
            </View>
            
            {driverLocation && (
              <View style={styles.locationInfo}>
                <Text variant="bodySmall" style={styles.locationLabel}>
                  Bus Location
                </Text>
                <Text variant="bodyMedium" style={styles.locationValue}>
                  {driverLocation.lat.toFixed(4)}, {driverLocation.lng.toFixed(4)}
                </Text>
                <Text variant="bodySmall" style={styles.speedValue}>
                  Speed: {driverLocation.speed || 0} km/h
                </Text>
              </View>
            )}
            
            <View style={styles.connectionStatus}>
              <Text variant="bodySmall" style={styles.connectionText}>
                Connection: {isConnected ? 'Connected' : 'Disconnected'}
              </Text>
            </View>
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
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  infoContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
  infoCard: {
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
  etaValue: {
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  locationInfo: {
    marginBottom: 16,
  },
  locationLabel: {
    color: '#666',
    marginBottom: 4,
  },
  locationValue: {
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  speedValue: {
    color: '#666',
  },
  connectionStatus: {
    alignItems: 'center',
  },
  connectionText: {
    color: '#666',
  },
});

export default TrackingScreen;
