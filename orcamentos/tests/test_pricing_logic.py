import pytest
from decimal import Decimal
from orcamentos.logic.pricing import (
    calculate_total_encargos,
    calculate_unit_selling_price,
    calculate_item_totals,
    check_low_margin
)

def test_calculate_total_encargos():
    """Valida se a soma de markups está correta."""
    res = calculate_total_encargos(
        Decimal('0.10'), Decimal('0.05'), Decimal('0.03'), 
        Decimal('0.15'), Decimal('0.05')
    )
    assert res == Decimal('0.38')

def test_calculate_unit_selling_price_standard():
    """Valida a fórmula base: Venda = Custo / (1 - (Encargos + Margem))."""
    custo = Decimal('100.00')
    encargos = Decimal('0.38') # 38%
    margem = Decimal('0.12')   # 12%
    # Divisor = 1 - (0.38 + 0.12) = 0.50
    # Venda = 100 / 0.50 = 200
    res = calculate_unit_selling_price(custo, encargos, margem)
    assert res == Decimal('200.00')

def test_calculate_unit_selling_price_impossible_margin():
    """Garante que margens impossíveis (> 100%) não causem erro 500."""
    custo = Decimal('100.00')
    encargos = Decimal('0.80')
    margem = Decimal('0.30')
    # Soma = 1.10 (Margem negativa teórica)
    # Deve usar o fallback de divisor 0.01 definido na lógica pura
    res = calculate_unit_selling_price(custo, encargos, margem)
    assert res == Decimal('10000.00') # 100 / 0.01

def test_calculate_item_totals_with_discount():
    """Valida o cálculo de totais de um item com desconto."""
    venda_unit = Decimal('100.00')
    qtd = Decimal('2')
    desc = Decimal('10') # 10%
    # Subtotal = 200, Desc = 20, Total = 180
    res = calculate_item_totals(venda_unit, qtd, desc)
    assert res['subtotal'] == Decimal('200.00')
    assert res['desconto_valor'] == Decimal('20.00')
    assert res['total'] == Decimal('180.00')

def test_check_low_margin():
    """Valida se o gatilho de margem baixa funciona."""
    assert check_low_margin(Decimal('0.14')) is True
    assert check_low_margin(Decimal('0.15')) is False
    assert check_low_margin(Decimal('0.20')) is False
