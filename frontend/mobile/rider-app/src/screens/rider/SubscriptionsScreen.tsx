import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { Text, Card, Button, Chip, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useApi } from '@/shared/api';
import { formatCurrency, formatDate } from '@/shared/utils';
import { SUBSCRIPTION_PLANS } from '@/shared/constants';
import { Subscription, SubscriptionPlan } from '@/shared/types';

const SubscriptionsScreen: React.FC = () => {
  const api = useApi();
  
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        loadCurrentSubscription(),
        loadSubscriptionPlans(),
      ]);
    } catch (error) {
      console.error('Error loading subscription data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCurrentSubscription = async () => {
    try {
      const response = await api.get('/subscriptions/current/');
      setCurrentSubscription(response.data);
    } catch (error) {
      console.error('Error loading current subscription:', error);
    }
  };

  const loadSubscriptionPlans = async () => {
    try {
      const response = await api.get('/subscription-plans/');
      setSubscriptionPlans(response.data.results || []);
    } catch (error) {
      console.error('Error loading subscription plans:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handlePurchasePlan = async (plan: SubscriptionPlan) => {
    try {
      // For now, just show an alert. In production, this would integrate with payment
      Alert.alert(
        'Purchase Subscription',
        `Purchase ${plan.name} for ${formatCurrency(plan.price)}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Purchase',
            onPress: async () => {
              try {
                await api.post('/subscriptions/purchase/', {
                  plan_id: plan.id,
                  payment_method: 'MPESA', // Default to M-Pesa
                });
                Alert.alert('Success', 'Subscription purchased successfully!');
                await loadCurrentSubscription();
              } catch (error: any) {
                Alert.alert('Error', error.message || 'Failed to purchase subscription');
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error purchasing plan:', error);
    }
  };

  const handleCancelSubscription = async () => {
    if (!currentSubscription) return;

    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your current subscription?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.post(`/subscriptions/${currentSubscription.id}/cancel/`);
              Alert.alert('Success', 'Subscription cancelled successfully');
              await loadCurrentSubscription();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to cancel subscription');
            }
          },
        },
      ]
    );
  };

  const renderCurrentSubscription = () => {
    if (!currentSubscription) {
      return (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              No Active Subscription
            </Text>
            <Text variant="bodyMedium" style={styles.cardText}>
              Purchase a subscription to start booking rides
            </Text>
          </Card.Content>
        </Card>
      );
    }

    return (
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.subscriptionHeader}>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Current Subscription
            </Text>
            <Chip
              mode="outlined"
              textStyle={styles.activeChip}
              style={[
                styles.statusChip,
                { backgroundColor: currentSubscription.active ? '#E8F5E8' : '#FFF3CD' }
              ]}
            >
              {currentSubscription.active ? 'Active' : 'Inactive'}
            </Chip>
          </View>
          
          <Text variant="headlineSmall" style={styles.planName}>
            {currentSubscription.plan.name}
          </Text>
          
          <Text variant="bodyMedium" style={styles.ridesRemaining}>
            {currentSubscription.rides_remaining} rides remaining
          </Text>
          
          <Text variant="bodySmall" style={styles.expiryDate}>
            Expires: {formatDate(currentSubscription.end_date)}
          </Text>
          
          {currentSubscription.active && (
            <Button
              mode="outlined"
              onPress={handleCancelSubscription}
              style={styles.cancelButton}
              textColor="#EF4444"
            >
              Cancel Subscription
            </Button>
          )}
        </Card.Content>
      </Card>
    );
  };

  const renderSubscriptionPlan = (plan: SubscriptionPlan) => {
    const isCurrentPlan = currentSubscription?.plan.id === plan.id;
    const isActive = currentSubscription?.active && isCurrentPlan;

    return (
      <Card key={plan.id} style={styles.planCard}>
        <Card.Content>
          <View style={styles.planHeader}>
            <Text variant="titleMedium" style={styles.planTitle}>
              {plan.name}
            </Text>
            {isActive && (
              <Chip mode="outlined" style={styles.currentChip}>
                Current
              </Chip>
            )}
          </View>
          
          <Text variant="headlineMedium" style={styles.planPrice}>
            {formatCurrency(plan.price)}
          </Text>
          
          <Text variant="bodyMedium" style={styles.planDescription}>
            {plan.description}
          </Text>
          
          <View style={styles.planFeatures}>
            <Text variant="bodySmall" style={styles.featureText}>
              • {plan.duration_days} days validity
            </Text>
            <Text variant="bodySmall" style={styles.featureText}>
              • {plan.rides} rides included
            </Text>
            <Text variant="bodySmall" style={styles.featureText}>
              • Unlimited route access
            </Text>
            <Text variant="bodySmall" style={styles.featureText}>
              • Priority booking
            </Text>
          </View>
          
          {!isActive && (
            <Button
              mode="contained"
              onPress={() => handlePurchasePlan(plan)}
              style={styles.purchaseButton}
            >
              Purchase
            </Button>
          )}
        </Card.Content>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.headerTitle}>
          Subscription Plans
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderCurrentSubscription()}
        
        <Divider style={styles.divider} />
        
        <View style={styles.plansSection}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Available Plans
          </Text>
          {subscriptionPlans.map(renderSubscriptionPlan)}
        </View>
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  card: {
    margin: 16,
    elevation: 2,
  },
  cardTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardText: {
    color: '#666',
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusChip: {
    height: 28,
  },
  activeChip: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  planName: {
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 8,
  },
  ridesRemaining: {
    color: '#666',
    marginBottom: 4,
  },
  expiryDate: {
    color: '#999',
    marginBottom: 16,
  },
  cancelButton: {
    alignSelf: 'flex-start',
  },
  divider: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  plansSection: {
    padding: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  planCard: {
    marginBottom: 16,
    elevation: 2,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planTitle: {
    fontWeight: 'bold',
  },
  currentChip: {
    height: 24,
  },
  planPrice: {
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 8,
  },
  planDescription: {
    color: '#666',
    marginBottom: 16,
  },
  planFeatures: {
    marginBottom: 16,
  },
  featureText: {
    color: '#666',
    marginBottom: 4,
  },
  purchaseButton: {
    alignSelf: 'flex-start',
  },
});

export default SubscriptionsScreen;
