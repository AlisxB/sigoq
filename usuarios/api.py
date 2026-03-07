from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.contrib.auth.models import User
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.middleware.csrf import rotate_token
from rest_framework import viewsets, status, permissions, authentication
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

    @action(detail=True, methods=['post'])
    def reset_password(self, request, pk=None):
        """
        Gera uma senha temporária padrão para o usuário.
        """
        user = self.get_object()
        temp_password = "Sigoq@Temp123"
        user.set_password(temp_password)
        user.save()
        return Response({
            'detail': f'Senha resetada com sucesso para {user.username}.',
            'temp_password': temp_password
        }, status=status.HTTP_200_OK)

class AuthViewSet(viewsets.ViewSet):
    """
    ViewSet para autenticação de usuários.
    """
    permission_classes = [permissions.AllowAny]
    authentication_classes = [authentication.SessionAuthentication]

    @method_decorator(csrf_exempt)
    @action(detail=False, methods=['post'])
    def login(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        
        if user:
            auth_login(request, user)
            rotate_token(request)
            serializer = UserSerializer(user, context={'request': request})
            return Response(serializer.data)
        return Response({'detail': 'Credenciais inválidas'}, status=status.HTTP_401_UNAUTHORIZED)

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

    @action(detail=False, methods=['post'])
    def change_password(self, request):
        if not request.user.is_authenticated:
            return Response({'detail': 'Não autenticado'}, status=status.HTTP_401_UNAUTHORIZED)
            
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        
        if not request.user.check_password(old_password):
            return Response({'detail': 'Senha atual incorreta'}, status=status.HTTP_400_BAD_REQUEST)
            
        request.user.set_password(new_password)
        request.user.save()
        auth_login(request, request.user) # Re-login para manter a sessão
        return Response({'detail': 'Senha alterada com sucesso'})
