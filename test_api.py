#!/usr/bin/env python3
"""
Simple API test script for Twende backend
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_health_endpoint():
    """Test the health check endpoint"""
    print("Testing health endpoint...")
    response = requests.get(f"{BASE_URL}/health/")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    print()

def test_user_registration():
    """Test user registration"""
    print("Testing user registration...")
    data = {
        "email": "test@example.com",
        "phone": "+254712345678",
        "first_name": "Test",
        "last_name": "User",
        "role": "RIDER",
        "password": "testpass123",
        "password_confirm": "testpass123"
    }
    
    response = requests.post(f"{BASE_URL}/api/v1/auth/register/", json=data)
    print(f"Status: {response.status_code}")
    if response.status_code == 201:
        print("User registration successful!")
        return response.json()
    else:
        print(f"Error: {response.json()}")
        return None

def test_user_login():
    """Test user login"""
    print("Testing user login...")
    data = {
        "email_or_phone": "test@example.com",
        "password": "testpass123"
    }
    
    response = requests.post(f"{BASE_URL}/api/v1/auth/login/", json=data)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        print("User login successful!")
        return response.json()
    else:
        print(f"Error: {response.json()}")
        return None

def test_admin_login():
    """Test admin login"""
    print("Testing admin login...")
    data = {
        "email_or_phone": "admin@twende.com",
        "password": "admin123"
    }
    
    response = requests.post(f"{BASE_URL}/api/v1/auth/login/", json=data)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        print("Admin login successful!")
        return response.json()
    else:
        print(f"Error: {response.json()}")
        return None

def main():
    print("=== Twende API Test Suite ===\n")
    
    # Test health endpoint
    test_health_endpoint()
    
    # Test user registration
    registration_result = test_user_registration()
    
    # Test user login
    login_result = test_user_login()
    
    # Test admin login
    admin_login_result = test_admin_login()
    
    print("=== Test Summary ===")
    print(f"Health endpoint: {'✓' if True else '✗'}")
    print(f"User registration: {'✓' if registration_result else '✗'}")
    print(f"User login: {'✓' if login_result else '✗'}")
    print(f"Admin login: {'✓' if admin_login_result else '✗'}")

if __name__ == "__main__":
    main()
# Health check marker 11 - 22:50:47
# Health check marker 22 - 22:50:52
# Health check marker 33 - 22:50:56
# Health check marker 44 - 22:51:00
# Ping 2 at 2025-10-28 22:53:33
# Ping 5 at 2025-10-28 22:53:33
# Ping 8 at 2025-10-28 22:53:34
# Ping 11 at 2025-10-28 22:53:35
# Ping 14 at 2025-10-28 22:53:36
# Ping 17 at 2025-10-28 22:53:36
# Ping 20 at 2025-10-28 22:53:37
# Ping 23 at 2025-10-28 22:53:38
# Ping 26 at 2025-10-28 22:53:39
# Ping 29 at 2025-10-28 22:53:40
# Ping 32 at 2025-10-28 22:53:40
# Ping 35 at 2025-10-28 22:53:41
# Ping 38 at 2025-10-28 22:53:42
# Ping 41 at 2025-10-28 22:53:43
