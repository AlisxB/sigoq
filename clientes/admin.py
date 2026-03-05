from django.contrib import admin
from .models import Cliente

@admin.register(Cliente)
class ClienteAdmin(admin.ModelAdmin):
    list_display = ('razao_social', 'nome_fantasia', 'cnpj', 'vendedor', 'is_deleted')
    list_filter = ('vendedor', 'is_deleted', 'estado')
    search_fields = ('razao_social', 'nome_fantasia', 'cnpj')
    readonly_fields = ('criado_em', 'atualizado_em', 'deleted_at')

    def get_queryset(self, request):
        # Admin deve ver todos, inclusive os deletados (soft-delete)
        return self.model.all_objects.all()
