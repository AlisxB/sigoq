from django.contrib import admin
from .models import Categoria, Produto

@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ('nome', 'descricao')
    search_fields = ('nome',)

@admin.register(Produto)
class ProdutoAdmin(admin.ModelAdmin):
    list_display = ('codigo', 'descricao', 'categoria', 'fornecedor', 'custo_base', 'unidade_medida', 'vendedor', 'is_deleted')
    list_filter = ('categoria', 'fornecedor', 'vendedor', 'is_deleted')
    search_fields = ('codigo', 'descricao')
    readonly_fields = ('criado_em', 'atualizado_em', 'deleted_at')

    def get_queryset(self, request):
        return self.model.all_objects.all()
