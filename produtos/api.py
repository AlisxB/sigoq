from rest_framework import viewsets, filters
from .models import Categoria, Produto
from .serializers import CategoriaSerializer, ProdutoSerializer

class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer

class ProdutoViewSet(viewsets.ModelViewSet):
    queryset = Produto.objects.all().select_related('categoria', 'fornecedor')
    serializer_class = ProdutoSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['codigo', 'descricao', 'ncm']
    ordering_fields = ['codigo', 'descricao', 'custo_base']

    def get_queryset(self):
        queryset = super().get_queryset()
        categoria = self.request.query_params.get('categoria')
        fornecedor = self.request.query_params.get('fornecedor')
        
        if categoria:
            queryset = queryset.filter(categoria_id=categoria)
        if fornecedor:
            queryset = queryset.filter(fornecedor_id=fornecedor)
            
        return queryset
