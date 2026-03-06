from rest_framework import serializers
from .models import Cliente

class ClienteSerializer(serializers.ModelSerializer):
    vendedor_nome = serializers.ReadOnlyField(source='vendedor.get_full_name')

    class Meta:
        model = Cliente
        fields = '__all__'
