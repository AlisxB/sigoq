from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.contrib.auth.models import User
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.middleware.csrf import rotate_token
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .serializers import UserSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        role = self.request.query_params.get('role')
        if role:
            role_map = {
                'COMERCIAL': 'VENDEDOR',
                'ORCAMENTISTA': 'ORCAMENTISTA',
                'ADMIN': 'ADMIN'
            }
            backend_role = role_map.get(role, role)
            return qs.filter(perfil__cargo=backend_role)
        return qs

class AuthViewSet(viewsets.ViewSet):
    """
    ViewSet para autenticação de usuários.
    Isento de CSRF no login para permitir acesso cross-origin inicial.
    """
    permission_classes = [permissions.AllowAny]
    authentication_classes = [] # Bypassa o check de CSRF do SessionAuthentication do DRF

    @method_decorator(csrf_exempt)
    @action(detail=False, methods=['post'])
    def login(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        
        if user:
            auth_login(request, user)
            rotate_token(request) # Importante: Gera novo token CSRF para a nova sessão
            serializer = UserSerializer(user, context={'request': request})
            response = Response(serializer.data)
            return response
        return Response({'detail': 'Credenciais inválidas'}, status=status.HTTP_401_UNAUTHORIZED)

    @method_decorator(csrf_exempt)
    @action(detail=False, methods=['post'])
    def logout(self, request):
        auth_logout(request)
        return Response({'detail': 'Logout realizado com sucesso'})

    @action(detail=False, methods=['get'])
    def me(self, request):
        if request.user.is_authenticated:
            serializer = UserSerializer(request.user, context={'request': request})
            return Response(serializer.data)
        return Response({'detail': 'Não autenticado'}, status=status.HTTP_401_UNAUTHORIZED)
