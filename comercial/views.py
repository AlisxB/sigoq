import json
from django.shortcuts import render
from django.views.generic import ListView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .models import Oportunidade, StatusOportunidade

class KanbanView(LoginRequiredMixin, ListView):
    model = Oportunidade
    template_name = 'comercial/kanban.html'
    context_object_name = 'oportunidades'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['status_list'] = StatusOportunidade.objects.all().order_by('ordem')
        return context

    def get_queryset(self):
        # Aplicar isolamento de vendedor
        return Oportunidade.objects.filter(vendedor=self.request.user)

@method_decorator(csrf_exempt, name='dispatch')
class OportunidadeUpdateStatusView(LoginRequiredMixin, ListView):
    def post(self, request, *args, **kwargs):
        try:
            data = json.loads(request.body)
            op_id = data.get('oportunidade_id')
            new_status_id = data.get('status_id')
            
            oportunidade = Oportunidade.all_objects.get(id=op_id, vendedor=request.user)
            new_status = StatusOportunidade.objects.get(id=new_status_id)
            
            oportunidade.status = new_status
            oportunidade.save()
            
            return JsonResponse({'status': 'success'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
