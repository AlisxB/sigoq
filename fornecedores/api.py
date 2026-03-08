from rest_framework import viewsets, filters
from .models import Fornecedor
from .serializers import FornecedorSerializer

class FornecedorViewSet(viewsets.ModelViewSet):
    queryset = Fornecedor.objects.all()
    serializer_class = FornecedorSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['razao_social', 'nome_fantasia', 'cnpj', 'email']
    ordering_fields = ['razao_social', 'nome_fantasia']
