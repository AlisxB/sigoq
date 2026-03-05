from django.db import models
from django.contrib.auth.models import User

class Perfil(models.Model):
    CARGOS = [
        ('VENDEDOR', 'Vendedor'),
        ('ORCAMENTISTA', 'Orçamentista'),
        ('GERENTE', 'Gerente'),
        ('ADMIN', 'Administrador'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='perfil')
    cargo = models.CharField(max_length=20, choices=CARGOS, default='VENDEDOR')
    celular = models.CharField(max_length=20, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.get_cargo_display()}"