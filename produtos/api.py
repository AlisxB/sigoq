from rest_framework import viewsets, filters
from .models import Categoria, Produto
from .serializers import CategoriaSerializer, ProdutoSerializer

class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer

class ProdutoViewSet(viewsets.ModelViewSet):
    queryset = Produto.objects.all().select_related('categoria', 'fornecedor').defer('observacoes', 'criado_em', 'atualizado_em')
    serializer_class = ProdutoSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['codigo', 'descricao']
    ordering_fields = ['codigo', 'descricao', 'custo_base']

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filtro de busca exata (muito mais rápido que SearchFilter)
        codigo_exato = self.request.query_params.get('codigo_exato')
        if codigo_exato:
            return queryset.filter(codigo__iexact=codigo_exato)

        categoria = self.request.query_params.get('categoria')
        fornecedor = self.request.query_params.get('fornecedor')
        
        if categoria:
            queryset = queryset.filter(categoria_id=categoria)
        if fornecedor:
            queryset = queryset.filter(fornecedor_id=fornecedor)
            
        return queryset
