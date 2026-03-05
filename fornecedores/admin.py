from django.contrib import admin
from .models import Fornecedor

@admin.register(Fornecedor)
class FornecedorAdmin(admin.ModelAdmin):
    list_display = ('razao_social', 'nome_fantasia', 'cnpj', 'telefone', 'vendedor', 'is_deleted')
    list_filter = ('vendedor', 'is_deleted')
    search_fields = ('razao_social', 'nome_fantasia', 'cnpj')
    readonly_fields = ('criado_em', 'atualizado_em', 'deleted_at')

    def get_queryset(self, request):
        return self.model.all_objects.all()
