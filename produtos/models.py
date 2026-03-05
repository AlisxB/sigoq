from django.db import models
from core.models import BaseModel

class Categoria(models.Model):
    nome = models.CharField(max_length=100, unique=True, verbose_name="Nome da Categoria")
    descricao = models.TextField(blank=True, verbose_name="Descrição")

    class Meta:
        verbose_name = "Categoria"
        verbose_name_plural = "Categorias"

    def __str__(self):
        return self.nome

class Produto(BaseModel):
    UNIDADES = [
        ('UN', 'Unidade'),
        ('M', 'Metro'),
        ('KG', 'Quilograma'),
        ('PC', 'Peça'),
        ('CJ', 'Conjunto'),
    ]

    codigo = models.CharField(max_length=50, unique=True, verbose_name="Código")
    descricao = models.CharField(max_length=255, verbose_name="Descrição")
    categoria = models.ForeignKey(Categoria, on_delete=models.PROTECT, related_name='produtos', verbose_name="Categoria")
    fornecedor = models.ForeignKey('fornecedores.Fornecedor', on_delete=models.PROTECT, related_name='produtos', verbose_name="Fornecedor")
    unidade_medida = models.CharField(max_length=10, choices=UNIDADES, default='UN', verbose_name="Unidade de Medida")
    custo_base = models.DecimalField(max_length=12, max_digits=12, decimal_places=2, verbose_name="Custo Base")
    estoque_minimo = models.PositiveIntegerField(default=0, verbose_name="Estoque Mínimo")
    observacoes = models.TextField(blank=True, verbose_name="Observações")

    class Meta:
        verbose_name = "Produto"
        verbose_name_plural = "Produtos"
        ordering = ['descricao']

    def __str__(self):
        return f"{self.codigo} - {self.descricao}"
