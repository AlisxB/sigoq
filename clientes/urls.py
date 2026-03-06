from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .api import ClienteViewSet

app_name = 'clientes'

router = DefaultRouter()
router.register(r'clientes', ClienteViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]
