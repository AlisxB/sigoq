from django.db import models
from django.conf import settings
from core.models import BaseModel
from clientes.models import Cliente

class StatusOportunidade(models.Model):
    ORDEM_CHOICES = [(i, str(i)) for i in range(1, 11)]
    
    nome = models.CharField(max_length=100, unique=True, verbose_name="Nome do Status")
    cor = models.CharField(max_length=7, default="#3498db", help_text="Cor em Hexadecimal")
    ordem = models.PositiveIntegerField(choices=ORDEM_CHOICES, default=1, verbose_name="Ordem no Kanban")
    notifica_setor_tecnico = models.BooleanField(default=False, verbose_name="Notifica setor técnico?")

    class Meta:
        verbose_name = "Status de Oportunidade"
        verbose_name_plural = "Status de Oportunidades"
        ordering = ['ordem']

    def __str__(self):
        return f"{self.ordem} - {self.nome}"

class MetaMensal(models.Model):
    MESES_CHOICES = [
        (1, 'Janeiro'), (2, 'Fevereiro'), (3, 'Março'), (4, 'Abril'),
        (5, 'Maio'), (6, 'Junho'), (7, 'Julho'), (8, 'Agosto'),
        (9, 'Setembro'), (10, 'Outubro'), (11, 'Novembro'), (12, 'Dezembro'),
    ]
    
    mes = models.PositiveSmallIntegerField(choices=MESES_CHOICES, verbose_name="Mês")
    ano = models.PositiveIntegerField(default=2026, verbose_name="Ano")
    valor_meta = models.DecimalField(max_digits=15, decimal_places=2, verbose_name="Valor da Meta (R$)")
    vendedor = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        null=True, blank=True, 
        related_name='metas',
        help_text="Deixe em branco para meta GLOBAL da empresa."
    )

    class Meta:
        verbose_name = "Meta Mensal"
        verbose_name_plural = "Metas Mensais"
        unique_together = ('mes', 'ano', 'vendedor')
        ordering = ['-ano', '-mes']

    def __str__(self):
        vendedor_str = self.vendedor.get_full_name() if self.vendedor else "GLOBAL"
        return f"{vendedor_str} | {self.get_mes_display()}/{self.ano} - R$ {self.valor_meta}"

class Oportunidade(BaseModel):
    PRIORIDADE_CHOICES = [
        ('BAIXA', 'Baixa'),
        ('MEDIA', 'Média'),
        ('ALTA', 'Alta'),
    ]
    
    FONTE_CHOICES = [
        ('INDICACAO', 'Indicação'),
        ('SITE', 'Site'),
        ('PROSPECCAO', 'Prospecção'),
        ('WHATSAPP', 'WhatsApp'),
        ('OUTRO', 'Outro'),
    ]

    numero = models.PositiveIntegerField(unique=True, editable=False, verbose_name="Nº Oportunidade")
    titulo = models.CharField(max_length=300, verbose_name="Título")
    descricao = models.TextField(blank=True, verbose_name="Descrição")
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE, related_name='oportunidades', verbose_name="Cliente", db_index=True)
    status = models.ForeignKey(StatusOportunidade, on_delete=models.PROTECT, related_name='oportunidades', verbose_name="Status", db_index=True)
    valor_estimado = models.DecimalField(max_digits=15, decimal_places=2, default=0.00, verbose_name="Valor Estimado")
    margem_lucro = models.DecimalField(max_digits=5, decimal_places=2, default=0.00, verbose_name="Margem de Lucro (%)")
    probabilidade = models.PositiveIntegerField(default=50, help_text="0-100%", verbose_name="Probabilidade (%)")
    data_prevista_fechamento = models.DateField(null=True, blank=True, verbose_name="Previsão de Fechamento")
    fonte = models.CharField(max_length=20, choices=FONTE_CHOICES, default='SITE', verbose_name="Fonte")
    prioridade = models.CharField(max_length=10, choices=PRIORIDADE_CHOICES, default='MEDIA', verbose_name="Prioridade")
    vendedor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='oportunidades', verbose_name="Vendedor")

    class Meta:
        verbose_name = "Oportunidade"
        verbose_name_plural = "Oportunidades"
        ordering = ['-numero']

    def __str__(self):
        return f"OP-{self.numero:04d} | {self.titulo}"

    def save(self, *args, **kwargs):
        is_new = not self.pk
        old_status = None
        if not is_new:
            try:
                old_status = Oportunidade.objects.get(pk=self.pk).status
            except Oportunidade.DoesNotExist:
                pass

        if not self.numero:
            last_op = Oportunidade.all_objects.all().order_by('numero').last()
            self.numero = (last_op.numero + 1) if last_op else 1
        
        super().save(*args, **kwargs)

        # Importação tardia para evitar recursão
        from orcamentos.models import Orcamento

        # 1. Lógica para Status Técnico (Engenharia)
        if self.status.notifica_setor_tecnico:
            if is_new or old_status != self.status:
                orcamento_existente = Orcamento.all_objects.filter(oportunidade_id=self.id).first()
                if not orcamento_existente:
                    Orcamento.all_objects.create(
                        oportunidade=self,
                        cliente=self.cliente,
                        vendedor=self.vendedor,
                        status='RASCUNHO',
                        margem_contrib=0.2000
                    )
                else:
                    if orcamento_existente.status in ['ENVIADO', 'APROVADO']:
                        orcamento_existente.status = 'RASCUNHO'
                        orcamento_existente.save()

        # 2. Lógica para Fechamento (Ganho ou Perda)
        if not is_new and old_status != self.status:
            # Fechado/Ganho (ID 5 no sistema padrão)
            if self.status.id == 5:
                Orcamento.objects.filter(oportunidade_id=self.id, status='ENVIADO').update(status='APROVADO')
                print(f"AUTO-SYNC: Orçamento da OP {self.numero} aprovado automaticamente.")
            
            # Perdido (ID 6 no sistema padrão)
            elif self.status.id == 6:
                Orcamento.objects.filter(oportunidade_id=self.id).update(status='REPROVADO')

def upload_path_oportunidade(instance, filename):
    return f'oportunidades/OP_{instance.oportunidade.numero:04d}/{filename}'

class ArquivoOportunidade(models.Model):
    oportunidade = models.ForeignKey(Oportunidade, on_delete=models.CASCADE, related_name='arquivos')
    arquivo = models.FileField(upload_to=upload_path_oportunidade)
    nome_original = models.CharField(max_length=255)
    caminho_relativo = models.CharField(max_length=500, default="", help_text="Preserva a estrutura de pastas original")
    extensao = models.CharField(max_length=15, blank=True)
    tamanho = models.BigIntegerField(default=0, help_text="Tamanho em bytes")
    criado_em = models.DateTimeField(auto_now_add=True)
    enviado_por = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        verbose_name = "Arquivo da Oportunidade"
        verbose_name_plural = "Arquivos da Oportunidade"
        ordering = ['caminho_relativo', 'nome_original']

    def __str__(self):
        return f"{self.caminho_relativo}{self.nome_original}"

    def save(self, *args, **kwargs):
        if not self.extensao and self.arquivo:
            import os
            self.extensao = os.path.splitext(self.arquivo.name)[1].lower()
        if not self.tamanho and self.arquivo:
            self.tamanho = self.arquivo.size
        super().save(*args, **kwargs)
