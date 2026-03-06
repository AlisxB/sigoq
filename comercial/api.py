from rest_framework import viewsets, permissions
from .models import StatusOportunidade, Oportunidade
from .serializers import StatusOportunidadeSerializer, OportunidadeSerializer

class StatusOportunidadeViewSet(viewsets.ModelViewSet):
    queryset = StatusOportunidade.objects.all()
    serializer_class = StatusOportunidadeSerializer

class OportunidadeViewSet(viewsets.ModelViewSet):
    queryset = Oportunidade.objects.all().select_related('cliente', 'status', 'vendedor')
    serializer_class = OportunidadeSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Oportunidade.objects.none()
            
        # Usuários que vêem tudo: ADMIN, GERENTE e ORCAMENTISTA
        permite_tudo = user.is_superuser or (
            hasattr(user, 'perfil') and 
            user.perfil.cargo in ['ADMIN', 'GERENTE', 'ORCAMENTISTA']
        )
        
        qs = self.queryset
        if not permite_tudo:
            qs = qs.filter(vendedor=user)
            
        return qs.order_by('-numero')

    def perform_create(self, serializer):
        if self.request.user.is_authenticated:
            serializer.save(vendedor=self.request.user)
        else:
            serializer.save()
