from decimal import Decimal
from django.db import transaction
from .models import ConfiguracaoPreco, Orcamento, Kit, ItemOrcamento
from .logic import pricing as pricing_logic

class PricingService:
    @staticmethod
    def get_active_config():
        """Retorna a configuração de preço ativa padrão."""
        return ConfiguracaoPreco.objects.filter(ativo=True).first()

    @classmethod
    def create_item_snapshot(cls, kit: Kit, produto, quantidade: Decimal):
        """
        Cria um ItemOrcamento garantindo o snapshot dos dados do produto.
        """
        config = cls.get_active_config()
        orcamento = kit.orcamento
        
        # Snapshot dos dados
        item = ItemOrcamento(
            kit=kit,
            produto=produto,
            codigo=produto.codigo,
            descricao=produto.descricao,
            quantidade=quantidade,
            custo_unit_snapshot=produto.custo_base
        )
        
        # Calcula preço de venda inicial baseado na margem do orçamento
        if config:
            soma_encargos = pricing_logic.calculate_total_encargos(
                config.markup_engenharia, config.markup_capitalizacao,
                config.markup_frete, config.markup_imposto, config.markup_comissao,
                config.markup_difal, config.markup_frete_especial
            )
            item.vlr_unit_venda = pricing_logic.calculate_unit_selling_price(
                item.custo_unit_snapshot, soma_encargos, orcamento.margem_contrib
            )
        else:
            # Fallback seguro (Custo * 1.5)
            item.vlr_unit_venda = item.custo_unit_snapshot * Decimal('1.5')
            
        item.save()
        return item

    @classmethod
    @transaction.atomic
    def recalculate_orcamento(cls, orcamento: Orcamento):
        """
        Recalcula todos os totais do orçamento (Custos e Preços de Venda).
        Esta é a única fonte de verdade para os totais.
        """
        total_custo = Decimal('0.00')
        total_venda = Decimal('0.00')
        
        # Iteração sobre os kits e seus itens
        # Usamos prefetch_related para evitar N+1 no caller
        for kit in orcamento.kits.all():
            for item in kit.itens.all():
                total_custo += item.custo_unit_snapshot * item.quantidade
                
                # Cálculo do item usando a lógica pura
                venda_liquida = item.vlr_unit_venda - item.desconto_unit_valor
                res = pricing_logic.calculate_item_totals(
                    venda_liquida, item.quantidade, item.desconto_percent_item
                )
                total_venda += res['total']
        
        # Atualiza os totais do cabeçalho
        orcamento.custo_total = total_custo
        
        # Desconto global do orçamento
        if orcamento.desconto_percent > 0:
            total_venda *= (Decimal('1') - (orcamento.desconto_percent / Decimal('100')))
            
        orcamento.valor_total = total_venda
        
        # Regra de Alerta de Margem Baixa centralizada aqui
        if pricing_logic.check_low_margin(orcamento.margem_contrib):
            if orcamento.status not in ['REVISAO', 'REPROVADO']:
                orcamento.status = 'REVISAO'
        
        orcamento.save()
        return orcamento

    @classmethod
    @transaction.atomic
    def clone_revision(cls, orcamento: Orcamento) -> Orcamento:
        """
        Cria uma nova revisão de um orçamento existente.
        Substitui a lógica procedural no model Orcamento.duplicate().
        """
        last_rev = Orcamento.objects.filter(numero=orcamento.numero).order_by('revisao').last()
        new_revisao = last_rev.revisao + 1
        
        # Clonagem via serialização interna do Django
        new_orc = Orcamento.objects.get(pk=orcamento.pk)
        new_orc.pk = None
        new_orc.revisao = new_revisao
        new_orc.versao_pai = orcamento
        new_orc.status = 'RASCUNHO'
        new_orc.save()
        
        # Clonagem de Kits e Itens
        for kit in orcamento.kits.all():
            old_kit_pk = kit.pk
            kit.pk = None
            kit.orcamento = new_orc
            kit.save()
            
            # Clonagem de itens do kit
            items_to_clone = ItemOrcamento.objects.filter(kit_id=old_kit_pk)
            for item in items_to_clone:
                item.pk = None
                item.kit = kit
                item.save()
        
        return new_orc
