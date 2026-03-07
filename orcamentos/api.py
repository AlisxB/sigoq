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
        """Estatísticas de BI completas para visão gerencial e operacional."""
        from django.utils import timezone
        from django.db.models.functions import TruncMonth
        from django.db.models import Q, F
        from comercial.models import MetaMensal, Oportunidade
        
        try:
            user = request.user
            now = timezone.now()
            
            # Verificação de privilégios para visão global
            is_privileged = user.is_superuser or user.is_staff or (
                hasattr(user, 'perfil') and 
                user.perfil.cargo in ['ADMIN', 'GERENTE', 'ORCAMENTISTA']
            )
            
            qs_all = self.get_queryset() # Respeita isolamento se não for admin
            
            # --- 1. MÉTRICAS DE TOPO (KPIs) ---
            # Margem Média
            margem_data = qs_all.filter(status__in=['ENVIADO', 'APROVADO']).aggregate(avg=Avg('margem_contrib'))
            margem_media = float(margem_data.get('avg') or 0)
            
            # Faturamento Mês Atual (Soma do valor estimado das Oportunidades Ganhas no mês)
            # Filtramos diretamente em Oportunidade para evitar duplicidade de orçamentos/revisões
            vendas_mes_qs = Oportunidade.objects.filter(
                status_id=5, # Status 'GANHO'
                atualizado_em__month=now.month,
                atualizado_em__year=now.year
            )
            if not is_privileged:
                vendas_mes_qs = vendas_mes_qs.filter(vendedor=user)
                
            vendas_mes = float(vendas_mes_qs.aggregate(total=Sum('valor_estimado'))['total'] or 0)

            meta_obj = MetaMensal.objects.filter(mes=now.month, ano=now.year, vendedor=request.user).first()
            if not meta_obj:
                meta_obj = MetaMensal.objects.filter(mes=now.month, ano=now.year, vendedor__isnull=True).first()
            
            valor_meta = float(meta_obj.valor_meta if meta_obj else 0)
            percentual_atingimento = (vendas_mes / valor_meta * 100) if valor_meta > 0 else 0

            # Ticket Médio (Aprovados)
            ticket_data = qs_all.filter(status='APROVADO').aggregate(avg=Avg('valor_total'), count=Count('id'))
            ticket_medio = float(ticket_data.get('avg') or 0)
            total_aprovados = ticket_data.get('count') or 0

            # Valor do Pipeline Ativo (Soma das Oportunidades que não estão Ganhas/Perdidas)
            pipeline_ativo_qs = Oportunidade.objects.exclude(status_id__in=[5, 6])
            # Se não for admin/gerente/orçamentista, vê apenas suas próprias OPs
            if not is_privileged:
                pipeline_ativo_qs = pipeline_ativo_qs.filter(vendedor=request.user)
            
            pipeline_ativo = float(pipeline_ativo_qs.aggregate(total=Sum('valor_estimado'))['total'] or 0)

            # --- 2. GRÁFICOS DE TENDÊNCIA E MIX ---
            periodo = request.query_params.get('periodo', 'mes') # dia, mes, ano

            from django.db.models.functions import TruncDay, TruncMonth, TruncYear

            evolucao_qs = qs_all.filter(status='APROVADO')

            if periodo == 'dia':
                # Dias do mês vigente
                evolucao_qs = evolucao_qs.filter(atualizado_em__month=now.month, atualizado_em__year=now.year)
                trunc_fn = TruncDay('atualizado_em')
                date_format = '%d/%m'
            elif periodo == 'ano':
                # Últimos 10 anos
                dez_anos_atras = now.year - 10
                evolucao_qs = evolucao_qs.filter(atualizado_em__year__gte=dez_anos_atras)
                trunc_fn = TruncYear('atualizado_em')
                date_format = '%Y'
            else:
                # Meses do ano vigente (default)
                evolucao_qs = evolucao_qs.filter(atualizado_em__year=now.year)
                trunc_fn = TruncMonth('atualizado_em')
                date_format = '%b/%y'

            evolucao = evolucao_qs.annotate(period=trunc_fn) \
                .values('period') \
                .annotate(total=Sum('valor_total')) \
                .order_by('period')

            evolucao_list = [{
                'label': e['period'].strftime(date_format),
                'total': float(e['total'])
            } for e in evolucao]

            # Mix por Categoria (Baseado em orçamentos ENVIADOS e APROVADOS)
            categorias_raw = ItemOrcamento.objects.filter(
                kit__orcamento__in=qs_all.filter(status__in=['APROVADO', 'ENVIADO'])
            ).values('produto__categoria__nome').annotate(
                total=Sum('quantidade')
            ).order_by('-total')[:5]
            
            categorias = [{
                'label': item['produto__categoria__nome'] or 'Outros',
                'value': float(item['total'] or 0)
            } for item in categorias_raw]

            # --- 3. ANÁLISE COMERCIAL (BI) ---
            # Origem de Leads (Baseado nas Oportunidades vinculadas)
            origens_raw = Oportunidade.objects.filter(
                id__in=qs_all.values_list('oportunidade_id', flat=True)
            ).values('fonte').annotate(count=Count('id')).order_by('-count')
            
            origens = [{
                'label': item['fonte'],
                'value': item['count']
            } for item in origens_raw]

            # Motivos de Perda (Baseado nas Oportunidades Perdidas)
            motivos_dict = dict(Oportunidade.MOTIVO_PERDA_CHOICES)
            motivos_raw = Oportunidade.objects.filter(
                id__in=qs_all.values_list('oportunidade_id', flat=True),
                status_id=6 # Status 'PERDIDO'
            ).exclude(motivo_perda__isnull=True).exclude(motivo_perda='') \
             .values('motivo_perda').annotate(count=Count('id')).order_by('-count')[:5]
            
            motivos_perda = [{
                'label': motivos_dict.get(item['motivo_perda'], item['motivo_perda']),
                'value': item['count']
            } for item in motivos_raw]

            # Ranking de Clientes (Pareto - Top 10)
            ranking_clientes = qs_all.filter(status__in=['APROVADO', 'ENVIADO']) \
                .values('cliente__razao_social', 'cliente__nome_fantasia') \
                .annotate(total=Sum('valor_total')) \
                .order_by('-total')[:10]
            
            clientes_bi = [{
                'nome': item['cliente__nome_fantasia'] or item['cliente__razao_social'],
                'total': float(item['total'])
            } for item in ranking_clientes]

            # --- 4. ALERTAS ESTRATÉGICOS ---
            # Oportunidades estagnadas (> 15 dias sem atualização)
            limite_estagnacao = now - timezone.timedelta(days=15)
            estagnadas_raw = Oportunidade.objects.filter(
                id__in=qs_all.values_list('oportunidade_id', flat=True),
                atualizado_em__lt=limite_estagnacao
            ).exclude(status__id__in=[5, 6]) # Exclui Ganho/Perdido
            
            estagnadas = [{
                'id': op.id,
                'numero': op.numero,
                'titulo': op.titulo,
                'dias_parado': (now - op.atualizado_em).days,
                'valor': float(op.valor_estimado)
            } for op in estagnadas_raw[:5]] # Apenas top 5 alertas

            return Response({
                'kpis': {
                    'margem_media': round(margem_media * 100, 1),
                    'ticket_medio': round(ticket_medio, 2),
                    'total_aprovados': total_aprovados,
                    'pipeline_ativo_valor': round(pipeline_ativo, 2),
                    'vendas_mes': round(vendas_mes, 2),
                    'meta_valor': round(valor_meta, 2),
                    'meta_atingimento': round(percentual_atingimento, 1),
                    'total_estagnadas': estagnadas_raw.count(),
                    'em_elaboracao': qs_all.filter(status='ELABORACAO').count(),
                    'em_revisao': qs_all.filter(status='REVISAO').count(),
                },
                'charts': {
                    'evolucao_mensal': evolucao_list,
                    'mix_categorias': categorias,
                    'origem_leads': origens,
                    'motivos_perda': motivos_perda
                },
                'ranking_clientes': clientes_bi,
                'alertas': {
                    'estagnadas': estagnadas
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
