from django.db import models
from core.models import BaseModel

class Cliente(BaseModel):
    razao_social = models.CharField(max_length=255, verbose_name="Razão Social")
    nome_fantasia = models.CharField(max_length=255, verbose_name="Nome Fantasia", blank=True)
    cnpj = models.CharField(max_length=14, unique=True, verbose_name="CNPJ", blank=True, null=True)
    cpf = models.CharField(max_length=11, unique=True, verbose_name="CPF", blank=True, null=True)
    inscricao_estadual = models.CharField(max_length=20, blank=True, verbose_name="Inscrição Estadual")
    email = models.EmailField(verbose_name="E-mail")
    telefone = models.CharField(max_length=20, verbose_name="Telefone")
    endereco = models.TextField(verbose_name="Endereço")
    cidade = models.CharField(max_length=100, verbose_name="Cidade")
    estado = models.CharField(max_length=2, verbose_name="Estado")
    observacoes = models.TextField(blank=True, verbose_name="Observações")

    class Meta:
        verbose_name = "Cliente"
        verbose_name_plural = "Clientes"
        ordering = ['razao_social']

    def __str__(self):
        return self.nome_fantasia or self.razao_social
