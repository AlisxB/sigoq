from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .api import UserViewSet

app_name = 'usuarios'

router = DefaultRouter()
router.register(r'users', UserViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]
