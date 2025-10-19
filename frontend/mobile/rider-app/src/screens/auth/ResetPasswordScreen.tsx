import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, Card } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { useApi } from '@/shared/api';
import { useForm } from '@/shared/hooks';
import { validatePassword } from '@/shared/utils';
import { AuthStackParamList } from '@/navigation/AuthNavigator';

type ResetPasswordScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'ResetPassword'>;
type ResetPasswordScreenRouteProp = RouteProp<AuthStackParamList, 'ResetPassword'>;

interface ResetPasswordFormData {
  password: string;
  passwordConfirm: string;
}

const ResetPasswordScreen: React.FC = () => {
  const navigation = useNavigation<ResetPasswordScreenNavigationProp>();
  const route = useRoute<ResetPasswordScreenRouteProp>();
  const api = useApi();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const { values, errors, setValue, validate } = useForm<ResetPasswordFormData>({
    password: '',
    passwordConfirm: '',
  });

  const validationRules = {
    password: (value: string) => {
      if (!value) return 'Password is required';
      const passwordValidation = validatePassword(value);
      if (!passwordValidation.isValid) {
        return passwordValidation.errors[0];
      }
      return undefined;
    },
    passwordConfirm: (value: string) => {
      if (!value) return 'Please confirm your password';
      if (value !== values.password) return 'Passwords do not match';
      return undefined;
    },
  };

  const handleResetPassword = async () => {
    if (!validate(validationRules)) return;

    try {
      setIsLoading(true);
      await api.post('/auth/reset-password/', {
        token: route.params.token,
        password: values.password,
      });
      
      Alert.alert(
        'Success',
        'Your password has been reset successfully. Please log in with your new password.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text variant="headlineLarge" style={styles.title}>
            Reset Password
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Enter your new password
          </Text>
        </View>

        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <TextInput
              label="New Password"
              value={values.password}
              onChangeText={(text) => setValue('password', text)}
              error={!!errors.password}
              secureTextEntry={!showPassword}
              autoComplete="new-password"
              right={
                <TextInput.Icon
                  icon={showPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
              style={styles.input}
            />
            {errors.password && (
              <Text variant="bodySmall" style={styles.errorText}>
                {errors.password}
              </Text>
            )}

            <TextInput
              label="Confirm New Password"
              value={values.passwordConfirm}
              onChangeText={(text) => setValue('passwordConfirm', text)}
              error={!!errors.passwordConfirm}
              secureTextEntry={!showPasswordConfirm}
              autoComplete="new-password"
              right={
                <TextInput.Icon
                  icon={showPasswordConfirm ? 'eye-off' : 'eye'}
                  onPress={() => setShowPasswordConfirm(!showPasswordConfirm)}
                />
              }
              style={styles.input}
            />
            {errors.passwordConfirm && (
              <Text variant="bodySmall" style={styles.errorText}>
                {errors.passwordConfirm}
              </Text>
            )}

            <Button
              mode="contained"
              onPress={handleResetPassword}
              loading={isLoading}
              disabled={isLoading}
              style={styles.button}
            >
              Reset Password
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
  },
  input: {
    marginBottom: 8,
  },
  errorText: {
    color: '#EF4444',
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
    marginBottom: 16,
  },
  backButton: {
    marginTop: 8,
  },
});

export default ResetPasswordScreen;
