from rest_framework import serializers
from .models import StatusOportunidade, Oportunidade, MetaMensal
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

class OportunidadeSerializer(serializers.ModelSerializer):
    cliente_detalhe = ClienteSerializer(source='cliente', read_only=True)
    status_detalhe = StatusOportunidadeSerializer(source='status', read_only=True)
    status_nome = serializers.ReadOnlyField(source='status.nome')
    vendedor_nome = serializers.ReadOnlyField(source='vendedor.get_full_name')

    class Meta:
        model = Oportunidade
        fields = '__all__'
        read_only_fields = ['numero', 'criado_em']
