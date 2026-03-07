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
    status_nome = serializers.ReadOnlyField(source='status.nome')
    vendedor_nome = serializers.ReadOnlyField(source='vendedor.get_full_name')
    total_arquivos = serializers.IntegerField(source='arquivos.count', read_only=True)

    class Meta:
        model = Oportunidade
        fields = '__all__'
        read_only_fields = ['numero', 'criado_em']
