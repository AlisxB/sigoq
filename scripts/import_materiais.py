import os
import django
import sys
import openpyxl
from decimal import Decimal
import uuid

# Setup django environment
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "sigoq.settings.local")

try:
    django.setup()
    from produtos.models import Produto, Categoria
    from fornecedores.models import Fornecedor

    # Mapeamento de nomes do Excel para nomes formais no Banco (Deduplicação)
    SUPPLIER_MAP = {
        '3M': '3M do Brasil LTDA',
        'ABB': 'ABB Eletrificação LTDA',
        'ALTUS / FATEK': 'Altus Sistemas de Automação S.A.',
        'BALESTRO': 'Indústria Eletromecânica Balestro LTDA',
        'BRUM': 'Brum Metalurgia (Brum Prestadora de Serviços...)',
        'BUSSMAN': 'Bussmann',
        'BUSSMANN': 'Bussmann',
        'CARMEHIL': 'Carmehil Comercial Elétrica LTDA',
        'CARTHOMS': 'Carthom\'s Eletro Metalúrgica LTDA',
        'CEMAR': 'Legrand Brasil LTDA (Pial Legrand)',
        'CHINT': 'Chint (Brasil) LTDA',
        'CLAMPER': 'Clamper Indústria e Comércio S.A.',
        'CM': 'CM Comandos Lineares LTDA',
        'COEL': 'Coel Controles Elétricos LTDA',
        'CONNECTWELL': 'Connectwell do Brasil Comp. Elétricos LTDA',
        'DIM': 'Dim Equipamentos LTDA',
        'DIV.': 'Divisão Automação (Weg Equipamentos)',
        'EDA4': 'Importadora Eda LTDA',
        'ELITEK': 'Elitek Disjuntores Elétricos LTDA',
        'EMBRASTEC': 'Embrastec Indústria e Comércio LTDA',
        'EXATA': 'Exata Calibração de Instrumentos LTDA',
        'FAMATEL': 'Famatel Br Comércio de Mat. Elétrico LTDA',
        'ISELETRICA': 'Iseletrica LTDA',
        'ISOLET': 'Isolet Indústria e Comércio LTDA',
        'INTELBRAS': 'Intelbras S.A. Indústria de Telecomunicação',
        'JNG': 'JNG Materiais Elétricos',
        'KRON': 'Kron Instrumentos Elétricos LTDA',
        'METALTEX': 'Produtos Eletrônicos Metaltex LTDA',
        'MORAN': 'Moran Elétrica LTDA',
        'MSF': 'MSF Soluções em Quadros Elétricos LTDA',
        'MULTINST': 'Mult Inst. Controles Elétricos LTDA',
        'MINUZZI': 'Transformadores Minuzzi LTDA',
        'OLFE ELETRIC': 'Olfe Eletric Transformadores LTDA',
        'PHOENIX CONTACT': 'Phoenix Contact Indústria e Comércio LTDA',
        'PRÇ': 'P.R.C Indução LTDA',
        'PFANNENBERG': 'Pfannenberg do Brasil Ind. e Com. LTDA',
        'PIAL LEGRAND': 'Legrand Brasil LTDA',
        'QUALITA': 'Qualita Indústria e Comércio LTDA',
        'RITTAL': 'Rittal LTDA',
        'SCHNEIDER': 'Schneider Electric Brasil LTDA',
        'SERILOS': 'Comércio e Serviços de Placas LTDA',
        'SIBRATEC': 'CCA Indústria e Comércio de Mat. Elétricos',
        'SICK': 'Solução em Sensores LTDA',
        'SOL': 'Sol Materiais Elétricos LTDA',
        'STECK': 'Steck Indústria Elétrica LTDA',
        'STRAHL': 'Strahl Indústria e Comércio LTDA',
        'SV ELÉTRICA': 'SV Comércio de Material Elétrico LTDA',
        'SIEMENS': 'Siemens Brasil LTDA',
        'TASCO': 'Tasco Limitada',
        'TRON': 'Tron Controles Elétricos LTDA',
        'TSK': 'Tsk Energia e Desenvolvimento LTDA',
        'VOLTZ': 'Voltz Materiais Elétricos LTDA',
        'WAGO': 'Wago Eletroeletrônicos LTDA',
        'WEG': 'WEG S.A.',
        'WEINTEK': 'Veder do Brasil (Distribuidor Principal)'
    }

    def clean_text(value):
        if value is None:
            return ""
        text = str(value).strip()
        if text.startswith('#'):
            return ""
        return text

    def get_unidade_medida(un_str):
        if not un_str:
            return 'UN'
        un_str = un_str.strip().upper()
        mapping = {
            'UND': 'UN', 'UN': 'UN', 'UNID': 'UN', 'UNIDADE': 'UN',
            'M': 'M', 'MT': 'M', 'METRO': 'M',
            'KG': 'KG', 'KILO': 'KG',
            'PC': 'PC', 'PEÇA': 'PC',
            'CJ': 'CJ', 'CONJUNTO': 'CJ'
        }
        return mapping.get(un_str, 'UN')

    def get_supplier_robust(name):
        name_clean = clean_text(name).upper()
        if not name_clean or name_clean == 'GERAL':
            return Fornecedor.objects.get_or_create(razao_social='Geral', defaults={'nome_fantasia': 'Geral', 'cnpj': '00000000000000'})[0]

        # 1. Tenta via Mapa Hardcoded
        formal_name = SUPPLIER_MAP.get(name_clean)
        if formal_name:
            f = Fornecedor.objects.filter(razao_social__iexact=formal_name).first()
            if f: return f

        # 2. Tenta busca exata por Razao ou Fantasia
        f = Fornecedor.objects.filter(razao_social__iexact=name_clean).first() or \
            Fornecedor.objects.filter(nome_fantasia__iexact=name_clean).first()
        if f: return f

        # 3. Tenta busca parcial (contém)
        f = Fornecedor.objects.filter(razao_social__icontains=name_clean).first() or \
            Fornecedor.objects.filter(nome_fantasia__icontains=name_clean).first()
        if f: return f

        # 4. Fallback: Cria se não existir (mas tenta ser inteligente)
        import hashlib
        fake_cnpj = hashlib.md5(name_clean.encode()).hexdigest()[:14]
        forn, _ = Fornecedor.objects.get_or_create(
            razao_social=name_clean,
            defaults={
                'nome_fantasia': name_clean,
                'cnpj': fake_cnpj,
                'email': f'contato@{name_clean.lower().replace(" ", "")}.com.br',
                'telefone': '0000000000'
            }
        )
        return forn

    def import_materials(file_path):
        if not os.path.exists(file_path):
            print(f"Erro: Arquivo {file_path} não encontrado.")
            return

        print(f"Iniciando importação inteligente de {file_path}...")
        wb = openpyxl.load_workbook(file_path, data_only=True)
        sheet = wb.active

        count_created = 0
        count_updated = 0
        
        categorias_cache = {}
        rows = list(sheet.iter_rows(min_row=2))
        total_rows = len(rows)

        for i, row in enumerate(rows):
            try:
                ref_forn = clean_text(row[1].value)
                codigo_raw = clean_text(row[2].value)
                descricao = clean_text(row[3].value)
                un_raw = clean_text(row[4].value)
                fabricante_nome = clean_text(row[5].value)
                custo_raw = row[6].value
                categoria_nome = clean_text(row[7].value) or "Diversos"

                codigo = codigo_raw or ref_forn
                if not codigo:
                    codigo = f"AUTO-{str(uuid.uuid4())[:8].upper()}"

                if not descricao:
                    descricao = f"Material Ref: {ref_forn}" if ref_forn else f"Material Cod: {codigo_raw}"

                # Categoria
                if categoria_nome not in categorias_cache:
                    cat, _ = Categoria.objects.get_or_create(nome=categoria_nome)
                    categorias_cache[categoria_nome] = cat
                categoria = categorias_cache[categoria_nome]

                # Fornecedor Inteligente
                fornecedor = get_supplier_robust(fabricante_nome)

                # Custo
                try:
                    custo = Decimal(str(custo_raw)) if custo_raw is not None and not str(custo_raw).startswith('#') else Decimal('0.00')
                except:
                    custo = Decimal('0.00')

                produto, created = Produto.objects.update_or_create(
                    codigo=codigo,
                    defaults={
                        'descricao': descricao[:250],
                        'categoria': categoria,
                        'fornecedor': fornecedor,
                        'unidade_medida': get_unidade_medida(un_raw),
                        'custo_base': custo,
                        'observacoes': f"Importado via script. Ref Forn: {ref_forn}"
                    }
                )

                if created: count_created += 1
                else: count_updated += 1

                if (i + 1) % 100 == 0:
                    print(f"Progresso: {i+1}/{total_rows}...")

            except Exception as e:
                print(f"Erro crítico na linha {i+2}: {e}")

        print(f"\nImportação concluída! Criados: {count_created} | Atualizados: {count_updated}")

    if __name__ == "__main__":
        import_materials('materiais.xlsx')

except Exception as e:
    print(f"Erro ao inicializar script: {e}")
    sys.exit(1)
