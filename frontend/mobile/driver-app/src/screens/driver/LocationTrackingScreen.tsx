import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, Card, Button, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import MapView, { Marker, Polyline } from 'react-native-maps';

import { useApi } from '@/shared/api';
import { useWebSocket } from '@/shared/websocket';
import { useLocation } from '@/shared/hooks';
import { formatTime, getStatusText, getStatusColor } from '@/shared/utils';
import { DriverStackParamList } from '@/navigation/DriverNavigator';
import { Schedule, DriverLocation } from '@/shared/types';

type LocationTrackingScreenNavigationProp = StackNavigationProp<DriverStackParamList, 'LocationTracking'>;
type LocationTrackingScreenRouteProp = RouteProp<DriverStackParamList, 'LocationTracking'>;

const LocationTrackingScreen: React.FC = () => {
  const navigation = useNavigation<LocationTrackingScreenNavigationProp>();
  const route = useRoute<LocationTrackingScreenRouteProp>();
  const api = useApi();
  const { socket, isConnected } = useWebSocket();
  const { location, watchLocation } = useLocation();
  
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

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
      const response = await api.get(`/driver/schedules/${scheduleId}/`);
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
      
      socket.on('location_update_success', (data: any) => {
        setLastUpdate(new Date());
      });
      
      socket.on('location_update_error', (error: any) => {
        console.error('Location update error:', error);
      });
    }
  };

  const startTracking = async () => {
    try {
      setIsTracking(true);
      watchLocation();
      
      // Start sending location updates
      const interval = setInterval(async () => {
        if (location && isTracking) {
          try {
            await api.post('/driver/location/', {
              lat: location.coords.latitude,
              lng: location.coords.longitude,
              speed: location.coords.speed || 0,
              bearing: location.coords.heading || 0,
              schedule_id: scheduleId,
            });
          } catch (error) {
            console.error('Error sending location update:', error);
          }
        }
      }, 5000); // Update every 5 seconds

      // Store interval ID for cleanup
      (window as any).locationUpdateInterval = interval;
    } catch (error) {
      console.error('Error starting location tracking:', error);
      Alert.alert('Error', 'Failed to start location tracking');
      setIsTracking(false);
    }
  };

  const stopTracking = () => {
    setIsTracking(false);
    
    // Clear the location update interval
    if ((window as any).locationUpdateInterval) {
      clearInterval((window as any).locationUpdateInterval);
      (window as any).locationUpdateInterval = null;
    }
  };

  const handleBack = () => {
    if (isTracking) {
      Alert.alert(
        'Stop Tracking',
        'Are you sure you want to stop tracking your location?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Stop',
            onPress: () => {
              stopTracking();
              navigation.goBack();
            },
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const getMapRegion = () => {
    if (location) {
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
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

  const statusColor = getStatusColor(schedule.status);
  const statusText = getStatusText(schedule.status);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Button mode="text" onPress={handleBack} icon="arrow-left">
          Back
        </Button>
        <Text variant="titleMedium" style={styles.headerTitle}>
          Location Tracking
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
            strokeColor="#10B981"
            strokeWidth={3}
          />
          
          {/* Current Location Marker */}
          {location && (
            <Marker
              coordinate={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }}
              title="Your Location"
              description="Current position"
              pinColor="#10B981"
            />
          )}
          
          {/* Origin Marker */}
          <Marker
            coordinate={{
              latitude: parseFloat(schedule.route.origin_lat || '-1.2921'),
              longitude: parseFloat(schedule.route.origin_lng || '36.8219'),
            }}
            title="Pickup Point"
            pinColor="#3B82F6"
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
                {statusText}
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
                  Tracking Status
                </Text>
                <Text variant="bodyLarge" style={styles.trackingStatus}>
                  {isTracking ? 'Active' : 'Inactive'}
                </Text>
              </View>
            </View>
            
            {location && (
              <View style={styles.locationInfo}>
                <Text variant="bodySmall" style={styles.locationLabel}>
                  Current Location
                </Text>
                <Text variant="bodyMedium" style={styles.locationValue}>
                  {location.coords.latitude.toFixed(4)}, {location.coords.longitude.toFixed(4)}
                </Text>
                <Text variant="bodySmall" style={styles.speedValue}>
                  Speed: {location.coords.speed ? `${(location.coords.speed * 3.6).toFixed(1)} km/h` : '0 km/h'}
                </Text>
              </View>
            )}
            
            {lastUpdate && (
              <View style={styles.updateInfo}>
                <Text variant="bodySmall" style={styles.updateLabel}>
                  Last Update
                </Text>
                <Text variant="bodySmall" style={styles.updateValue}>
                  {lastUpdate.toLocaleTimeString()}
                </Text>
              </View>
            )}
            
            <View style={styles.connectionStatus}>
              <Text variant="bodySmall" style={styles.connectionText}>
                Connection: {isConnected ? 'Connected' : 'Disconnected'}
              </Text>
            </View>
            
            <View style={styles.trackingActions}>
              {!isTracking ? (
                <Button
                  mode="contained"
                  onPress={startTracking}
                  style={styles.trackingButton}
                  icon="play"
                >
                  Start Tracking
                </Button>
              ) : (
                <Button
                  mode="outlined"
                  onPress={stopTracking}
                  style={styles.trackingButton}
                  icon="stop"
                >
                  Stop Tracking
                </Button>
              )}
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
    color: '#10B981',
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
  trackingStatus: {
    fontWeight: 'bold',
    color: '#10B981',
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
  updateInfo: {
    marginBottom: 16,
  },
  updateLabel: {
    color: '#666',
    marginBottom: 4,
  },
  updateValue: {
    color: '#666',
  },
  connectionStatus: {
    alignItems: 'center',
    marginBottom: 16,
  },
  connectionText: {
    color: '#666',
  },
  trackingActions: {
    alignItems: 'center',
  },
  trackingButton: {
    minWidth: 200,
  },
});

export default LocationTrackingScreen;
