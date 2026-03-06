from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Count
from .models import StatusOportunidade, Oportunidade, MetaMensal
from .serializers import (
    StatusOportunidadeSerializer, 
    OportunidadeSerializer, 
    MetaMensalSerializer
)

class StatusOportunidadeViewSet(viewsets.ModelViewSet):
    queryset = StatusOportunidade.objects.all()
    serializer_class = StatusOportunidadeSerializer

class MetaMensalViewSet(viewsets.ModelViewSet):
    queryset = MetaMensal.objects.all()
    serializer_class = MetaMensalSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['ano', 'mes', 'vendedor']

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return MetaMensal.objects.none()
        
        # Admins e Gerentes vêem todas as metas, vendedores vêem apenas as suas ou globais
        is_admin = user.is_superuser or (
            hasattr(user, 'perfil') and user.perfil.cargo in ['ADMIN', 'GERENTE']
        )
        
        if is_admin:
            return MetaMensal.objects.all().order_by('-ano', '-mes')
        
        from django.db.models import Q
        return MetaMensal.objects.filter(Q(vendedor=user) | Q(vendedor__isnull=True)).order_by('-ano', '-mes')

class OportunidadeViewSet(viewsets.ModelViewSet):
    queryset = Oportunidade.objects.all().select_related('cliente', 'status', 'vendedor')
    serializer_class = OportunidadeSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Oportunidade.objects.none()
            
        # Usuários que vêem tudo: ADMIN, GERENTE e ORCAMENTISTA
        permite_tudo = user.is_superuser or (
            hasattr(user, 'perfil') and 
            user.perfil.cargo in ['ADMIN', 'GERENTE', 'ORCAMENTISTA']
        )
        
        qs = self.queryset
        if not permite_tudo:
            qs = qs.filter(vendedor=user)
            
        return qs.order_by('-numero')

    def perform_create(self, serializer):
        if self.request.user.is_authenticated:
            serializer.save(vendedor=self.request.user)
        else:
            serializer.save()

    @action(detail=False, methods=['get'])
    def estatisticas(self, request):
        """
        Retorna dados agregados para o Funil de Vendas (ApexCharts/Recharts).
        Garante que TODOS os status apareçam, mesmo os zerados.
        """
        # Filtra oportunidades baseadas nas permissões do usuário
        oportunidades_qs = self.get_queryset()
        
        # Busca todos os status disponíveis no banco
        todos_status = StatusOportunidade.objects.all().order_by('ordem')
        
        funil = []
        for s in todos_status:
            # Filtra as oportunidades deste status específico dentro da query permitida
            ops_do_status = oportunidades_qs.filter(status=s)
            total_valor = ops_do_status.aggregate(Sum('valor_estimado'))['valor_estimado__sum'] or 0
            quantidade = ops_do_status.count()
            
            funil.append({
                'status__id': s.id,
                'status__nome': s.nome,
                'status__ordem': s.ordem,
                'status__cor': s.cor,
                'total': float(total_valor),
                'quantidade': quantidade
            })
        
        return Response(funil)
