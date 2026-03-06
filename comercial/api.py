from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Count
from .models import StatusOportunidade, Oportunidade
from .serializers import StatusOportunidadeSerializer, OportunidadeSerializer

class StatusOportunidadeViewSet(viewsets.ModelViewSet):
    queryset = StatusOportunidade.objects.all()
    serializer_class = StatusOportunidadeSerializer

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
        Retorna dados agregados para o Funil de Vendas (ApexCharts).
        Respeita os filtros de segurança do get_queryset().
        """
        qs = self.get_queryset()
        
        funil = qs.values(
            'status__id', 
            'status__nome', 
            'status__ordem', 
            'status__cor'
        ).annotate(
            total=Sum('valor_estimado'),
            quantidade=Count('id')
        ).order_by('status__ordem')
        
        return Response(list(funil))
