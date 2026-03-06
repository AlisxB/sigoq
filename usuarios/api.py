from django.contrib.auth.models import User
from rest_framework import viewsets
from .serializers import UserSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        role = self.request.query_params.get('role')
        if role:
            # Mapeamento do frontend Role -> Backend Cargo
            # 'COMERCIAL' -> 'VENDEDOR'
            role_map = {
                'COMERCIAL': 'VENDEDOR',
                'ORCAMENTISTA': 'ORCAMENTISTA',
                'ADMIN': 'ADMIN'
            }
            backend_role = role_map.get(role, role)
            return qs.filter(perfil__cargo=backend_role)
        return qs
