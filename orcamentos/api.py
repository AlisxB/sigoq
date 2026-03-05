from rest_framework import viewsets, permissions
from .models import Orcamento, Kit, ItemOrcamento, ConfiguracaoPreco
from .serializers import (
    OrcamentoSerializer, KitSerializer, ItemOrcamentoSerializer, 
    ConfiguracaoPrecoSerializer
)

class OrcamentoViewSet(viewsets.ModelViewSet):
    queryset = Orcamento.objects.all()
    serializer_class = OrcamentoSerializer

    def get_queryset(self):
        # Isolamento de vendedor via API
        if self.request.user.is_superuser:
            return Orcamento.all_objects.all()
        return Orcamento.objects.filter(vendedor=self.request.user)

    def perform_create(self, serializer):
        # Auto-set vendedor no create
        serializer.save(vendedor=self.request.user)

class KitViewSet(viewsets.ModelViewSet):
    queryset = Kit.objects.all()
    serializer_class = KitSerializer

class ItemOrcamentoViewSet(viewsets.ModelViewSet):
    queryset = ItemOrcamento.objects.all()
    serializer_class = ItemOrcamentoSerializer

class ConfiguracaoPrecoViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ConfiguracaoPreco.objects.filter(ativo=True)
    serializer_class = ConfiguracaoPrecoSerializer
