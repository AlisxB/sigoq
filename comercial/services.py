import os
import zipfile
import io
from django.core.files.base import ContentFile
from .models import ArquivoOportunidade

class FileManagementService:
    @staticmethod
    def process_upload(oportunidade, files, user=None):
        """
        Processa uma lista de arquivos enviados.
        Cada item em 'files' deve ser um dicionário ou objeto contendo:
        - file: O objeto de arquivo do Django
        - relative_path: O caminho relativo da pasta (opcional)
        """
        created_files = []
        
        for file_data in files:
            uploaded_file = file_data.get('file')
            relative_path = file_data.get('relative_path', '')
            
            # Se for um arquivo ZIP, podemos decidir se extraímos aqui ou tratamos como um arquivo só.
            # Baseado na nossa estratégia "Melhor dos Dois Mundos", vamos extrair.
            if uploaded_file.name.lower().endswith('.zip'):
                extracted = FileManagementService.handle_zip_extraction(
                    oportunidade, uploaded_file, relative_path, user
                )
                created_files.extend(extracted)
            else:
                # Arquivo comum
                arquivo_obj = ArquivoOportunidade.objects.create(
                    oportunidade=oportunidade,
                    arquivo=uploaded_file,
                    nome_original=uploaded_file.name,
                    caminho_relativo=relative_path,
                    enviado_por=user
                )
                created_files.append(arquivo_obj)
                
        return created_files

    @staticmethod
    def handle_zip_extraction(oportunidade, zip_file, base_relative_path, user=None):
        """
        Extrai o conteúdo de um arquivo ZIP e cria registros individuais.
        """
        extracted_objects = []
        
        with zipfile.ZipFile(zip_file, 'r') as z:
            for member in z.infolist():
                if member.is_dir():
                    continue
                
                # Obtém o conteúdo do arquivo
                with z.open(member) as f:
                    content = f.read()
                    
                # Prepara o nome e o caminho relativo
                filename = os.path.basename(member.filename)
                # O member.filename já contém a estrutura de pastas interna do ZIP
                internal_path = os.path.dirname(member.filename)
                
                # Combina o caminho base do upload com o caminho interno do ZIP
                full_relative_path = os.path.join(base_relative_path, internal_path)
                if full_relative_path and not full_relative_path.endswith('/'):
                    full_relative_path += '/'
                
                # Cria o arquivo no Django
                django_file = ContentFile(content, name=filename)
                
                arquivo_obj = ArquivoOportunidade.objects.create(
                    oportunidade=oportunidade,
                    arquivo=django_file,
                    nome_original=filename,
                    caminho_relativo=full_relative_path,
                    enviado_por=user
                )
                extracted_objects.append(arquivo_obj)
                
        return extracted_objects
