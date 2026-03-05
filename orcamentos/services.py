from decimal import Decimal
from .models import ConfiguracaoPreco, Orcamento, ItemOrcamento

class PricingService:
    @staticmethod
    def calculate_selling_price(cost, config, margin):
        """
        vlr_unit_venda = custo_unit_snapshot / (1 - (Soma_Encargos + Margem_Contribuicao))
        """
        soma_encargos = config.soma_encargos
        divisor = Decimal(1) - (soma_encargos + margin)
        
        if divisor <= 0:
            # Proteção contra divisão por zero ou valor negativo (Markup > 100%)
            return cost * Decimal('2.0') # Fallback ou Erro? Vamos usar markup alto.
            
        return cost / divisor

    @classmethod
    def update_item_pricing(cls, item, config=None, margin=None):
        if not config:
            config = ConfiguracaoPreco.objects.filter(ativo=True).first()
        if margin is None:
            margin = item.kit.orcamento.margem_contrib
            
        item.vlr_unit_venda = cls.calculate_selling_price(item.custo_unit_snapshot, config, margin)
        item.save()

    @classmethod
    def update_orcamento_totals(cls, orcamento):
        total_custo = Decimal(0)
        total_venda = Decimal(0)
        
        # Percorrer kits e itens
        for kit in orcamento.kits.all():
            for item in kit.itens.all():
                total_custo += item.custo_unit_snapshot * item.quantidade
                total_venda += (item.vlr_unit_venda - item.desconto_unit_valor) * item.quantidade
        
        orcamento.custo_total = total_custo
        orcamento.valor_total = total_venda
        
        # Aplicar desconto global se houver
        if orcamento.desconto_percent > 0:
            orcamento.valor_total *= (Decimal(1) - (orcamento.desconto_percent / Decimal(100)))
            
        orcamento.save()
