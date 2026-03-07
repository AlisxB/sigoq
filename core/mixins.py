from django.contrib.auth.mixins import LoginRequiredMixin
from django.core.exceptions import PermissionDenied

class ComercialIsolationMixin(LoginRequiredMixin):
    """
    Mixin para garantir que o usuário só acesse objetos vinculados a ele (vendedor).
    Deve ser usado em DetailView, UpdateView, DeleteView.
    """
    def get_object(self, queryset=None):
        obj = super().get_object(queryset)
        user = self.request.user
        
        is_privileged = user.is_superuser or (
            hasattr(user, 'perfil') and 
            user.perfil.cargo in ['ADMIN', 'GERENTE', 'ORCAMENTISTA']
        )
        
        # Se o objeto tiver o campo 'vendedor', validamos
        if not is_privileged and hasattr(obj, 'vendedor') and obj.vendedor != user:
            raise PermissionDenied("Você não tem permissão para acessar este registro.")
        return obj

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        
        is_privileged = user.is_superuser or (
            hasattr(user, 'perfil') and 
            user.perfil.cargo in ['ADMIN', 'GERENTE', 'ORCAMENTISTA']
        )
        
        if not is_privileged and hasattr(self.model, 'vendedor'):
            return qs.filter(vendedor=user)
        return qs
