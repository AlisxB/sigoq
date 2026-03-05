from django.db import models
from django.conf import settings

class BaseModel(models.Model):
    """
    Modelo base que inclui referência ao vendedor (usuário) e
    um manager customizado para aplicar filtro de isolamento.
    """
    vendedor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="%(class)s_vendedor",
        help_text="Vendedor responsável pelo registro."
    )

    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        # Garantir que o vendedor seja definido caso não exista
        if not self.vendedor_id and hasattr(self, 'request_user'):
            self.vendedor = self.request_user
        super().save(*args, **kwargs)