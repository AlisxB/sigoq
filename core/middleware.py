import threading
from django.contrib.auth.models import AnonymousUser

_thread_locals = threading.local()

def get_current_user():
    return getattr(_thread_locals, 'user', None)

class ThreadLocalMiddleware:
    """
    Middleware que gerencia o usuário da requisição atual para fins de 
    auditoria e isolamento no BaseModel.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Armazena o usuário na thread local
        user = getattr(request, 'user', None)
        if user and not isinstance(user, AnonymousUser):
            _thread_locals.user = user
        else:
            _thread_locals.user = None

        response = self.get_response(request)

        # Limpa a thread local após a resposta
        _thread_locals.user = None
        
        return response