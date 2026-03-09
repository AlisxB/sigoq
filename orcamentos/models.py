from decimal import Decimal
from django.db import models
from django.conf import settings
from core.models import BaseModel
from clientes.models import Cliente
from produtos.models import Produto
from comercial.models import Oportunidade

class ConfiguracaoPreco(models.Model):
    """Configurações globais de precificação (Markup/BDI)."""
    nome = models.CharField(max_length=100, default="Padrão", verbose_name="Nome da Configuração")
    markup_engenharia = models.DecimalField(max_digits=5, decimal_places=4, default=0.1000)
    markup_capitalizacao = models.DecimalField(max_digits=5, decimal_places=4, default=0.0500)
    markup_frete = models.DecimalField(max_digits=5, decimal_places=4, default=0.0300)
    markup_imposto = models.DecimalField(max_digits=5, decimal_places=4, default=0.1500)
    markup_comissao = models.DecimalField(max_digits=5, decimal_places=4, default=0.0500)
    markup_difal = models.DecimalField(max_digits=5, decimal_places=4, default=0.0000)
    markup_frete_especial = models.DecimalField(max_digits=5, decimal_places=4, default=0.0000)
    margem_contribuicao_padrao = models.DecimalField(max_digits=5, decimal_places=4, default=0.2000)
    ativo = models.BooleanField(default=True)

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

    numero = models.PositiveIntegerField(editable=False)
    revisao = models.PositiveIntegerField(default=0)
    versao_pai = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='revisoes')
    
    oportunidade = models.ForeignKey(Oportunidade, on_delete=models.SET_NULL, null=True, blank=True, related_name='orcamentos')
    cliente = models.ForeignKey(Cliente, on_delete=models.PROTECT, related_name='orcamentos')
    resp_orcam = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='orcamentos_tecnicos')
    vendedor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='orcamentos_comerciais')
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='RASCUNHO')
    
    custo_total = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    valor_total = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    margem_contrib = models.DecimalField(max_digits=5, decimal_places=4, default=0.2000)
    desconto_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    
    aprovado_gerencia = models.BooleanField(default=False)
    motivo_rejeicao = models.TextField(blank=True)
    validade_dias = models.PositiveIntegerField(default=15)
    prazo_entrega = models.CharField(max_length=100, blank=True)
    condicao_pagamento = models.CharField(max_length=255, blank=True)
    observacoes = models.TextField(blank=True)

    class Meta:
        verbose_name = "Orçamento"
        verbose_name_plural = "Orçamentos"
        unique_together = ('numero', 'revisao')
        ordering = ['-numero', '-revisao']

    def __str__(self):
        return f"ORC-{self.numero:04d}-R{self.revisao:02d}"

    def save(self, *args, **kwargs):
        is_new = not self.pk
        old_status = None
        if not is_new:
            try:
                old_status = Orcamento.objects.get(pk=self.pk).status
            except Orcamento.DoesNotExist:
                pass

        if not self.numero:
            last_orc = Orcamento.objects.all().order_by('numero').last()
            self.numero = (last_orc.numero + 1) if last_orc else 1
        
        super().save(*args, **kwargs)

        # Sincronização com a Oportunidade
        if self.oportunidade and self.status in ['ENVIADO', 'APROVADO'] and old_status not in ['ENVIADO', 'APROVADO']:
            from comercial.models import StatusOportunidade
            try:
                # Se enviado, move para Negociação (ID 4). Se aprovado, pode ser movido para Ganho (ID 5) manualmente ou automático.
                # Por enquanto, garantimos o movimento para Negociação e a LIBERAÇÃO técnica.
                target_status_id = 4 if self.status == 'ENVIADO' else 5
                novo_status = StatusOportunidade.objects.get(id=target_status_id)
                changed = False
                
                if self.oportunidade.status.ordem < novo_status.ordem:
                    self.oportunidade.status = novo_status
                    changed = True
                
                if not self.oportunidade.liberado_orcamento:
                    self.oportunidade.liberado_orcamento = True
                    changed = True
                
                if changed:
                    self.oportunidade.save()
                    print(f"AUTO-SYNC: Oportunidade {self.oportunidade.numero} atualizada via Orçamento ({self.status}).")
            except StatusOportunidade.DoesNotExist:
                pass

class Kit(models.Model):
    orcamento = models.ForeignKey(Orcamento, on_delete=models.CASCADE, related_name='kits')
    nome = models.CharField(max_length=200)
    descricao = models.TextField(blank=True)
    ordem = models.PositiveIntegerField(default=1)

    class Meta:
        verbose_name = "Kit"
        verbose_name_plural = "Kits"
        ordering = ['ordem']

    def __str__(self):
        return self.nome

class ItemOrcamento(models.Model):
    kit = models.ForeignKey(Kit, on_delete=models.CASCADE, related_name='itens')
    produto = models.ForeignKey(Produto, on_delete=models.PROTECT, related_name='itens_orcamento')
    
    # Snapshot (campos obrigatórios, populados via Service)
    codigo = models.CharField(max_length=50)
    descricao = models.CharField(max_length=255)
    quantidade = models.DecimalField(max_digits=12, decimal_places=3)
    custo_unit_snapshot = models.DecimalField(max_digits=15, decimal_places=2)
    
    # Preços e Descontos
    vlr_unit_venda = models.DecimalField(max_digits=15, decimal_places=2)
    desconto_unit_valor = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    desconto_percent_item = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    
    class Meta:
        verbose_name = "Item de Orçamento"
        verbose_name_plural = "Itens de Orçamento"

    def __str__(self):
        return f"{self.codigo} x {self.quantidade}"
