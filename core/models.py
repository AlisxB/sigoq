from django.db import models
from django.conf import settings
from django.utils import timezone

class SoftDeleteManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(is_deleted=False)

class BaseModel(models.Model):
    """
    Modelo base que inclui referência ao vendedor (usuário),
    audit trail e suporte a soft-delete.
    """
    vendedor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="%(class)s_vendedor",
        help_text="Vendedor responsável pelo registro.",
        db_index=True
    )
    is_deleted = models.BooleanField(default=False, verbose_name="Excluído?")
    deleted_at = models.DateTimeField(null=True, blank=True, verbose_name="Data de Exclusão")
    criado_em = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")
    atualizado_em = models.DateTimeField(auto_now=True, verbose_name="Atualizado em")

    objects = SoftDeleteManager()
    all_objects = models.Manager()

    class Meta:
        abstract = True

    def delete(self, using=None, keep_parents=False):
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save()

    def hard_delete(self):
        super().delete()

    def save(self, *args, **kwargs):
        # Atribui o vendedor automaticamente apenas se ele for nulo
        if self.vendedor_id is None:
            from .middleware import get_current_user
            user = get_current_user()
            if user:
                self.vendedor = user
        super().save(*args, **kwargs)