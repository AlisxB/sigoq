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
        read_only_fields = ['kit', 'codigo', 'descricao', 'custo_unit_snapshot', 'vlr_unit_venda']

class KitSerializer(serializers.ModelSerializer):
    itens = ItemOrcamentoSerializer(many=True)

    class Meta:
        model = Kit
        fields = ['id', 'orcamento', 'nome', 'descricao', 'ordem', 'itens']
        read_only_fields = ['orcamento']

class OrcamentoSerializer(serializers.ModelSerializer):
    kits = KitSerializer(many=True)
    cliente_detalhe = ClienteSimpleSerializer(source='cliente', read_only=True)
    vendedor_nome = serializers.SerializerMethodField()

    class Meta:
        model = Orcamento
        fields = [
            'id', 'numero', 'revisao', 'versao_pai', 'oportunidade', 'cliente', 'cliente_detalhe',
            'resp_orcam', 'vendedor', 'vendedor_nome', 'status', 'custo_total', 'valor_total', 
            'margem_contrib', 'desconto_percent', 'validade_dias', 
            'prazo_entrega', 'condicao_pagamento', 'observacoes',
            'aprovado_gerencia', 'motivo_rejeicao', 'kits'
        ]
        read_only_fields = ['numero', 'revisao', 'custo_total', 'valor_total']

    def get_vendedor_nome(self, obj):
        if obj.vendedor:
            name = f"{obj.vendedor.first_name} {obj.vendedor.last_name}".strip()
            return name if name else obj.vendedor.username
        return "Sistema"

    def create(self, validated_data):
        kits_data = validated_data.pop('kits', [])
        orcamento = Orcamento.objects.create(**validated_data)
        
        from .services import PricingService
        for kit_data in kits_data:
            itens_data = kit_data.pop('itens', [])
            kit = Kit.objects.create(orcamento=orcamento, **kit_data)
            for item_data in itens_data:
                PricingService.create_item_snapshot(
                    kit=kit,
                    produto=item_data['produto'],
                    quantidade=item_data['quantidade']
                )
        
        PricingService.recalculate_orcamento(orcamento)
        return orcamento

    def update(self, instance, validated_data):
        kits_data = validated_data.pop('kits', [])
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        from .services import PricingService
        if 'kits' in self.initial_data:
            instance.kits.all().delete()
            for kit_data in kits_data:
                itens_data = kit_data.pop('itens', [])
                kit = Kit.objects.create(orcamento=instance, **kit_data)
                for item_data in itens_data:
                    PricingService.create_item_snapshot(
                        kit=kit,
                        produto=item_data['produto'],
                        quantidade=item_data['quantidade']
                    )
        
        PricingService.recalculate_orcamento(instance)
        return instance
