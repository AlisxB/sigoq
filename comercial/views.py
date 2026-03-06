import json
from django.shortcuts import render, get_object_or_404
from django.views.generic import ListView, View
from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.template.loader import render_to_string
from weasyprint import HTML

from core.mixins import ComercialIsolationMixin
from .models import Oportunidade, StatusOportunidade

class KanbanView(ComercialIsolationMixin, ListView):
    model = Oportunidade
    template_name = 'comercial/kanban.html'
    context_object_name = 'oportunidades'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['status_list'] = StatusOportunidade.objects.all().order_by('ordem')
        return context

@method_decorator(csrf_exempt, name='dispatch')
class OportunidadeUpdateStatusView(View):
    def post(self, request, *args, **kwargs):
        try:
            data = json.loads(request.body)
            # Support both id and oportunidade_id for flexibility
            op_id = data.get('id') or data.get('oportunidade_id')
            new_status_id = data.get('status_id')
            
            oportunidade = Oportunidade.all_objects.get(id=op_id)
            
            # Bloqueia movimentação manual se o status atual for de "notificação técnica"
            if oportunidade.status.notifica_setor_tecnico:
                return JsonResponse({
                    'status': 'error', 
                    'message': f'Esta oportunidade está travada no status {oportunidade.status.nome} aguardando liberação do setor de orçamentos.'
                }, status=403)

            # Se não estiver logado ou não for admin, segue direto (dev mode)
            if request.user.is_authenticated and not request.user.is_superuser and oportunidade.vendedor != request.user:
                return JsonResponse({'status': 'error', 'message': 'Não autorizado'}, status=403)
                
            new_status = StatusOportunidade.objects.get(id=new_status_id)
            
            oportunidade.status = new_status
            oportunidade.save()
            
            return JsonResponse({'status': 'success'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

class OportunidadePDFView(View):
    def get(self, request, pk):
        oportunidade = get_object_or_404(Oportunidade, pk=pk)
        
        # Validação de acesso apenas para usuários logados
        if request.user.is_authenticated and not request.user.is_superuser and oportunidade.vendedor != request.user:
            return HttpResponse("Não autorizado", status=403)

        context = {
            'oportunidade': oportunidade,
        }
        
        html_string = render_to_string('pdf/proposta.html', context)
        html = HTML(string=html_string)
        pdf = html.write_pdf()
        
        response = HttpResponse(pdf, content_type='application/pdf')
        response['Content-Disposition'] = f'inline; filename="Proposta_OP_{oportunidade.numero:04d}.pdf"'
        
        return response
