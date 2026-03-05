from django.urls import path
from .views import OrcamentoPDFView

app_name = 'orcamentos'

urlpatterns = [
    path('pdf/<int:pk>/', OrcamentoPDFView.as_view(), name='gerar_pdf'),
]
