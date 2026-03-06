from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .api import UserViewSet, AuthViewSet

app_name = 'usuarios'

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'auth', AuthViewSet, basename='auth')

urlpatterns = [
    path('api/', include(router.urls)),
]
