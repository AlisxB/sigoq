from rest_framework import serializers
from .models import Categoria, Produto

class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = '__all__'

class ProdutoSerializer(serializers.ModelSerializer):
    categoria_nome = serializers.ReadOnlyField(source='categoria.nome')
    fornecedor_nome = serializers.SerializerMethodField()

    class Meta:
        model = Produto
        fields = '__all__'

    def get_fornecedor_nome(self, obj):
        return obj.fornecedor.nome_fantasia or obj.fornecedor.razao_social
