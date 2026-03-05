from django.urls import path
from .views import KanbanView, OportunidadeUpdateStatusView

app_name = 'comercial'

urlpatterns = [
    path('kanban/', KanbanView.as_view(), name='kanban'),
    path('api/oportunidade/update-status/', OportunidadeUpdateStatusView.as_view(), name='update_status'),
]
