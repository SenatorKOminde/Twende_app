import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { Text, Card, Button, List, Avatar, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { useAuth } from '@/shared/auth';
import { useApi } from '@/shared/api';
import { formatDate } from '@/shared/utils';
import { DriverStackParamList } from '@/navigation/DriverNavigator';
import { User } from '@/shared/types';

type ProfileScreenNavigationProp = StackNavigationProp<DriverStackParamList, 'DriverTabs'>;

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { user, logout, updateUser } = useAuth();
  const api = useApi();
  
  const [userData, setUserData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/auth/profile/');
      setUserData(response.data);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  const handleEditProfile = () => {
    // Navigate to edit profile screen
    // navigation.navigate('EditProfile');
  };

  const handleChangePassword = () => {
    // Navigate to change password screen
    // navigation.navigate('ChangePassword');
  };

  const handleNotificationSettings = () => {
    // Navigate to notification settings screen
    // navigation.navigate('NotificationSettings');
  };

  const handleHelp = () => {
    // Navigate to help screen
    // navigation.navigate('Help');
  };

  const handleAbout = () => {
    // Navigate to about screen
    // navigation.navigate('About');
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.headerTitle}>
          Profile
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* User Info Card */}
        <Card style={styles.userCard}>
          <Card.Content style={styles.userContent}>
            <Avatar.Text
              size={80}
              label={getInitials(user?.first_name || '', user?.last_name || '')}
              style={styles.avatar}
            />
            <View style={styles.userInfo}>
              <Text variant="headlineSmall" style={styles.userName}>
                {user?.first_name} {user?.last_name}
              </Text>
              <Text variant="bodyMedium" style={styles.userEmail}>
                {user?.email}
              </Text>
              <Text variant="bodySmall" style={styles.userPhone}>
                {user?.phone}
              </Text>
              {userData?.date_joined && (
                <Text variant="bodySmall" style={styles.memberSince}>
                  Driver since {formatDate(userData.date_joined)}
                </Text>
              )}
            </View>
          </Card.Content>
        </Card>

        {/* Profile Actions */}
        <Card style={styles.actionsCard}>
          <Card.Content>
            <List.Item
              title="Edit Profile"
              description="Update your personal information"
              left={(props) => <List.Icon {...props} icon="account-edit" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={handleEditProfile}
            />
            <Divider />
            <List.Item
              title="Change Password"
              description="Update your password"
              left={(props) => <List.Icon {...props} icon="lock" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={handleChangePassword}
            />
            <Divider />
            <List.Item
              title="Notification Settings"
              description="Manage your notification preferences"
              left={(props) => <List.Icon {...props} icon="bell" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={handleNotificationSettings}
            />
          </Card.Content>
        </Card>

        {/* App Info */}
        <Card style={styles.infoCard}>
          <Card.Content>
            <List.Item
              title="Help & Support"
              description="Get help and contact support"
              left={(props) => <List.Icon {...props} icon="help-circle" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={handleHelp}
            />
            <Divider />
            <List.Item
              title="About Twende"
              description="App version and information"
              left={(props) => <List.Icon {...props} icon="information" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={handleAbout}
            />
          </Card.Content>
        </Card>

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <Button
            mode="outlined"
            onPress={handleLogout}
            style={styles.logoutButton}
            textColor="#EF4444"
            icon="logout"
          >
            Logout
          </Button>
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
    color: '#10B981',
  },
  scrollView: {
    flex: 1,
  },
  userCard: {
    margin: 16,
    elevation: 2,
  },
  userContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: '#10B981',
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    color: '#666',
    marginBottom: 2,
  },
  userPhone: {
    color: '#666',
    marginBottom: 4,
  },
  memberSince: {
    color: '#999',
    fontSize: 12,
  },
  actionsCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  infoCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  logoutSection: {
    padding: 16,
    paddingBottom: 32,
  },
  logoutButton: {
    borderColor: '#EF4444',
  },
});

export default ProfileScreen;
