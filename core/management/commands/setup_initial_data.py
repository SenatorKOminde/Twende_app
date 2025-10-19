from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from core.models import SubscriptionPlan, Route, Vehicle
from django.utils import timezone
from datetime import timedelta

User = get_user_model()


class Command(BaseCommand):
    help = 'Set up initial data for the Twende platform'

    def handle(self, *args, **options):
        self.stdout.write('Setting up initial data...')
        
        # Create admin user
        self.create_admin_user()
        
        # Create subscription plans
        self.create_subscription_plans()
        
        # Create sample routes
        self.create_sample_routes()
        
        # Create sample vehicles
        self.create_sample_vehicles()
        
        self.stdout.write(
            self.style.SUCCESS('Successfully set up initial data!')
        )

    def create_admin_user(self):
        """Create admin user if it doesn't exist"""
        if not User.objects.filter(email='admin@twende.com').exists():
            admin_user = User.objects.create(
                email='admin@twende.com',
                phone='+254700000000',
                first_name='Admin',
                last_name='User',
                role='ADMIN'
            )
            admin_user.set_password('admin123')
            admin_user.is_staff = True
            admin_user.is_superuser = True
            admin_user.is_verified = True
            admin_user.save()
            
            self.stdout.write('Created admin user: admin@twende.com / admin123')

    def create_subscription_plans(self):
        """Create subscription plans"""
        plans = [
            {
                'code': 'DAILY',
                'name': 'Daily Pass',
                'plan_type': 'DAILY',
                'price': 40000,  # KSh 400 in cents
                'duration_days': 1,
                'rides_limit': None,  # Unlimited
                'allow_rollover': False,
            },
            {
                'code': 'WEEKLY',
                'name': 'Weekly Pass',
                'plan_type': 'WEEKLY',
                'price': 200000,  # KSh 2,000 in cents
                'duration_days': 7,
                'rides_limit': None,  # Unlimited
                'allow_rollover': True,
            },
            {
                'code': 'MONTHLY',
                'name': 'Monthly Pass',
                'plan_type': 'MONTHLY',
                'price': 800000,  # KSh 8,000 in cents
                'duration_days': 30,
                'rides_limit': None,  # Unlimited
                'allow_rollover': True,
            },
        ]
        
        for plan_data in plans:
            plan, created = SubscriptionPlan.objects.get_or_create(
                code=plan_data['code'],
                defaults=plan_data
            )
            if created:
                self.stdout.write(f'Created subscription plan: {plan.name}')

    def create_sample_routes(self):
        """Create sample routes"""
        routes = [
            {
                'name': 'CBD to Upper Hill',
                'origin': 'Nairobi CBD',
                'destination': 'Upper Hill',
                'distance_km': 8.5,
                'estimated_duration_mins': 25,
                'base_fare': 50.00,
            },
            {
                'name': 'CBD to Westlands',
                'origin': 'Nairobi CBD',
                'destination': 'Westlands',
                'distance_km': 12.0,
                'estimated_duration_mins': 35,
                'base_fare': 80.00,
            },
            {
                'name': 'CBD to South B',
                'origin': 'Nairobi CBD',
                'destination': 'South B',
                'distance_km': 15.0,
                'estimated_duration_mins': 45,
                'base_fare': 100.00,
            },
            {
                'name': 'CBD to Kilimani',
                'origin': 'Nairobi CBD',
                'destination': 'Kilimani',
                'distance_km': 10.0,
                'estimated_duration_mins': 30,
                'base_fare': 70.00,
            },
        ]
        
        for route_data in routes:
            route, created = Route.objects.get_or_create(
                name=route_data['name'],
                defaults=route_data
            )
            if created:
                self.stdout.write(f'Created route: {route.name}')

    def create_sample_vehicles(self):
        """Create sample vehicles"""
        vehicles = [
            {
                'plate_number': 'KCB 123A',
                'vehicle_type': 'BUS',
                'capacity': 50,
                'make': 'Scania',
                'model': 'K270',
                'year': 2022,
                'color': 'White',
                'owner': 'Twende Fleet',
                'owner_contact': '+254700000001',
            },
            {
                'plate_number': 'KCB 124B',
                'vehicle_type': 'BUS',
                'capacity': 50,
                'make': 'Volvo',
                'model': 'B8R',
                'year': 2021,
                'color': 'Blue',
                'owner': 'Twende Fleet',
                'owner_contact': '+254700000001',
            },
            {
                'plate_number': 'KCB 125C',
                'vehicle_type': 'MINIBUS',
                'capacity': 25,
                'make': 'Toyota',
                'model': 'Hiace',
                'year': 2023,
                'color': 'Green',
                'owner': 'Partner Fleet',
                'owner_contact': '+254700000002',
            },
        ]
        
        for vehicle_data in vehicles:
            vehicle, created = Vehicle.objects.get_or_create(
                plate_number=vehicle_data['plate_number'],
                defaults=vehicle_data
            )
            if created:
                self.stdout.write(f'Created vehicle: {vehicle.plate_number}')
