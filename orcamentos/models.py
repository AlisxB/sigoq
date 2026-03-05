from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from core.models import BaseModel
from clientes.models import Cliente
from produtos.models import Produto

class ConfiguracaoPreco(models.Model):
    """
    Configurações globais de precificação (Markup/BDI).
    Normalmente haveria apenas um registro ativo.
    """
    nome = models.CharField(max_length=100, default="Padrão", verbose_name="Nome da Configuração")
    markup_engenharia = models.DecimalField(max_digits=5, decimal_places=4, default=0.1000, verbose_name="Engenharia (%)")
    markup_capitalizacao = models.DecimalField(max_digits=5, decimal_places=4, default=0.0500, verbose_name="Capitalização (%)")
    markup_frete = models.DecimalField(max_digits=5, decimal_places=4, default=0.0300, verbose_name="Frete (%)")
    markup_imposto = models.DecimalField(max_digits=5, decimal_places=4, default=0.1500, verbose_name="Impostos (%)")
    markup_comissao = models.DecimalField(max_digits=5, decimal_places=4, default=0.0500, verbose_name="Comissão (%)")
    markup_difal = models.DecimalField(max_digits=5, decimal_places=4, default=0.0000, verbose_name="DIFAL (%)")
    markup_frete_especial = models.DecimalField(max_digits=5, decimal_places=4, default=0.0000, verbose_name="Frete Especial (%)")
    margem_contribuicao_padrao = models.DecimalField(max_digits=5, decimal_places=4, default=0.2000, verbose_name="Margem Contribuição Padrão (%)")
    ativo = models.BooleanField(default=True, verbose_name="Ativo?")

    class Meta:
        verbose_name = "Configuração de Preço"
        verbose_name_plural = "Configurações de Preço"

    def __str__(self):
        return self.nome

    @property
    def soma_encargos(self):
        return (self.markup_engenharia + self.markup_capitalizacao + self.markup_frete + 
                self.markup_imposto + self.markup_comissao + self.markup_difal +
                self.markup_frete_especial)

class Orcamento(BaseModel):
    STATUS_CHOICES = [
        ('RASCUNHO', 'Rascunho'),
        ('ELABORACAO', 'Em Elaboração'),
        ('REVISAO', 'Aguardando Revisão'),
        ('ENVIADO', 'Enviado ao Cliente'),
        ('APROVADO', 'Aprovado'),
        ('REPROVADO', 'Reprovado'),
        ('CANCELADO', 'Cancelado'),
    ]

    numero = models.PositiveIntegerField(editable=False, verbose_name="Nº Orçamento")
    revisao = models.PositiveIntegerField(default=0, verbose_name="Revisão")
    versao_pai = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='revisoes', verbose_name="Versão Original")
    
    cliente = models.ForeignKey(Cliente, on_delete=models.PROTECT, related_name='orcamentos', verbose_name="Cliente")
    resp_orcam = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='orcamentos_tecnicos', verbose_name="Orçamentista")
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='RASCUNHO', verbose_name="Status")
    
    # Valores Totais
    custo_total = models.DecimalField(max_digits=15, decimal_places=2, default=0.00, verbose_name="Custo Total")
    valor_total = models.DecimalField(max_digits=15, decimal_places=2, default=0.00, verbose_name="Valor Total Venda")
    
    # Parâmetros Calculados/Aplicados
    margem_contrib = models.DecimalField(max_digits=5, decimal_places=4, default=0.2000, verbose_name="Margem de Contribuição (%)")
    desconto_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0.00, verbose_name="Desconto Final (%)")
    
    validade_dias = models.PositiveIntegerField(default=15, verbose_name="Validade (Dias)")
    prazo_entrega = models.CharField(max_length=100, blank=True, verbose_name="Prazo de Entrega")
    condicao_pagamento = models.CharField(max_length=255, blank=True, verbose_name="Condição de Pagamento")
    observacoes = models.TextField(blank=True, verbose_name="Observações")

    class Meta:
        verbose_name = "Orçamento"
        verbose_name_plural = "Orçamentos"
        unique_together = ('numero', 'revisao')
        ordering = ['-numero', '-revisao']

    def __str__(self):
        return f"ORC-{self.numero:04d}-R{self.revisao:02d} | {self.cliente.nome_fantasia or self.cliente.razao_social}"

    def save(self, *args, **kwargs):
        if not self.numero:
            last_orc = Orcamento.all_objects.all().order_by('numero').last()
            self.numero = (last_orc.numero + 1) if last_orc else 1
        super().save(*args, **kwargs)

class Kit(models.Model):
    """
    Agrupador de itens dentro de um orçamento (ex: Painel Principal, Comando, Motores).
    """
    orcamento = models.ForeignKey(Orcamento, on_delete=models.CASCADE, related_name='kits', verbose_name="Orçamento")
    nome = models.CharField(max_length=200, verbose_name="Nome do Kit")
    descricao = models.TextField(blank=True, verbose_name="Descrição/Finalidade")
    ordem = models.PositiveIntegerField(default=1)

    class Meta:
        verbose_name = "Kit"
        verbose_name_plural = "Kits"
        ordering = ['ordem']

    def __str__(self):
        return f"{self.nome} ({self.orcamento})"

class ItemOrcamento(models.Model):
    """
    SNAPSHOT físico do produto no momento da inclusão.
    """
    kit = models.ForeignKey(Kit, on_delete=models.CASCADE, related_name='itens', verbose_name="Kit")
    produto = models.ForeignKey(Produto, on_delete=models.PROTECT, related_name='orcamentos_relacionados', verbose_name="Produto Original")
    
    # Snapshot dos campos do produto
    codigo = models.CharField(max_length=50, verbose_name="Código (Snapshot)")
    descricao = models.CharField(max_length=255, verbose_name="Descrição (Snapshot)")
    
    quantidade = models.DecimalField(max_digits=12, decimal_places=3, verbose_name="Quantidade")
    custo_unit_snapshot = models.DecimalField(max_digits=15, decimal_places=2, verbose_name="Custo Unitário (Snapshot)")
    
    # Cálculo de Venda
    vlr_unit_venda = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, verbose_name="Valor Unitário Venda")
    desconto_unit_valor = models.DecimalField(max_digits=15, decimal_places=2, default=0.00, verbose_name="Desconto Unitário (Valor)")
    
    class Meta:
        verbose_name = "Item de Orçamento"
        verbose_name_plural = "Itens de Orçamento"

    def __str__(self):
        return f"{self.codigo} x {self.quantidade}"

    def save(self, *args, **kwargs):
        # Garantir snapshot se for novo
        if not self.pk:
            self.codigo = self.produto.codigo
            self.descricao = self.produto.descricao
            self.custo_unit_snapshot = self.produto.custo_base
            
        if not self.vlr_unit_venda:
            from .services import PricingService
            config = ConfiguracaoPreco.objects.filter(ativo=True).first()
            if config:
                self.vlr_unit_venda = PricingService.calculate_selling_price(
                    self.custo_unit_snapshot, config, self.kit.orcamento.margem_contrib
                )
            else:
                self.vlr_unit_venda = self.custo_unit_snapshot * Decimal('1.5') # Fallback
                
        super().save(*args, **kwargs)
