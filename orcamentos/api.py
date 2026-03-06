from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
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
        user = self.request.user
        if user.is_superuser:
            return Orcamento.all_objects.all()
        if not user.is_authenticated:
            return Orcamento.objects.none()
        return Orcamento.objects.filter(vendedor=user)

    def perform_create(self, serializer):
        # Auto-set vendedor no create
        if self.request.user.is_authenticated:
            serializer.save(vendedor=self.request.user)
        else:
            serializer.save()

    @action(detail=True, methods=['post'])
    def revisao(self, request, pk=None):
        orcamento = self.get_object()
        new_orc = orcamento.duplicate()
        serializer = self.get_serializer(new_orc)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class KitViewSet(viewsets.ModelViewSet):
    queryset = Kit.objects.all()
    serializer_class = KitSerializer

class ItemOrcamentoViewSet(viewsets.ModelViewSet):
    queryset = ItemOrcamento.objects.all()
    serializer_class = ItemOrcamentoSerializer

class ConfiguracaoPrecoViewSet(viewsets.ModelViewSet):
    queryset = ConfiguracaoPreco.objects.filter(ativo=True)
    serializer_class = ConfiguracaoPrecoSerializer
