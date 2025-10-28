// WebSocket client for real-time features
import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  WebSocketMessage,
  LocationUpdateMessage,
  BookingUpdateMessage,
  ScheduleUpdateMessage,
} from './types';

// WebSocket Configuration
const WS_BASE_URL = __DEV__ 
  ? 'ws://localhost:8000' 
  : 'wss://api.twende.com';

export class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor() {
    this.connect();
  }

  private async connect() {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const userString = await AsyncStorage.getItem('user');
      
      if (!token || !userString) {
        console.log('No auth token or user found, skipping WebSocket connection');
        return;
      }

      const user = JSON.parse(userString);

      this.socket = io(WS_BASE_URL, {
        auth: {
          token,
        },
        transports: ['websocket'],
        timeout: 20000,
      });

      this.setupEventListeners();
    } catch (error) {
      console.error('WebSocket connection error:', error);
    }
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      this.handleReconnect();
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.handleReconnect();
    });

    // Custom event listeners
    this.socket.on('driver_location_update', (data: LocationUpdateMessage['data']) => {
      this.emit('location_update', data);
    });

    this.socket.on('booking_update', (data: BookingUpdateMessage['data']) => {
      this.emit('booking_update', data);
    });

    this.socket.on('schedule_status_update', (data: ScheduleUpdateMessage['data']) => {
      this.emit('schedule_update', data);
    });

    this.socket.on('notification', (data: any) => {
      this.emit('notification', data);
    });
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      setTimeout(() => {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect();
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  // Public methods
  public subscribeToSchedule(scheduleId: number) {
    if (this.socket?.connected) {
      this.socket.emit('subscribe_to_schedule', { schedule_id: scheduleId });
    }
  }

  public unsubscribeFromSchedule(scheduleId: number) {
    if (this.socket?.connected) {
      this.socket.emit('unsubscribe_from_schedule', { schedule_id: scheduleId });
    }
  }

  public updateDriverLocation(location: {
    latitude: number;
    longitude: number;
    bearing?: number;
    speed?: number;
    accuracy?: number;
  }) {
    if (this.socket?.connected) {
      this.socket.emit('location_update', location);
    }
  }

  public updateDriverStatus(status: {
    schedule_id: number;
    status: string;
    timestamp?: string;
  }) {
    if (this.socket?.connected) {
      this.socket.emit('status_update', status);
    }
  }

  public getLocation(scheduleId: number) {
    if (this.socket?.connected) {
      this.socket.emit('get_location', { schedule_id: scheduleId });
    }
  }

  // Event emitter functionality
  private listeners: { [key: string]: Function[] } = {};

  public on(event: string, callback: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  public off(event: string, callback: Function) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  private emit(event: string, data: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  public isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

// Singleton instance
export const wsService = new WebSocketService();

// React Native specific WebSocket implementation
export class NativeWebSocketService {
  private ws: WebSocket | null = null;
  private url: string = '';
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor() {
    this.connect();
  }

  private async connect() {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const userString = await AsyncStorage.getItem('user');
      
      if (!token || !userString) {
        console.log('No auth token or user found, skipping WebSocket connection');
        return;
      }

      const user = JSON.parse(userString);
      this.url = `${WS_BASE_URL}/ws/user/${user.id}/`;

      this.ws = new WebSocket(this.url, [], {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      this.setupEventListeners();
    } catch (error) {
      console.error('Native WebSocket connection error:', error);
    }
  }

  private setupEventListeners() {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('Native WebSocket connected');
      this.reconnectAttempts = 0;
    };

    this.ws.onclose = (event) => {
      console.log('Native WebSocket disconnected:', event.code, event.reason);
      this.handleReconnect();
    };

    this.ws.onerror = (error) => {
      console.error('Native WebSocket error:', error);
    };

    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
  }

  private handleMessage(message: WebSocketMessage) {
    switch (message.type) {
      case 'driver_location_update':
        this.emit('location_update', message.data);
        break;
      case 'booking_update':
        this.emit('booking_update', message.data);
        break;
      case 'schedule_status_update':
        this.emit('schedule_update', message.data);
        break;
      case 'notification':
        this.emit('notification', message.data);
        break;
      default:
        console.log('Unknown message type:', message.type);
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      setTimeout(() => {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect();
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  public send(message: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  public subscribeToSchedule(scheduleId: number) {
    this.send({
      type: 'subscribe_to_schedule',
      schedule_id: scheduleId,
    });
  }

  public unsubscribeFromSchedule(scheduleId: number) {
    this.send({
      type: 'unsubscribe_from_schedule',
      schedule_id: scheduleId,
    });
  }

  public updateDriverLocation(location: {
    latitude: number;
    longitude: number;
    bearing?: number;
    speed?: number;
    accuracy?: number;
  }) {
    this.send({
      type: 'location_update',
      data: location,
    });
  }

  public updateDriverStatus(status: {
    schedule_id: number;
    status: string;
    timestamp?: string;
  }) {
    this.send({
      type: 'status_update',
      data: status,
    });
  }

  // Event emitter functionality
  private listeners: { [key: string]: Function[] } = {};

  public on(event: string, callback: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  public off(event: string, callback: Function) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  private emit(event: string, data: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  public disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  public isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Export appropriate service based on platform
export const webSocketService = __DEV__ 
  ? new NativeWebSocketService() 
  : new WebSocketService();
