from rest_framework import viewsets, filters
from .models import Cliente
from .serializers import ClienteSerializer

class ClienteViewSet(viewsets.ModelViewSet):
    serializer_class = ClienteSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['razao_social', 'nome_fantasia', 'cnpj', 'cpf', 'email']
    ordering_fields = ['razao_social', 'nome_fantasia', 'criado_em']

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Cliente.objects.none()

        # Administradores, Gerentes e Orçamentistas vêem todos os clientes
        is_privileged = user.is_superuser or user.is_staff or (
            hasattr(user, 'perfil') and 
            user.perfil.cargo in ['ADMIN', 'GERENTE', 'ORCAMENTISTA']
        )
        
        # Usamos Cliente.objects para garantir que o SoftDeleteManager filtre os deletados
        qs = Cliente.objects.all().select_related('vendedor')

        # Filtro manual por vendedor para administradores
        vendedor_id = self.request.query_params.get('vendedor')
        if vendedor_id and is_privileged:
            qs = qs.filter(vendedor_id=vendedor_id)
        
        if not is_privileged:
            # Vendedores comuns vêem apenas seus próprios clientes
            qs = qs.filter(vendedor=user)
            
        return qs.order_by('razao_social')

    def perform_create(self, serializer):
        # Atribui o vendedor logado automaticamente ao criar um cliente
        serializer.save(vendedor=self.request.user if self.request.user.is_authenticated else None)
