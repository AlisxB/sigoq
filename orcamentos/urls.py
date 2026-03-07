from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OrcamentoPDFView
from .api import OrcamentoViewSet, KitViewSet, ItemOrcamentoViewSet, ConfiguracaoPrecoViewSet

app_name = 'orcamentos'

router = DefaultRouter()
router.register(r'orcamentos', OrcamentoViewSet, basename='orcamento')
router.register(r'kits', KitViewSet, basename='kit')
router.register(r'itens', ItemOrcamentoViewSet, basename='item')
router.register(r'config-preco', ConfiguracaoPrecoViewSet, basename='config-preco')

urlpatterns = [
    path('api/', include(router.urls)),
    path('pdf/<int:pk>/', OrcamentoPDFView.as_view(), name='gerar_pdf'),
]
