from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/schedule/(?P<schedule_id>\w+)/$', consumers.ScheduleConsumer.as_asgi()),
    re_path(r'ws/driver/(?P<driver_id>\w+)/$', consumers.DriverConsumer.as_asgi()),
    re_path(r'ws/user/(?P<user_id>\w+)/$', consumers.UserConsumer.as_asgi()),
]
