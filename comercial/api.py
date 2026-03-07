from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Count
from .models import StatusOportunidade, Oportunidade, MetaMensal, ArquivoOportunidade
from .serializers import (
    StatusOportunidadeSerializer, 
    OportunidadeSerializer, 
    MetaMensalSerializer,
    ArquivoOportunidadeSerializer
)
from .services import FileManagementService

class StatusOportunidadeViewSet(viewsets.ModelViewSet):
    queryset = StatusOportunidade.objects.all()
    serializer_class = StatusOportunidadeSerializer

class MetaMensalViewSet(viewsets.ModelViewSet):
    queryset = MetaMensal.objects.all()
    serializer_class = MetaMensalSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['ano', 'mes', 'vendedor']

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return MetaMensal.objects.none()
        
        is_privileged = user.is_superuser or user.is_staff or (
            hasattr(user, 'perfil') and user.perfil.cargo in ['ADMIN', 'GERENTE']
        )
        
        if is_privileged:
            return MetaMensal.objects.all().order_by('-ano', '-mes')
        
        from django.db.models import Q
        return MetaMensal.objects.filter(Q(vendedor=user) | Q(vendedor__isnull=True)).order_by('-ano', '-mes')

class OportunidadeViewSet(viewsets.ModelViewSet):
    queryset = Oportunidade.objects.all().select_related('cliente', 'status', 'vendedor')
    serializer_class = OportunidadeSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Oportunidade.objects.none()
            
        # RESTRIÇÃO: ADMIN, GERENTE e ORCAMENTISTA vêem tudo.
        is_privileged = user.is_superuser or user.is_staff or (
            hasattr(user, 'perfil') and 
            user.perfil.cargo in ['ADMIN', 'GERENTE', 'ORCAMENTISTA']
        )
        
        qs = Oportunidade.objects.all().select_related('cliente', 'status', 'vendedor')
        
        if not is_privileged:
            # Vendedores comuns vêem apenas seus próprios registros
            qs = qs.filter(vendedor=user)
            
        return qs.order_by('-numero')

    def perform_create(self, serializer):
        if self.request.user.is_authenticated:
            serializer.save(vendedor=self.request.user)
        else:
            serializer.save()

    @action(detail=False, methods=['get'])
    def estatisticas(self, request):
        """
        Retorna dados agregados para o Funil de Vendas.
        """
        oportunidades_qs = self.get_queryset()
        todos_status = StatusOportunidade.objects.all().order_by('ordem')
        
        funil = []
        for s in todos_status:
            ops_do_status = oportunidades_qs.filter(status=s)
            total_valor = ops_do_status.aggregate(Sum('valor_estimado'))['valor_estimado__sum'] or 0
            quantidade = ops_do_status.count()
            
            funil.append({
                'status__id': s.id,
                'status__nome': s.nome,
                'status__ordem': s.ordem,
                'status__cor': s.cor,
                'total': float(total_valor),
                'quantidade': quantidade
            })
        
        return Response(funil)

    @action(detail=True, methods=['post'])
    def upload_arquivos(self, request, pk=None):
        """
        Action para upload de múltiplos arquivos/pastas.
        Suporta o atributo 'webkitRelativePath' via campo 'paths[]' do form-data.
        """
        oportunidade = self.get_object()
        uploaded_files = request.FILES.getlist('files')
        relative_paths = request.data.getlist('paths[]', [])
        
        # Prepara os dados para o service
        files_data = []
        for i, f in enumerate(uploaded_files):
            path = relative_paths[i] if i < len(relative_paths) else ''
            files_data.append({'file': f, 'relative_path': path})
            
        created = FileManagementService.process_upload(
            oportunidade, files_data, user=request.user
        )
        
        serializer = ArquivoOportunidadeSerializer(created, many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'])
    def arquivos(self, request, pk=None):
        """
        Lista todos os arquivos vinculados a esta oportunidade.
        """
        oportunidade = self.get_object()
        arquivos = oportunidade.arquivos.all()
        serializer = ArquivoOportunidadeSerializer(arquivos, many=True)
        return Response(serializer.data)

class ArquivoOportunidadeViewSet(viewsets.ModelViewSet):
    queryset = ArquivoOportunidade.objects.all()
    serializer_class = ArquivoOportunidadeSerializer
    
    def get_queryset(self):
        # Garante que o isolamento comercial se aplique também aos arquivos
        user = self.request.user
        is_privileged = user.is_superuser or user.is_staff or (
            hasattr(user, 'perfil') and 
            user.perfil.cargo in ['ADMIN', 'GERENTE', 'ORCAMENTISTA']
        )
        
        if is_privileged:
            return self.queryset
        return self.queryset.filter(oportunidade__vendedor=user)
