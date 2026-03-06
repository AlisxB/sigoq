from rest_framework import viewsets, permissions
from .models import StatusOportunidade, Oportunidade
from .serializers import StatusOportunidadeSerializer, OportunidadeSerializer

class StatusOportunidadeViewSet(viewsets.ModelViewSet):
    queryset = StatusOportunidade.objects.all()
    serializer_class = StatusOportunidadeSerializer

class OportunidadeViewSet(viewsets.ModelViewSet):
    queryset = Oportunidade.objects.all()
    serializer_class = OportunidadeSerializer

    def get_queryset(self):
        if self.request.user.is_superuser or self.request.user.is_anonymous:
            return Oportunidade.all_objects.all()
        return Oportunidade.objects.filter(vendedor=self.request.user)

    def perform_create(self, serializer):
        if self.request.user.is_authenticated:
            serializer.save(vendedor=self.request.user)
        else:
            serializer.save()
