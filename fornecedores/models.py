from django.db import models
from core.models import BaseModel

class Fornecedor(BaseModel):
    razao_social = models.CharField(max_length=255, verbose_name="Razão Social")
    nome_fantasia = models.CharField(max_length=255, verbose_name="Nome Fantasia", blank=True)
    cnpj = models.CharField(max_length=18, unique=True, verbose_name="CNPJ")
    email = models.EmailField(verbose_name="E-mail")
    telefone = models.CharField(max_length=20, verbose_name="Telefone")
    contato_nome = models.CharField(max_length=100, blank=True, verbose_name="Nome do Contato")
    prazo_entrega_medio = models.PositiveIntegerField(default=0, help_text="Prazo médio em dias", verbose_name="Prazo de Entrega Médio")
    observacoes = models.TextField(blank=True, verbose_name="Observações")

    class Meta:
        verbose_name = "Fornecedor"
        verbose_name_plural = "Fornecedores"
        ordering = ['razao_social']

    def __str__(self):
        return self.nome_fantasia or self.razao_social
