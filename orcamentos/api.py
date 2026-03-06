from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Avg, Count
from .models import Orcamento, Kit, ItemOrcamento, ConfiguracaoPreco
from .serializers import (
    OrcamentoSerializer, KitSerializer, ItemOrcamentoSerializer, 
    ConfiguracaoPrecoSerializer
)

class OrcamentoViewSet(viewsets.ModelViewSet):
    queryset = Orcamento.objects.all().select_related('cliente', 'vendedor', 'oportunidade').prefetch_related('kits__itens')
    serializer_class = OrcamentoSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Orcamento.objects.none()

        # Usuários que vêem tudo: ADMIN, GERENTE e ORCAMENTISTA
        permite_tudo = user.is_superuser or (
            hasattr(user, 'perfil') and 
            user.perfil.cargo in ['ADMIN', 'GERENTE', 'ORCAMENTISTA']
        )
        
        qs = self.queryset
        if not permite_tudo:
            qs = qs.filter(vendedor=user)
            
        return qs.order_by('-numero', '-revisao')

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

    @action(detail=False, methods=['get'])
    def analytics(self, request):
        """
        Estatísticas de performance financeira para o Dashboard.
        Inclui cálculo de meta mensal real.
        """
        from django.utils import timezone
        from comercial.models import MetaMensal
        from django.db.models import Sum
        
        now = timezone.now()
        qs = self.get_queryset()
        
        # 1. Margem Média
        margem = qs.filter(status__in=['ENVIADO', 'APROVADO']).aggregate(Avg('margem_contrib'))
        
        # 2. Mix de Categorias (Aprovados)
        categorias = ItemOrcamento.objects.filter(
            kit__orcamento__in=qs.filter(status='APROVADO')
        ).values('produto__categoria__nome').annotate(
            total=Sum('quantidade')
        ).order_by('-total')

        # 3. Cálculo de Meta Mensal
        # Soma de vendas aprovadas no mês atual
        vendas_mes = qs.filter(
            status='APROVADO',
            atualizado_em__month=now.month,
            atualizado_em__year=now.year
        ).aggregate(total=Sum('valor_total'))['total'] or 0

        # Busca a meta cadastrada (Tenta meta do vendedor, se não houver, busca global)
        meta_obj = MetaMensal.objects.filter(mes=now.month, ano=now.year, vendedor=request.user).first()
        if not meta_obj:
            meta_obj = MetaMensal.objects.filter(mes=now.month, ano=now.year, vendedor__isnull=True).first()
        
        valor_meta = meta_obj.valor_meta if meta_obj else 0
        percentual_atingimento = (float(vendas_mes) / float(valor_meta) * 100) if valor_meta > 0 else 0

        return Response({
            'margem_media': margem['margem_contrib__avg'] or 0,
            'categorias': list(categorias),
            'meta': {
                'valor_venda_mes': float(vendas_mes),
                'valor_meta_configurada': float(valor_meta),
                'percentual_atingimento': round(percentual_atingimento, 1)
            }
        })

class KitViewSet(viewsets.ModelViewSet):
    queryset = Kit.objects.all()
    serializer_class = KitSerializer

class ItemOrcamentoViewSet(viewsets.ModelViewSet):
    queryset = ItemOrcamento.objects.all()
    serializer_class = ItemOrcamentoSerializer

class ConfiguracaoPrecoViewSet(viewsets.ModelViewSet):
    queryset = ConfiguracaoPreco.objects.filter(ativo=True)
    serializer_class = ConfiguracaoPrecoSerializer
