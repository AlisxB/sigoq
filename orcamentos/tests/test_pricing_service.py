import pytest
from decimal import Decimal
from django.contrib.auth import get_user_model
from orcamentos.models import Orcamento, Kit, ItemOrcamento, ConfiguracaoPreco
from orcamentos.services import PricingService
from produtos.models import Produto, Categoria
from clientes.models import Cliente

User = get_user_model()

@pytest.fixture
def test_user(db):
    return User.objects.create_user(username='test_user', password='password123')

@pytest.fixture
def setup_data(db, test_user):
    # Cliente e Produto para teste
    cli = Cliente.objects.create(razao_social="Cliente Teste", cnpj="12345678901234")
    cat = Categoria.objects.create(nome="Painéis")
    prod = Produto.objects.create(
        codigo="CAB-001", descricao="Cabo Flexível", 
        custo_base=Decimal('10.00'), categoria=cat
    )
    
    # Configuração de Preço
    config = ConfiguracaoPreco.objects.create(
        nome="Padrão", markup_imposto=Decimal('0.15'), 
        markup_engenharia=Decimal('0.10'), ativo=True
    )
    
    # Orçamento Inicial
    orc = Orcamento.objects.create(
        cliente=cli, vendedor=test_user, margem_contrib=Decimal('0.20')
    )
    kit = Kit.objects.create(orcamento=orc, nome="Painel de Controle")
    
    return {'orc': orc, 'kit': kit, 'prod': prod, 'config': config}

@pytest.mark.django_db
def test_create_item_snapshot(setup_data):
    """Garante que o snapshot do produto é tirado corretamente."""
    kit = setup_data['kit']
    prod = setup_data['prod']
    
    item = PricingService.create_item_snapshot(kit, prod, Decimal('5.0'))
    
    # Verifica snapshot físico
    assert item.codigo == prod.codigo
    assert item.descricao == prod.descricao
    assert item.custo_unit_snapshot == prod.custo_base
    
    # Verifica se o preço de venda foi calculado inicialmente
    # Encargos (0.15 + 0.10) = 0.25, Margem = 0.20, Divisor = 0.55
    # 10 / 0.55 = 18.18
    assert item.vlr_unit_venda == Decimal('18.18')

@pytest.mark.django_db
def test_recalculate_orcamento_totals(setup_data):
    """Garante que o total do orçamento é a soma de todos os itens."""
    orc = setup_data['orc']
    kit = setup_data['kit']
    prod = setup_data['prod']
    
    # Adiciona 2 itens iguais (Total Venda = 18.18 * 5 = 90.90 cada)
    item1 = PricingService.create_item_snapshot(kit, prod, Decimal('5.0'))
    item2 = PricingService.create_item_snapshot(kit, prod, Decimal('5.0'))
    
    PricingService.recalculate_orcamento(orc)
    orc.refresh_from_db()
    
    # Total Venda = 90.90 + 90.90 = 181.80
    assert orc.valor_total == Decimal('181.80')
    assert orc.custo_total == Decimal('100.00') # 2 * 10 * 5

@pytest.mark.django_db
def test_clone_revision(setup_data):
    """Garante que a revisão clonada mantém a integridade dos itens."""
    orc = setup_data['orc']
    kit = setup_data['kit']
    prod = setup_data['prod']
    item = PricingService.create_item_snapshot(kit, prod, Decimal('10'))
    PricingService.recalculate_orcamento(orc)
    
    # Clone
    new_orc = PricingService.clone_revision(orc)
    
    assert new_orc.numero == orc.numero
    assert new_orc.revisao == orc.revisao + 1
    assert new_orc.status == 'RASCUNHO'
    assert new_orc.kits.count() == 1
    assert new_orc.kits.first().itens.count() == 1
    assert new_orc.valor_total == orc.valor_total
