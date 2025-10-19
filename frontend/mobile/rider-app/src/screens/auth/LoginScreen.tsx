import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, Card, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { useAuth } from '@/shared/auth';
import { useForm } from '@/shared/hooks';
import { validateEmail, validatePassword } from '@/shared/utils';
import { AuthStackParamList } from '@/navigation/AuthNavigator';

type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;

interface LoginFormData {
  email: string;
  password: string;
}

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { login, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const { values, errors, setValue, setError, validate } = useForm<LoginFormData>({
    email: '',
    password: '',
  });

  const validationRules = {
    email: (value: string) => {
      if (!value) return 'Email is required';
      if (!validateEmail(value)) return 'Please enter a valid email';
      return undefined;
    },
    password: (value: string) => {
      if (!value) return 'Password is required';
      if (value.length < 6) return 'Password must be at least 6 characters';
      return undefined;
    },
  };

  const handleLogin = async () => {
    if (!validate(validationRules)) return;

    try {
      await login({
        email: values.email,
        password: values.password,
      });
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Invalid credentials');
    }
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text variant="headlineLarge" style={styles.title}>
            Welcome to Twende
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Sign in to your account
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

            <TextInput
              label="Password"
              value={values.password}
              onChangeText={(text) => setValue('password', text)}
              error={!!errors.password}
              secureTextEntry={!showPassword}
              autoComplete="password"
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

            <Button
              mode="text"
              onPress={handleForgotPassword}
              style={styles.forgotButton}
            >
              Forgot Password?
            </Button>

            <Button
              mode="contained"
              onPress={handleLogin}
              loading={isLoading}
              disabled={isLoading}
              style={styles.loginButton}
            >
              Sign In
            </Button>

            <Divider style={styles.divider} />

            <Button
              mode="outlined"
              onPress={handleRegister}
              style={styles.registerButton}
            >
              Create Account
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
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  loginButton: {
    marginBottom: 16,
  },
  divider: {
    marginVertical: 16,
  },
  registerButton: {
    marginTop: 8,
  },
});

export default LoginScreen;
