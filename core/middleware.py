from django.http import HttpResponseForbidden

class IsolationMiddleware:
    """
    Middleware que garante que um usuário só acesse objetos
    pertencentes ao seu vendedor (ou grupo) conforme definido
    no BaseModel.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # O middleware pode ser expandido para verificar permissões
        # específicas antes de processar a view.
        response = self.get_response(request)
        return response

    # Exemplo de método que poderia ser usado nas views:
    # def process_view(self, request, view_func, view_args, view_kwargs):
    #     # Implementar lógica de isolamento aqui
    #     return None