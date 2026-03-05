from rest_framework import serializers
from clientes.models import Cliente
from produtos.models import Produto
from .models import Orcamento, Kit, ItemOrcamento, ConfiguracaoPreco

class ClienteSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = ['id', 'razao_social', 'nome_fantasia', 'cnpj']

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
    itens = ItemOrcamentoSerializer(many=True, read_only=True)

    class Meta:
        model = Kit
        fields = ['id', 'orcamento', 'nome', 'descricao', 'ordem', 'itens']

class OrcamentoSerializer(serializers.ModelSerializer):
    kits = KitSerializer(many=True, read_only=True)
    cliente_detalhe = ClienteSimpleSerializer(source='cliente', read_only=True)

    class Meta:
        model = Orcamento
        fields = [
            'id', 'numero', 'revisao', 'versao_pai', 'cliente', 'cliente_detalhe',
            'resp_orcam', 'status', 'custo_total', 'valor_total', 
            'margem_contrib', 'desconto_percent', 'validade_dias', 
            'prazo_entrega', 'condicao_pagamento', 'observacoes',
            'aprovado_gerencia', 'motivo_rejeicao', 'kits'
        ]
        read_only_fields = ['numero', 'revisao', 'custo_total', 'valor_total']
