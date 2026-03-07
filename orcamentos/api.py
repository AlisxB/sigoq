from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Avg, Count, Sum
from .models import Orcamento, Kit, ItemOrcamento, ConfiguracaoPreco
from .serializers import (
    OrcamentoSerializer, KitSerializer, ItemOrcamentoSerializer, 
    ConfiguracaoPrecoSerializer
)
from .services import PricingService

class OrcamentoViewSet(viewsets.ModelViewSet):
    queryset = Orcamento.objects.all().select_related('cliente', 'vendedor', 'oportunidade').prefetch_related('kits__itens')
    serializer_class = OrcamentoSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Orcamento.objects.none()

        is_privileged = user.is_superuser or user.is_staff or (
            hasattr(user, 'perfil') and 
            user.perfil.cargo in ['ADMIN', 'GERENTE', 'ORCAMENTISTA']
        )
        
        # Usamos Orcamento.objects diretamente para garantir atualização do queryset
        qs = Orcamento.objects.all().select_related('cliente', 'vendedor', 'oportunidade').prefetch_related('kits__itens')
        
        if not is_privileged:
            # Vendedores comuns vêem apenas seus próprios orçamentos
            qs = qs.filter(vendedor=user)
            
        return qs.order_by('-numero', '-revisao')

    def perform_create(self, serializer):
        orcamento = serializer.save(vendedor=self.request.user if self.request.user.is_authenticated else None)
        # Inicializa cálculos (se houver kits/itens via nested write)
        PricingService.recalculate_orcamento(orcamento)

    def perform_update(self, serializer):
        orcamento = serializer.save()
        PricingService.recalculate_orcamento(orcamento)

    @action(detail=True, methods=['post'])
    def revisao(self, request, pk=None):
        orcamento = self.get_object()
        new_orc = PricingService.clone_revision(orcamento)
        serializer = self.get_serializer(new_orc)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def analytics(self, request):
        """Estatísticas financeiras protegidas por escopo de vendedor."""
        from django.utils import timezone
        from comercial.models import MetaMensal
        
        try:
            now = timezone.now()
            qs = self.get_queryset()
            
            margem_data = qs.filter(status__in=['ENVIADO', 'APROVADO']).aggregate(avg=Avg('margem_contrib'))
            margem_media = float(margem_data.get('avg') or 0)
            
            categorias_raw = ItemOrcamento.objects.filter(
                kit__orcamento__in=qs.filter(status='APROVADO')
            ).values('produto__categoria__nome').annotate(
                total=Sum('quantidade')
            ).order_by('-total')
            
            categorias = []
            for item in categorias_raw:
                categorias.append({
                    'produto__categoria__nome': item['produto__categoria__nome'] or 'Indefinido',
                    'total': float(item['total'] or 0)
                })

            vendas_mes_data = qs.filter(
                status='APROVADO',
                atualizado_em__month=now.month,
                atualizado_em__year=now.year
            ).aggregate(total=Sum('valor_total'))
            vendas_mes = float(vendas_mes_data.get('total') or 0)

            meta_obj = MetaMensal.objects.filter(mes=now.month, ano=now.year, vendedor=request.user).first()
            if not meta_obj:
                meta_obj = MetaMensal.objects.filter(mes=now.month, ano=now.year, vendedor__isnull=True).first()
            
            valor_meta = float(meta_obj.valor_meta if meta_obj else 0)
            percentual_atingimento = (vendas_mes / valor_meta * 100) if valor_meta > 0 else 0

            return Response({
                'margem_media': round(margem_media, 4),
                'categorias': categorias,
                'meta': {
                    'valor_venda_mes': round(vendas_mes, 2),
                    'valor_meta_configurada': round(valor_meta, 2),
                    'percentual_atingimento': round(percentual_atingimento, 1)
                }
            })
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class KitViewSet(viewsets.ModelViewSet):
    queryset = Kit.objects.all()
    serializer_class = KitSerializer

class ItemOrcamentoViewSet(viewsets.ModelViewSet):
    queryset = ItemOrcamento.objects.all()
    serializer_class = ItemOrcamentoSerializer

    def perform_create(self, serializer):
        # O snapshot agora é obrigatório no service
        # No entanto, se o serializer receber 'produto', 'quantidade', etc,
        # podemos delegar para o service ou usar o save() do serializer e depois corrigir.
        # Preferimos delegar para o service para garantir snapshot.
        data = serializer.validated_data
        item = PricingService.create_item_snapshot(
            kit=data['kit'],
            produto=data['produto'],
            quantidade=data['quantidade']
        )
        PricingService.recalculate_orcamento(item.kit.orcamento)

    def perform_update(self, serializer):
        item = serializer.save()
        PricingService.recalculate_orcamento(item.kit.orcamento)

    def perform_destroy(self, instance):
        orcamento = instance.kit.orcamento
        instance.delete()
        PricingService.recalculate_orcamento(orcamento)

class ConfiguracaoPrecoViewSet(viewsets.ModelViewSet):
    queryset = ConfiguracaoPreco.objects.filter(ativo=True)
    serializer_class = ConfiguracaoPrecoSerializer
