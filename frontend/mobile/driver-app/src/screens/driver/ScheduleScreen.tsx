import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Card, Button, Chip, FAB } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { useApi } from '@/shared/api';
import { formatDate, formatTime, getStatusColor, getStatusText } from '@/shared/utils';
import { DriverStackParamList } from '@/navigation/DriverNavigator';
import { Schedule } from '@/shared/types';

type ScheduleScreenNavigationProp = StackNavigationProp<DriverStackParamList, 'DriverTabs'>;

const ScheduleScreen: React.FC = () => {
  const navigation = useNavigation<ScheduleScreenNavigationProp>();
  const api = useApi();
  
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    loadSchedules();
  }, [selectedDate]);

  const loadSchedules = async () => {
    try {
      setIsLoading(true);
      const date = selectedDate.toISOString().split('T')[0];
      const response = await api.get(`/driver/schedules/?date=${date}`);
      setSchedules(response.data.results || []);
    } catch (error) {
      console.error('Error loading schedules:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSchedules();
    setRefreshing(false);
  };

  const handleSchedulePress = (schedule: Schedule) => {
    navigation.navigate('TripDetails', { scheduleId: schedule.id });
  };

  const handleStartTrip = async (schedule: Schedule) => {
    try {
      await api.post(`/driver/schedules/${schedule.id}/start/`);
      await loadSchedules();
    } catch (error) {
      console.error('Error starting trip:', error);
    }
  };

  const handleEndTrip = async (schedule: Schedule) => {
    try {
      await api.post(`/driver/schedules/${schedule.id}/end/`);
      await loadSchedules();
    } catch (error) {
      console.error('Error ending trip:', error);
    }
  };

  const renderScheduleItem = ({ item: schedule }: { item: Schedule }) => {
    const statusColor = getStatusColor(schedule.status);
    const statusText = getStatusText(schedule.status);
    const canStart = schedule.status === 'SCHEDULED';
    const canEnd = schedule.status === 'DEPARTED';

    return (
      <Card style={styles.scheduleCard} onPress={() => handleSchedulePress(schedule)}>
        <Card.Content>
          <View style={styles.scheduleHeader}>
            <Text variant="titleSmall">
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
          
          <Text variant="bodyMedium" style={styles.departureTime}>
            Departure: {formatTime(schedule.departure_time)}
          </Text>
          
          <Text variant="bodySmall" style={styles.scheduleDate}>
            {formatDate(schedule.departure_time)}
          </Text>
          
          <Text variant="bodySmall" style={styles.passengersText}>
            {schedule.seats_booked} / {schedule.seats_total} passengers
          </Text>
          
          <View style={styles.scheduleActions}>
            {canStart && (
              <Button
                mode="contained"
                onPress={() => handleStartTrip(schedule)}
                style={styles.actionButton}
                compact
              >
                Start Trip
              </Button>
            )}
            
            {canEnd && (
              <Button
                mode="outlined"
                onPress={() => handleEndTrip(schedule)}
                style={styles.actionButton}
                compact
              >
                End Trip
              </Button>
            )}
            
            {schedule.status === 'BOARDING' && (
              <Button
                mode="outlined"
                onPress={() => navigation.navigate('QRScanner', { scheduleId: schedule.id })}
                style={styles.actionButton}
                compact
              >
                Scan QR
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
        No Schedules
      </Text>
      <Text variant="bodyMedium" style={styles.emptyText}>
        No trips scheduled for this date
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.headerTitle}>
          My Schedule
        </Text>
        <Text variant="bodyMedium" style={styles.headerDate}>
          {formatDate(selectedDate.toISOString())}
        </Text>
      </View>

      <FlatList
        data={schedules}
        renderItem={renderScheduleItem}
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
        onPress={() => navigation.navigate('TripDetails', { scheduleId: 1 })}
        label="View Details"
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
    color: '#10B981',
  },
  headerDate: {
    color: '#666',
    marginTop: 4,
  },
  listContainer: {
    padding: 16,
    flexGrow: 1,
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
  departureTime: {
    marginBottom: 4,
    fontWeight: '500',
  },
  scheduleDate: {
    color: '#666',
    marginBottom: 4,
  },
  passengersText: {
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
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#10B981',
  },
});

export default ScheduleScreen;
