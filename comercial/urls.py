from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import KanbanView, OportunidadeUpdateStatusView, OportunidadePDFView
from .api import StatusOportunidadeViewSet, OportunidadeViewSet

router = DefaultRouter()
router.register(r'status', StatusOportunidadeViewSet)
router.register(r'oportunidades', OportunidadeViewSet)

app_name = 'comercial'

urlpatterns = [
    path('kanban/', KanbanView.as_view(), name='kanban'),
    path('api/oportunidade/update-status/', OportunidadeUpdateStatusView.as_view(), name='update_status'),
    path('api/oportunidade/<int:pk>/pdf/', OportunidadePDFView.as_view(), name='proposta_pdf'),
    path('api/', include(router.urls)),
]
