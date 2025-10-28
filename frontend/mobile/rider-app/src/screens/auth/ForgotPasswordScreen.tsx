import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, Card } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { useApi } from '@/shared/api';
import { useForm } from '@/shared/hooks';
import { validateEmail } from '@/shared/utils';
import { AuthStackParamList } from '@/navigation/AuthNavigator';

type ForgotPasswordScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

interface ForgotPasswordFormData {
  email: string;
}

const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();
  const api = useApi();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const { values, errors, setValue, validate } = useForm<ForgotPasswordFormData>({
    email: '',
  });

  const validationRules = {
    email: (value: string) => {
      if (!value) return 'Email is required';
      if (!validateEmail(value)) return 'Please enter a valid email';
      return undefined;
    },
  };

  const handleForgotPassword = async () => {
    if (!validate(validationRules)) return;

    try {
      setIsLoading(true);
      await api.post('/auth/forgot-password/', { email: values.email });
      setEmailSent(true);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };

  if (emailSent) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <Text variant="headlineSmall" style={styles.title}>
                Check Your Email
              </Text>
              <Text variant="bodyLarge" style={styles.message}>
                We've sent a password reset link to {values.email}
              </Text>
              <Button
                mode="contained"
                onPress={handleBackToLogin}
                style={styles.button}
              >
                Back to Login
              </Button>
            </Card.Content>
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text variant="headlineLarge" style={styles.title}>
            Forgot Password
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Enter your email to receive a reset link
          </Text>
        </View>

        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <TextInput
              label="Email"
              value={values.email}
              onChangeText={(text) => setValue('email', text)}
              error={!!errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              style={styles.input}
            />
            {errors.email && (
              <Text variant="bodySmall" style={styles.errorText}>
                {errors.email}
              </Text>
            )}

            <Button
              mode="contained"
              onPress={handleForgotPassword}
              loading={isLoading}
              disabled={isLoading}
              style={styles.button}
            >
              Send Reset Link
            </Button>

            <Button
              mode="text"
              onPress={handleBackToLogin}
              style={styles.backButton}
            >
              Back to Login
            </Button>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 8,
  },
  subtitle: {
    color: '#666',
    textAlign: 'center',
  },
  card: {
    elevation: 4,
  },
  cardContent: {
    padding: 24,
    alignItems: 'center',
  },
  input: {
    marginBottom: 8,
    width: '100%',
  },
  errorText: {
    color: '#EF4444',
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
    marginBottom: 16,
    width: '100%',
  },
  backButton: {
    marginTop: 8,
  },
  message: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
  },
});

export default ForgotPasswordScreen;
