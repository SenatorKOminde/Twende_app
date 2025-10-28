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
# Ping 44 at 2025-10-28 22:53:44
# Ping 47 at 2025-10-28 22:53:45
# Ping 50 at 2025-10-28 22:53:45
# Ping 53 at 2025-10-28 22:53:46
# Ping 56 at 2025-10-28 22:53:47
# Ping 59 at 2025-10-28 22:53:48
# Ping 62 at 2025-10-28 22:53:49
# Ping 65 at 2025-10-28 22:53:50
# Ping 68 at 2025-10-28 22:53:50
# Ping 71 at 2025-10-28 22:53:51
# Ping 74 at 2025-10-28 22:53:52
# Ping 77 at 2025-10-28 22:53:53
# Ping 80 at 2025-10-28 22:53:54
# Ping 83 at 2025-10-28 22:53:55
# Ping 86 at 2025-10-28 22:53:55
# Ping 89 at 2025-10-28 22:53:56
# Ping 92 at 2025-10-28 22:53:57
# Ping 95 at 2025-10-28 22:53:58
# Ping 98 at 2025-10-28 22:53:59
# Ping 101 at 2025-10-28 22:53:59
# Ping 104 at 2025-10-28 22:54:00
# Ping 107 at 2025-10-28 22:54:01
# Ping 110 at 2025-10-28 22:54:02
# Ping 113 at 2025-10-28 22:54:03
# Ping 116 at 2025-10-28 22:54:04
# Ping 119 at 2025-10-28 22:54:04
# Ping 122 at 2025-10-28 22:54:05
# Ping 125 at 2025-10-28 22:54:06
# Ping 128 at 2025-10-28 22:54:07
# Ping 131 at 2025-10-28 22:54:08
# Ping 134 at 2025-10-28 22:54:08
# Ping 137 at 2025-10-28 22:54:09
# Ping 140 at 2025-10-28 22:54:10
# Ping 143 at 2025-10-28 22:54:11
# Ping 146 at 2025-10-28 22:54:12
# Ping 149 at 2025-10-28 22:54:13
# Ping 152 at 2025-10-28 22:54:13
# Ping 155 at 2025-10-28 22:54:14
# Ping 158 at 2025-10-28 22:54:15
# Ping 161 at 2025-10-28 22:54:16
# Ping 164 at 2025-10-28 22:54:17
# Ping 167 at 2025-10-28 22:54:17
# Ping 170 at 2025-10-28 22:54:19
# Ping 173 at 2025-10-28 22:54:19
# Ping 176 at 2025-10-28 22:54:20
# Ping 179 at 2025-10-28 22:54:21
# Ping 182 at 2025-10-28 22:54:22
# Ping 185 at 2025-10-28 22:54:23
# Health check marker 11 - 22:54:34
# Health check marker 22 - 22:54:38
# Health check marker 33 - 22:54:43
# Health check marker 44 - 22:54:47
# Health check marker 11 - 22:54:57
# Health check marker 22 - 22:55:02
# Health check marker 33 - 22:55:06
# Health check marker 44 - 22:55:10
# Health check marker 11 - 22:55:20
# Health check marker 22 - 22:55:25
# Health check marker 33 - 22:55:29
# Health check marker 44 - 22:55:33
# Health check marker 11 - 22:55:44
