from django.urls import path
from .views import (
    HealthCheckView,
    UserRegistrationView,
    UserLoginView,
    UserProfileView,
    ProfileView
)

urlpatterns = [
    path("register/", UserRegistrationView.as_view(), name="user_register"),
    path("login/", UserLoginView.as_view(), name="user_login"),
    path("profile/", UserProfileView.as_view(), name="user_profile"),
    path("profile/extended/", ProfileView.as_view(), name="user_profile_extended"),
]
