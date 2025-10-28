import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .models import Schedule, DriverLocation
from django.core.exceptions import ObjectDoesNotExist

User = get_user_model()


class ScheduleConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for real-time schedule updates
    Handles driver location updates, ETA changes, and booking notifications
    """
    
    async def connect(self):
        self.schedule_id = self.scope['url_route']['kwargs']['schedule_id']
        self.schedule_group_name = f'schedule_{self.schedule_id}'
        
        # Join schedule group
        await self.channel_layer.group_add(
            self.schedule_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Send initial schedule data
        schedule_data = await self.get_schedule_data()
        if schedule_data:
            await self.send(text_data=json.dumps({
                'type': 'schedule_data',
                'data': schedule_data
            }))
    
    async def disconnect(self, close_code):
        # Leave schedule group
        await self.channel_layer.group_discard(
            self.schedule_group_name,
            self.channel_name
        )
    
    async def receive(self, text_data):
        try:
            text_data_json = json.loads(text_data)
            message_type = text_data_json.get('type')
            
            if message_type == 'get_location':
                # Send current driver location
                location_data = await self.get_driver_location()
                await self.send(text_data=json.dumps({
                    'type': 'driver_location',
                    'data': location_data
                }))
                
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Invalid JSON'
            }))
    
    # Receive messages from schedule group
    async def driver_location_update(self, event):
        # Send driver location update to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'driver_location_update',
            'data': event['data']
        }))
    
    async def eta_update(self, event):
        # Send ETA update to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'eta_update',
            'data': event['data']
        }))
    
    async def schedule_status_update(self, event):
        # Send schedule status update to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'schedule_status_update',
            'data': event['data']
        }))
    
    @database_sync_to_async
    def get_schedule_data(self):
        """Get current schedule data"""
        try:
            schedule = Schedule.objects.select_related('route', 'vehicle', 'driver').get(id=self.schedule_id)
            return {
                'id': schedule.id,
                'route': {
                    'id': schedule.route.id,
                    'name': schedule.route.name,
                    'origin': schedule.route.origin,
                    'destination': schedule.route.destination
                },
                'vehicle': {
                    'id': schedule.vehicle.id if schedule.vehicle else None,
                    'plate_number': schedule.vehicle.plate_number if schedule.vehicle else None,
                    'capacity': schedule.vehicle.capacity if schedule.vehicle else None
                },
                'driver': {
                    'id': schedule.driver.id if schedule.driver else None,
                    'name': f"{schedule.driver.first_name} {schedule.driver.last_name}" if schedule.driver else None,
                    'phone': schedule.driver.phone if schedule.driver else None
                },
                'departure_time': schedule.departure_time.isoformat(),
                'estimated_arrival_time': schedule.estimated_arrival_time.isoformat(),
                'status': schedule.status,
                'seats_total': schedule.seats_total,
                'seats_booked': schedule.seats_booked,
                'seats_available': schedule.seats_available
            }
        except ObjectDoesNotExist:
            return None
    
    @database_sync_to_async
    def get_driver_location(self):
        """Get current driver location"""
        try:
            schedule = Schedule.objects.select_related('driver').get(id=self.schedule_id)
            if not schedule.driver:
                return None
            
            latest_location = DriverLocation.objects.filter(
                driver=schedule.driver
            ).order_by('-timestamp').first()
            
            if latest_location:
                return {
                    'latitude': latest_location.latitude,
                    'longitude': latest_location.longitude,
                    'bearing': latest_location.bearing,
                    'speed': latest_location.speed,
                    'timestamp': latest_location.timestamp.isoformat()
                }
            return None
        except ObjectDoesNotExist:
            return None


class DriverConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for driver-specific updates
    Handles location reporting and schedule assignments
    """
    
    async def connect(self):
        self.driver_id = self.scope['url_route']['kwargs']['driver_id']
        self.driver_group_name = f'driver_{self.driver_id}'
        
        # Join driver group
        await self.channel_layer.group_add(
            self.driver_group_name,
            self.channel_name
        )
        
        await self.accept()
    
    async def disconnect(self, close_code):
        # Leave driver group
        await self.channel_layer.group_discard(
            self.driver_group_name,
            self.channel_name
        )
    
    async def receive(self, text_data):
        try:
            text_data_json = json.loads(text_data)
            message_type = text_data_json.get('type')
            
            if message_type == 'location_update':
                # Handle location update from driver
                location_data = text_data_json.get('data', {})
                await self.handle_location_update(location_data)
                
            elif message_type == 'status_update':
                # Handle status update from driver
                status_data = text_data_json.get('data', {})
                await self.handle_status_update(status_data)
                
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Invalid JSON'
            }))
    
    async def handle_location_update(self, location_data):
        """Handle location update from driver"""
        latitude = location_data.get('latitude')
        longitude = location_data.get('longitude')
        bearing = location_data.get('bearing')
        speed = location_data.get('speed')
        accuracy = location_data.get('accuracy')
        
        if latitude and longitude:
            # Save location to database
            await self.save_driver_location(
                latitude, longitude, bearing, speed, accuracy
            )
            
            # Broadcast to relevant schedule groups
            await self.broadcast_location_update(location_data)
    
    async def handle_status_update(self, status_data):
        """Handle status update from driver"""
        schedule_id = status_data.get('schedule_id')
        status = status_data.get('status')
        
        if schedule_id and status:
            # Update schedule status
            await self.update_schedule_status(schedule_id, status)
            
            # Broadcast status update
            await self.channel_layer.group_send(
                f'schedule_{schedule_id}',
                {
                    'type': 'schedule_status_update',
                    'data': {
                        'schedule_id': schedule_id,
                        'status': status,
                        'timestamp': status_data.get('timestamp')
                    }
                }
            )
    
    async def broadcast_location_update(self, location_data):
        """Broadcast location update to relevant schedule groups"""
        # Get active schedules for this driver
        active_schedules = await self.get_active_schedules()
        
        for schedule_id in active_schedules:
            await self.channel_layer.group_send(
                f'schedule_{schedule_id}',
                {
                    'type': 'driver_location_update',
                    'data': location_data
                }
            )
    
    @database_sync_to_async
    def save_driver_location(self, latitude, longitude, bearing, speed, accuracy):
        """Save driver location to database"""
        try:
            driver = User.objects.get(id=self.driver_id)
            DriverLocation.objects.create(
                driver=driver,
                latitude=latitude,
                longitude=longitude,
                bearing=bearing,
                speed=speed,
                accuracy=accuracy
            )
        except User.DoesNotExist:
            pass
    
    @database_sync_to_async
    def get_active_schedules(self):
        """Get active schedule IDs for this driver"""
        try:
            driver = User.objects.get(id=self.driver_id)
            return list(
                Schedule.objects.filter(
                    driver=driver,
                    status__in=['SCHEDULED', 'BOARDING', 'DEPARTED']
                ).values_list('id', flat=True)
            )
        except User.DoesNotExist:
            return []
    
    @database_sync_to_async
    def update_schedule_status(self, schedule_id, status):
        """Update schedule status"""
        try:
            schedule = Schedule.objects.get(id=schedule_id, driver_id=self.driver_id)
            schedule.status = status
            schedule.save()
        except Schedule.DoesNotExist:
            pass
    
    # Receive messages from driver group
    async def schedule_assignment(self, event):
        # Send new schedule assignment to driver
        await self.send(text_data=json.dumps({
            'type': 'schedule_assignment',
            'data': event['data']
        }))
    
    async def booking_notification(self, event):
        # Send booking notification to driver
        await self.send(text_data=json.dumps({
            'type': 'booking_notification',
            'data': event['data']
        }))


class UserConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for user-specific updates
    Handles notifications and booking updates
    """
    
    async def connect(self):
        self.user_id = self.scope['url_route']['kwargs']['user_id']
        self.user_group_name = f'user_{self.user_id}'
        
        # Join user group
        await self.channel_layer.group_add(
            self.user_group_name,
            self.channel_name
        )
        
        await self.accept()
    
    async def disconnect(self, close_code):
        # Leave user group
        await self.channel_layer.group_discard(
            self.user_group_name,
            self.channel_name
        )
    
    async def receive(self, text_data):
        try:
            text_data_json = json.loads(text_data)
            message_type = text_data_json.get('type')
            
            if message_type == 'subscribe_to_schedule':
                # Subscribe to schedule updates
                schedule_id = text_data_json.get('schedule_id')
                if schedule_id:
                    await self.subscribe_to_schedule(schedule_id)
                    
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Invalid JSON'
            }))
    
    async def subscribe_to_schedule(self, schedule_id):
        """Subscribe to schedule updates"""
        schedule_group_name = f'schedule_{schedule_id}'
        
        # Join schedule group
        await self.channel_layer.group_add(
            schedule_group_name,
            self.channel_name
        )
        
        await self.send(text_data=json.dumps({
            'type': 'subscription_confirmed',
            'schedule_id': schedule_id
        }))
    
    # Receive messages from user group
    async def notification(self, event):
        # Send notification to user
        await self.send(text_data=json.dumps({
            'type': 'notification',
            'data': event['data']
        }))
    
    async def booking_update(self, event):
        # Send booking update to user
        await self.send(text_data=json.dumps({
            'type': 'booking_update',
            'data': event['data']
        }))
    
    async def payment_update(self, event):
        # Send payment update to user
        await self.send(text_data=json.dumps({
            'type': 'payment_update',
            'data': event['data']
        }))
