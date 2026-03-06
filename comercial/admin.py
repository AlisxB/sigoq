from django.contrib import admin
from .models import StatusOportunidade, Oportunidade, MetaMensal

@admin.register(StatusOportunidade)
class StatusOportunidadeAdmin(admin.ModelAdmin):
    list_display = ('ordem', 'nome', 'cor', 'notifica_setor_tecnico')
    list_editable = ('nome', 'cor', 'notifica_setor_tecnico')
    ordering = ('ordem',)

@admin.register(MetaMensal)
class MetaMensalAdmin(admin.ModelAdmin):
    list_display = ('get_mes_display', 'ano', 'valor_meta', 'vendedor')
    list_filter = ('ano', 'mes', 'vendedor')
    list_editable = ('valor_meta',)

@admin.register(Oportunidade)
class OportunidadeAdmin(admin.ModelAdmin):
    list_display = ('get_formatted_number', 'titulo', 'cliente', 'vendedor', 'status', 'valor_estimado', 'probabilidade', 'is_deleted')
    list_filter = ('status', 'vendedor', 'prioridade', 'is_deleted')
    search_fields = ('titulo', 'cliente__razao_social', 'cliente__nome_fantasia', 'numero')
    readonly_fields = ('numero', 'criado_em', 'atualizado_em', 'deleted_at')
    
    def get_formatted_number(self, obj):
        return f"OP-{obj.numero:04d}"
    get_formatted_number.short_description = 'Nº Oportunidade'

    def get_queryset(self, request):
        return self.model.all_objects.all()
