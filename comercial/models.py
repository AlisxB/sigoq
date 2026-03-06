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
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE, related_name='oportunidades', verbose_name="Cliente")
    status = models.ForeignKey(StatusOportunidade, on_delete=models.PROTECT, related_name='oportunidades', verbose_name="Status")
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
            old_status = Oportunidade.objects.get(pk=self.pk).status

        if not self.numero:
            # Lógica para número sequencial automático
            last_op = Oportunidade.all_objects.all().order_by('numero').last()
            if last_op:
                self.numero = last_op.numero + 1
            else:
                self.numero = 1
        
        super().save(*args, **kwargs)

        # Lógica de Automação: Criar ou Reabrir Orçamento ao entrar em status técnico
        if self.status.notifica_setor_tecnico:
            # Só dispara se mudou de status agora
            if is_new or old_status != self.status:
                from orcamentos.models import Orcamento
                
                # Busca orçamento existente para esta oportunidade
                orcamento_existente = Orcamento.all_objects.filter(oportunidade_id=self.id).first()
                
                if not orcamento_existente:
                    Orcamento.all_objects.create(
                        oportunidade=self,
                        cliente=self.cliente,
                        vendedor=self.vendedor,
                        status='RASCUNHO',
                        margem_contrib=0.2000
                    )
                    print(f"AUTO-ORCAMENTO: Orçamento em Rascunho criado e vinculado para OP {self.numero}")
                else:
                    # Se já existe e está como ENVIADO ou APROVADO, reseta para RASCUNHO para reedição
                    if orcamento_existente.status in ['ENVIADO', 'APROVADO']:
                        orcamento_existente.status = 'RASCUNHO'
                        orcamento_existente.save()
                        print(f"REABERTURA: Orçamento {orcamento_existente.numero} resetado para RASCUNHO pois OP {self.numero} voltou para a Engenharia.")
                
        # Lógica de notificação legacy (opcional manter)
        if not is_new and old_status != self.status and self.status.notifica_setor_tecnico:
            print(f"NOTIFICAÇÃO: Setor Técnico avisado sobre Oportunidade {self.numero}")
