from django.contrib.auth.mixins import LoginRequiredMixin
from django.core.exceptions import PermissionDenied

class ComercialIsolationMixin(LoginRequiredMixin):
    """
    Mixin para garantir que o usuário só acesse objetos vinculados a ele (vendedor).
    Deve ser usado em DetailView, UpdateView, DeleteView.
    """
    def get_object(self, queryset=None):
        obj = super().get_object(queryset)
        # Se o objeto tiver o campo 'vendedor', validamos
        if hasattr(obj, 'vendedor') and obj.vendedor != self.request.user:
            if not self.request.user.is_superuser:
                raise PermissionDenied("Você não tem permissão para acessar este registro.")
        return obj

    def get_queryset(self):
        qs = super().get_queryset()
        if hasattr(self.model, 'vendedor'):
            if not self.request.user.is_superuser:
                return qs.filter(vendedor=self.request.user)
        return qs
