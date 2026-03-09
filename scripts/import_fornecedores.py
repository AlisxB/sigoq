import os
import django
import sys
import openpyxl
import re

# Configuração do ambiente Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sigoq.settings.local')
django.setup()

from fornecedores.models import Fornecedor

def clean_cnpj(value):
    if not value:
        return ""
    return re.sub(r'\D', '', str(value))

def import_fornecedores(file_path):
    if not os.path.exists(file_path):
        print(f"Erro: Arquivo {file_path} não encontrado.")
        return

    print(f"🚀 Iniciando importação de fornecedores a partir de: {file_path}")
    
    try:
        wb = openpyxl.load_workbook(file_path, data_only=True)
        sheet = wb.active
    except Exception as e:
        print(f"Erro ao abrir o arquivo Excel: {e}")
        return

    count_created = 0
    count_updated = 0
    errors = []

    # Pula o cabeçalho
    rows = list(sheet.iter_rows(min_row=2, values_only=True))
    total_rows = len(rows)

    for index, row in enumerate(rows, start=2):
        nome_fantasia, razao_social, cnpj_raw, email, telefone, obs = row

        if not cnpj_raw or not razao_social:
            print(f"⚠️ Linha {index} ignorada: Razão Social ou CNPJ ausentes.")
            continue

        cnpj = clean_cnpj(cnpj_raw)
        
        if len(cnpj) > 14:
            cnpj = cnpj[:14]

        try:
            obj, created = Fornecedor.objects.update_or_create(
                cnpj=cnpj,
                defaults={
                    'razao_social': str(razao_social).strip() if razao_social else "",
                    'nome_fantasia': str(nome_fantasia).strip() if nome_fantasia else "",
                    'email': str(email).strip() if email else "vazio@empresa.com",
                    'telefone': str(telefone).strip() if telefone else "",
                    'observacoes': str(obs).strip() if obs else ""
                }
            )
            
            if created:
                count_created += 1
            else:
                count_updated += 1
                
            if index % 10 == 0:
                print(f"Processando... {index-1}/{total_rows}")

        except Exception as e:
            error_msg = f"Erro na linha {index} (CNPJ: {cnpj_raw}): {str(e)}"
            print(f"❌ {error_msg}")
            errors.append(error_msg)

    print("\n----------------------------------------------------------")
    print(f"✅ Importação Concluída!")
    print(f"📦 Criados: {count_created}")
    print(f"🔄 Atualizados: {count_updated}")
    print(f"⚠️ Erros: {len(errors)}")
    print("----------------------------------------------------------")

if __name__ == "__main__":
    file_name = "fornecedores.xlsx"
    import_fornecedores(file_name)
