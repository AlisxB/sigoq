from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .api import CategoriaViewSet, ProdutoViewSet

app_name = 'produtos'

router = DefaultRouter()
router.register(r'categorias', CategoriaViewSet)
router.register(r'produtos', ProdutoViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]
