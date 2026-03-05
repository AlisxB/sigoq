from django.contrib import admin
from .models import ConfiguracaoPreco, Orcamento, Kit, ItemOrcamento
from .services import PricingService

@admin.register(ConfiguracaoPreco)
class ConfiguracaoPrecoAdmin(admin.ModelAdmin):
    list_display = ('nome', 'soma_encargos', 'margem_contribuicao_padrao', 'ativo')
    fieldsets = (
        (None, {'fields': ('nome', 'ativo')}),
        ('Markups (Encargos)', {
            'fields': (
                'markup_engenharia', 'markup_capitalizacao', 'markup_frete',
                'markup_imposto', 'markup_comissao', 'markup_difal', 'markup_frete_especial'
            )
        }),
        ('Margem', {'fields': ('margem_contribuicao_padrao',)}),
    )

class ItemOrcamentoInline(admin.TabularInline):
    model = ItemOrcamento
    extra = 1
    readonly_fields = ('codigo', 'descricao', 'custo_unit_snapshot', 'vlr_unit_venda')
    fields = ('produto', 'quantidade', 'desconto_unit_valor', 'vlr_unit_venda')

@admin.register(Kit)
class KitAdmin(admin.ModelAdmin):
    list_display = ('nome', 'orcamento', 'ordem')
    inlines = [ItemOrcamentoInline]
    list_filter = ('orcamento',)

class KitInline(admin.StackedInline):
    model = Kit
    extra = 1
    show_change_link = True

from django.utils.html import format_html
from django.urls import reverse

@admin.register(Orcamento)
class OrcamentoAdmin(admin.ModelAdmin):
    list_display = (
        'get_full_number', 'cliente', 'status', 'vendedor', 
        'valor_total', 'margem_contrib', 'pdf_link', 'is_deleted'
    )
    list_filter = ('status', 'vendedor', 'is_deleted')
    search_fields = ('numero', 'cliente__razao_social')
    readonly_fields = ('numero', 'revisao', 'custo_total', 'valor_total', 'criado_em', 'atualizado_em')
    inlines = [KitInline]

    def get_full_number(self, obj):
        return f"ORC-{obj.numero:04d}-R{obj.revisao:02d}"
    get_full_number.short_description = 'Nº Orçamento'

    def pdf_link(self, obj):
        url = reverse('orcamentos:gerar_pdf', args=[obj.pk])
        return format_html('<a href="{}" target="_blank">🖨️ Imprimir PDF</a>', url)
    pdf_link.short_description = 'Ações'

    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
        # Recalcular totais após salvar
        # PricingService.update_orcamento_totals(obj) # Chamado via botões ou signal seria melhor, mas aqui funciona
        pass

    def get_queryset(self, request):
        return self.model.all_objects.all()

    actions = ['recalcular_valores']

    @admin.action(description="Recalcular todos os valores selecionados")
    def recalcular_valores(self, request, queryset):
        config = ConfiguracaoPreco.objects.filter(ativo=True).first()
        for orc in queryset:
            for kit in orc.kits.all():
                for item in kit.itens.all():
                    PricingService.update_item_pricing(item, config)
            PricingService.update_orcamento_totals(orc)
        self.message_user(request, "Valores recalculados com sucesso.")
