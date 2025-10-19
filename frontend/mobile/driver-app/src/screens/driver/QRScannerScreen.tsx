import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RNCamera } from 'react-native-camera';

import { useApi } from '@/shared/api';
import { parseQRCodeData } from '@/shared/utils';
import { DriverStackParamList } from '@/navigation/DriverNavigator';

type QRScannerScreenNavigationProp = StackNavigationProp<DriverStackParamList, 'QRScanner'>;
type QRScannerScreenRouteProp = RouteProp<DriverStackParamList, 'QRScanner'>;

const QRScannerScreen: React.FC = () => {
  const navigation = useNavigation<QRScannerScreenNavigationProp>();
  const route = useRoute<QRScannerScreenRouteProp>();
  const api = useApi();
  
  const [isScanning, setIsScanning] = useState(true);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const { scheduleId } = route.params;

  useEffect(() => {
    checkCameraPermission();
  }, []);

  const checkCameraPermission = async () => {
    try {
      const permission = await RNCamera.requestCameraPermission();
      setHasPermission(permission === 'authorized');
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      setHasPermission(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleQRCodeRead = async (event: any) => {
    if (!isScanning) return;

    setIsScanning(false);
    
    try {
      const qrData = parseQRCodeData(event.data);
      
      if (!qrData || !qrData.booking_id) {
        Alert.alert('Invalid QR Code', 'Please scan a valid Twende boarding pass');
        setIsScanning(true);
        return;
      }

      // Verify and check in the passenger
      const response = await api.post(`/driver/bookings/${qrData.booking_id}/checkin/`, {
        qr_code: qrData.qr_code,
        schedule_id: scheduleId,
      });

      Alert.alert(
        'Check-in Successful',
        'Passenger has been checked in successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              setIsScanning(true);
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        'Check-in Failed',
        error.message || 'Failed to check in passenger',
        [
          {
            text: 'Try Again',
            onPress: () => {
              setIsScanning(true);
            },
          },
        ]
      );
    }
  };

  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text>Requesting camera permission...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>
            Camera permission is required to scan QR codes
          </Text>
          <Button mode="contained" onPress={checkCameraPermission}>
            Grant Permission
          </Button>
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
          Scan QR Code
        </Text>
      </View>

      <View style={styles.cameraContainer}>
        <RNCamera
          style={styles.camera}
          type={RNCamera.Constants.Type.back}
          flashMode={RNCamera.Constants.FlashMode.auto}
          onBarCodeRead={handleQRCodeRead}
          barCodeTypes={[RNCamera.Constants.BarCodeType.qr]}
        >
          <View style={styles.overlay}>
            <View style={styles.scanArea}>
              <View style={styles.corner} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
          </View>
        </RNCamera>
      </View>

      <Card style={styles.instructionsCard}>
        <Card.Content>
          <Text variant="titleSmall" style={styles.instructionsTitle}>
            Instructions
          </Text>
          <Text variant="bodySmall" style={styles.instructionText}>
            • Position the QR code within the frame
          </Text>
          <Text variant="bodySmall" style={styles.instructionText}>
            • Ensure good lighting for better scanning
          </Text>
          <Text variant="bodySmall" style={styles.instructionText}>
            • Hold the phone steady while scanning
          </Text>
        </Card.Content>
      </Card>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionText: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  headerTitle: {
    marginLeft: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#10B981',
    borderWidth: 3,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    top: 0,
    left: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    left: 'auto',
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    top: 'auto',
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderTopWidth: 0,
    borderRightWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    top: 'auto',
    left: 'auto',
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  instructionsCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    margin: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  instructionsTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  instructionText: {
    color: '#666',
    marginBottom: 4,
  },
});

export default QRScannerScreen;
