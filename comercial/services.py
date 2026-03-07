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
    def generate_zip(oportunidade, sub_path=None):
        """
        Gera um buffer de bytes contendo um arquivo ZIP com os arquivos da oportunidade.
        Se sub_path for fornecido, filtra apenas os arquivos daquela pasta (e subpastas).
        """
        buffer = io.BytesIO()
        arquivos = oportunidade.arquivos.all()
        
        if sub_path:
            # Normaliza o path para garantir que termine com / para o filtro
            search_path = sub_path if sub_path.endswith('/') else f"{sub_path}/"
            arquivos = arquivos.filter(caminho_relativo__startswith=search_path)

        if not arquivos.exists():
            return None

        with zipfile.ZipFile(buffer, 'w', zipfile.ZIP_DEFLATED) as z:
            for arquiv_obj in arquivos:
                if not arquiv_obj.arquivo:
                    continue
                
                # O caminho dentro do ZIP deve ser a estrutura original
                # Remove o prefixo da pasta superior se estivermos baixando uma pasta específica
                arcname = os.path.join(arquiv_obj.caminho_relativo, arquiv_obj.nome_original)
                if sub_path:
                    # Ex: se sub_path é "PastaA/" e o arquivo é "PastaA/Sub/doc.pdf"
                    # o arcname deve virar "Sub/doc.pdf"
                    arcname = os.path.relpath(arcname, sub_path)

                z.writestr(arcname, arquiv_obj.arquivo.read())
        
        buffer.seek(0)
        return buffer
