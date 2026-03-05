from django.shortcuts import get_object_or_404
from django.views.generic import DetailView
from django_weasyprint import WeasyTemplateResponseMixin
from .models import Orcamento

class OrcamentoPDFView(WeasyTemplateResponseMixin, DetailView):
    model = Orcamento
    template_name = 'orcamentos/proposta_pdf.html'
    context_object_name = 'orcamento'
    
    # Nome do arquivo PDF baixado
    def get_pdf_filename(self):
        return f"Proposta_ORC-{self.object.numero:04d}-R{self.object.revisao:02d}.pdf"
