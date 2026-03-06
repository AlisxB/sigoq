from rest_framework import serializers
from clientes.models import Cliente
from produtos.models import Produto
from .models import Orcamento, Kit, ItemOrcamento, ConfiguracaoPreco

class ClienteSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = ['id', 'razao_social', 'nome_fantasia', 'cnpj', 'cpf']

class ProdutoSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Produto
        fields = ['id', 'codigo', 'descricao', 'custo_base']

class ConfiguracaoPrecoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConfiguracaoPreco
        fields = '__all__'

class ItemOrcamentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ItemOrcamento
        fields = [
            'id', 'kit', 'produto', 'codigo', 'descricao', 
            'quantidade', 'custo_unit_snapshot', 'vlr_unit_venda', 
            'desconto_unit_valor', 'desconto_percent_item'
        ]
        read_only_fields = ['codigo', 'descricao', 'custo_unit_snapshot', 'vlr_unit_venda']

class KitSerializer(serializers.ModelSerializer):
    itens = ItemOrcamentoSerializer(many=True)

    class Meta:
        model = Kit
        fields = ['id', 'orcamento', 'nome', 'descricao', 'ordem', 'itens']
        read_only_fields = ['orcamento']

class OrcamentoSerializer(serializers.ModelSerializer):
    kits = KitSerializer(many=True)
    cliente_detalhe = ClienteSimpleSerializer(source='cliente', read_only=True)

    vendedor_nome = serializers.ReadOnlyField(source='vendedor.get_full_name')

    class Meta:
        model = Orcamento
        fields = [
            'id', 'numero', 'revisao', 'versao_pai', 'cliente', 'cliente_detalhe',
            'resp_orcam', 'vendedor', 'vendedor_nome', 'status', 'custo_total', 'valor_total', 
            'margem_contrib', 'desconto_percent', 'validade_dias', 
            'prazo_entrega', 'condicao_pagamento', 'observacoes',
            'aprovado_gerencia', 'motivo_rejeicao', 'kits'
        ]
        read_only_fields = ['numero', 'revisao', 'custo_total', 'valor_total']

    def create(self, validated_data):
        kits_data = validated_data.pop('kits', [])
        orcamento = Orcamento.objects.create(**validated_data)
        
        for kit_data in kits_data:
            itens_data = kit_data.pop('itens', [])
            kit = Kit.objects.create(orcamento=orcamento, **kit_data)
            for item_data in itens_data:
                # Buscar produto para obter snapshot
                produto = item_data['produto']
                ItemOrcamento.objects.create(
                    kit=kit,
                    codigo=produto.codigo,
                    descricao=produto.descricao,
                    custo_unit_snapshot=produto.custo_base,
                    **item_data
                )
        
        # Recalcular totais usando o service
        from .services import PricingService
        PricingService.update_orcamento_totals(orcamento)
        return orcamento

    def update(self, instance, validated_data):
        kits_data = validated_data.pop('kits', [])
        
        # Atualizar campos básicos
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Atualizar Kits (Simplificado: remove todos e recria para consistência total no MVP)
        instance.kits.all().delete()
        for kit_data in kits_data:
            itens_data = kit_data.pop('itens', [])
            kit = Kit.objects.create(orcamento=instance, **kit_data)
            for item_data in itens_data:
                produto = item_data['produto']
                ItemOrcamento.objects.create(
                    kit=kit,
                    codigo=produto.codigo,
                    descricao=produto.descricao,
                    custo_unit_snapshot=produto.custo_base,
                    **item_data
                )
        
        from .services import PricingService
        # Atualizar preços de venda de todos os itens antes de totalizar
        for kit in instance.kits.all():
            for item in kit.itens.all():
                PricingService.update_item_pricing(item)
                
        PricingService.update_orcamento_totals(instance)
        return instance
