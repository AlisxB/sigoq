from rest_framework import serializers
from .models import StatusOportunidade, Oportunidade, MetaMensal, ArquivoOportunidade
from clientes.serializers import ClienteSerializer

class StatusOportunidadeSerializer(serializers.ModelSerializer):
    class Meta:
        model = StatusOportunidade
        fields = '__all__'

class MetaMensalSerializer(serializers.ModelSerializer):
    mes_nome = serializers.CharField(source='get_mes_display', read_only=True)
    vendedor_nome = serializers.ReadOnlyField(source='vendedor.get_full_name')

    class Meta:
        model = MetaMensal
        fields = '__all__'

class ArquivoOportunidadeSerializer(serializers.ModelSerializer):
    enviado_por_nome = serializers.ReadOnlyField(source='enviado_por.get_full_name')
    
    class Meta:
        model = ArquivoOportunidade
        fields = [
            'id', 'oportunidade', 'arquivo', 'nome_original', 
            'caminho_relativo', 'extensao', 'tamanho', 'criado_em', 
            'enviado_por', 'enviado_por_nome'
        ]
        read_only_fields = ['extensao', 'tamanho', 'criado_em', 'enviado_por']

class OportunidadeSerializer(serializers.ModelSerializer):
    cliente_detalhe = ClienteSerializer(source='cliente', read_only=True)
    status_detalhe = StatusOportunidadeSerializer(source='status', read_only=True)
    status_nome = serializers.CharField(source='status.nome', read_only=True)
    status_cor = serializers.CharField(source='status.cor', read_only=True)
    cliente_nome = serializers.CharField(source='cliente.nome_fantasia', read_only=True)
    vendedor_nome = serializers.SerializerMethodField()
    total_arquivos = serializers.IntegerField(source='arquivos.count', read_only=True)

    class Meta:
        model = Oportunidade
        fields = [
            'id', 'numero', 'titulo', 'descricao', 'cliente', 'cliente_nome', 'cliente_detalhe',
            'status', 'status_nome', 'status_cor', 'status_detalhe', 'valor_estimado', 'margem_lucro',
            'probabilidade', 'data_prevista_fechamento', 'fonte', 'prioridade',
            'vendedor', 'vendedor_nome', 'total_arquivos', 'motivo_perda', 
            'detalhes_perda', 'liberado_orcamento', 'criado_em', 'atualizado_em'
        ]
        read_only_fields = ['numero', 'criado_em']

    def get_vendedor_nome(self, obj):
        if obj.vendedor:
            return obj.vendedor.get_full_name() or obj.vendedor.username
        return "Sem Vendedor"
