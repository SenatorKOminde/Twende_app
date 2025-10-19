from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, Profile


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration
    """
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ('email', 'phone', 'first_name', 'last_name', 'role', 'password', 'password_confirm')
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        
        # Create profile
        Profile.objects.create(user=user)
        
        return user


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for user data
    """
    class Meta:
        model = User
        fields = ('id', 'email', 'phone', 'first_name', 'last_name', 'role', 'is_active', 'is_verified', 'date_joined')
        read_only_fields = ('id', 'is_active', 'is_verified', 'date_joined')


class ProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for user profile
    """
    class Meta:
        model = Profile
        fields = '__all__'
        read_only_fields = ('user', 'created_at', 'updated_at')
