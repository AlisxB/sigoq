import os
import django
import sys
import openpyxl
from decimal import Decimal

# Setup django environment
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "sigoq.settings.local")

try:
    django.setup()
    from produtos.models import Produto, Categoria
    from fornecedores.models import Fornecedor

    def get_unidade_medida(un_str):
        if not un_str:
            return 'UN'
        un_str = un_str.strip().upper()
        mapping = {
            'UND': 'UN',
            'UN': 'UN',
            'UNID': 'UN',
            'UNIDADE': 'UN',
            'M': 'M',
            'MT': 'M',
            'METRO': 'M',
            'KG': 'KG',
            'KILO': 'KG',
            'PC': 'PC',
            'PEÇA': 'PC',
            'CJ': 'CJ',
            'CONJUNTO': 'CJ'
        }
        return mapping.get(un_str, 'UN')

    def import_materials(file_path):
        if not os.path.exists(file_path):
            print(f"Erro: Arquivo {file_path} não encontrado.")
            return

        print(f"Iniciando importação de {file_path}...")
        wb = openpyxl.load_workbook(file_path, data_only=True)
        sheet = wb.active

        count_created = 0
        count_updated = 0
        
        # Cache para evitar múltiplas consultas
        categorias_cache = {}
        fornecedores_cache = {}

        # Pular cabeçalho
        rows = list(sheet.iter_rows(min_row=2))
        total_rows = len(rows)

        for i, row in enumerate(rows):
            try:
                # [Nº, Ref. Fornecedor, Código, Descrição, Un, Fabricante, Custo, Categoria, Ult. Cotação]
                ref_forn = str(row[1].value) if row[1].value else ""
                codigo_raw = str(row[2].value) if row[2].value else ""
                descricao = str(row[3].value) if row[3].value else ""
                un_raw = str(row[4].value) if row[4].value else "UN"
                fabricante_nome = str(row[5].value) if row[5].value else "Geral"
                custo_raw = row[6].value or 0
                categoria_nome = str(row[7].value) if row[7].value else "Diversos"

                # Definir código único
                codigo = codigo_raw or ref_forn
                if not codigo:
                    print(f"Linha {i+2}: Pulada (Sem código)")
                    continue

                # Garantir Categoria
                if categoria_nome not in categorias_cache:
                    cat, _ = Categoria.objects.get_or_create(nome=categoria_nome)
                    categorias_cache[categoria_nome] = cat
                categoria = categorias_cache[categoria_nome]

                # Garantir Fornecedor (Fabricante)
                if fabricante_nome not in fornecedores_cache:
                    # Gerar um CNPJ fictício baseado no nome se não existir
                    import hashlib
                    hash_obj = hashlib.md5(fabricante_nome.encode())
                    fake_cnpj = hash_obj.hexdigest()[:14]
                    
                    forn, created = Fornecedor.objects.get_or_create(
                        razao_social=fabricante_nome,
                        defaults={
                            'nome_fantasia': fabricante_nome,
                            'cnpj': fake_cnpj,
                            'email': f'contato@{fabricante_nome.lower().replace(" ", "")}.com.br',
                            'telefone': '0000000000'
                        }
                    )
                    fornecedores_cache[fabricante_nome] = forn
                fornecedor = fornecedores_cache[fabricante_nome]

                # Preparar dados do Produto
                unidade = get_unidade_medida(un_raw)
                
                # Tratar custo (evitar erros com #REF! ou textos)
                try:
                    custo = Decimal(str(custo_raw)) if custo_raw is not None else Decimal('0.00')
                except:
                    custo = Decimal('0.00')
                    print(f"Linha {i+2}: Custo inválido ({custo_raw}), definido como 0.00")

                # Criar ou Atualizar
                produto, created = Produto.objects.update_or_create(
                    codigo=codigo,
                    defaults={
                        'descricao': descricao,
                        'categoria': categoria,
                        'fornecedor': fornecedor,
                        'unidade_medida': unidade,
                        'custo_base': custo,
                        'observacoes': f"Importado via script. Ref Forn: {ref_forn}"
                    }
                )

                if created:
                    count_created += 1
                else:
                    count_updated += 1

                if (i + 1) % 100 == 0:
                    print(f"Progresso: {i+1}/{total_rows}...")

            except Exception as e:
                print(f"Erro na linha {i+2}: {e}")

        print(f"\nImportação concluída!")
        print(f"Criados: {count_created}")
        print(f"Atualizados: {count_updated}")

    if __name__ == "__main__":
        import_materials('materiais.xlsx')

except Exception as e:
    print(f"Erro ao inicializar script: {e}")
    sys.exit(1)
