from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import KanbanView, OportunidadeUpdateStatusView, OportunidadePDFView
from .api import StatusOportunidadeViewSet, OportunidadeViewSet, MetaMensalViewSet, ArquivoOportunidadeViewSet

router = DefaultRouter()
router.register(r'status', StatusOportunidadeViewSet, basename='status-oportunidade')
router.register(r'oportunidade', OportunidadeViewSet, basename='oportunidade')
router.register(r'metas', MetaMensalViewSet, basename='metas-mensais')
router.register(r'arquivos', ArquivoOportunidadeViewSet, basename='arquivo-oportunidade')

app_name = 'comercial'

urlpatterns = [
    path('kanban/', KanbanView.as_view(), name='kanban'),
    path('api/oportunidade/update-status/', OportunidadeUpdateStatusView.as_view(), name='update_status'),
    path('api/oportunidade/<int:pk>/pdf/', OportunidadePDFView.as_view(), name='proposta_pdf'),
    path('api/', include(router.urls)),
]
