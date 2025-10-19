import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, Card, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { useAuth } from '@/shared/auth';
import { useForm } from '@/shared/hooks';
import { validateEmail, validatePassword, validatePhoneNumber } from '@/shared/utils';
import { AuthStackParamList } from '@/navigation/AuthNavigator';

type RegisterScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Register'>;

interface RegisterFormData {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  password: string;
  passwordConfirm: string;
  licenseNumber: string;
}

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const { register, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const { values, errors, setValue, setError, validate } = useForm<RegisterFormData>({
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    password: '',
    passwordConfirm: '',
    licenseNumber: '',
  });

  const validationRules = {
    email: (value: string) => {
      if (!value) return 'Email is required';
      if (!validateEmail(value)) return 'Please enter a valid email';
      return undefined;
    },
    phone: (value: string) => {
      if (!value) return 'Phone number is required';
      if (!validatePhoneNumber(value)) return 'Please enter a valid phone number';
      return undefined;
    },
    firstName: (value: string) => {
      if (!value) return 'First name is required';
      if (value.length < 2) return 'First name must be at least 2 characters';
      return undefined;
    },
    lastName: (value: string) => {
      if (!value) return 'Last name is required';
      if (value.length < 2) return 'Last name must be at least 2 characters';
      return undefined;
    },
    licenseNumber: (value: string) => {
      if (!value) return 'License number is required';
      if (value.length < 5) return 'License number must be at least 5 characters';
      return undefined;
    },
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

  const handleRegister = async () => {
    if (!validate(validationRules)) return;

    try {
      await register({
        email: values.email,
        phone: values.phone,
        first_name: values.firstName,
        last_name: values.lastName,
        password: values.password,
        role: 'DRIVER',
        license_number: values.licenseNumber,
      });
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'Failed to create account');
    }
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text variant="headlineLarge" style={styles.title}>
            Join as Driver
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Create your driver account
          </Text>
        </View>

        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <TextInput
              label="First Name"
              value={values.firstName}
              onChangeText={(text) => setValue('firstName', text)}
              error={!!errors.firstName}
              autoCapitalize="words"
              autoComplete="given-name"
              style={styles.input}
            />
            {errors.firstName && (
              <Text variant="bodySmall" style={styles.errorText}>
                {errors.firstName}
              </Text>
            )}

            <TextInput
              label="Last Name"
              value={values.lastName}
              onChangeText={(text) => setValue('lastName', text)}
              error={!!errors.lastName}
              autoCapitalize="words"
              autoComplete="family-name"
              style={styles.input}
            />
            {errors.lastName && (
              <Text variant="bodySmall" style={styles.errorText}>
                {errors.lastName}
              </Text>
            )}

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

            <TextInput
              label="Phone Number"
              value={values.phone}
              onChangeText={(text) => setValue('phone', text)}
              error={!!errors.phone}
              keyboardType="phone-pad"
              autoComplete="tel"
              style={styles.input}
            />
            {errors.phone && (
              <Text variant="bodySmall" style={styles.errorText}>
                {errors.phone}
              </Text>
            )}

            <TextInput
              label="License Number"
              value={values.licenseNumber}
              onChangeText={(text) => setValue('licenseNumber', text)}
              error={!!errors.licenseNumber}
              autoCapitalize="characters"
              style={styles.input}
            />
            {errors.licenseNumber && (
              <Text variant="bodySmall" style={styles.errorText}>
                {errors.licenseNumber}
              </Text>
            )}

            <TextInput
              label="Password"
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
              label="Confirm Password"
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
              onPress={handleRegister}
              loading={isLoading}
              disabled={isLoading}
              style={styles.registerButton}
            >
              Create Driver Account
            </Button>

            <Divider style={styles.divider} />

            <Button
              mode="outlined"
              onPress={handleLogin}
              style={styles.loginButton}
            >
              Already have an account? Sign In
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
    color: '#10B981',
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
  registerButton: {
    marginTop: 16,
    marginBottom: 16,
  },
  divider: {
    marginVertical: 16,
  },
  loginButton: {
    marginTop: 8,
  },
});

export default RegisterScreen;
