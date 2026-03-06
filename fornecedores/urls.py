from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .api import FornecedorViewSet

app_name = 'fornecedores'

router = DefaultRouter()
router.register(r'fornecedores', FornecedorViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]
