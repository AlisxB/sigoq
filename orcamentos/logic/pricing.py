from decimal import Decimal, ROUND_HALF_UP

def calculate_total_encargos(
    engenharia: Decimal,
    capitalizacao: Decimal,
    frete: Decimal,
    imposto: Decimal,
    comissao: Decimal,
    difal: Decimal = Decimal('0'),
    frete_especial: Decimal = Decimal('0')
) -> Decimal:
    """
    Soma todos os encargos indiretos (Markups) de uma configuração.
    """
    return engenharia + capitalizacao + frete + imposto + comissao + difal + frete_especial

def calculate_unit_selling_price(
    custo_unit: Decimal,
    soma_encargos: Decimal,
    margem_contrib: Decimal
) -> Decimal:
    """
    Calcula o preço de venda unitário usando a fórmula:
    Preço = Custo / (1 - (Soma_Encargos + Margem_Contribuição))
    
    Previne divisão por zero ou resultados negativos absurdos (limite de margem).
    """
    divisor = Decimal('1') - (soma_encargos + margem_contrib)
    
    # Previne divisão por zero ou margens impossíveis (> 100%)
    if divisor <= Decimal('0.01'):
        divisor = Decimal('0.01')
        
    venda = custo_unit / divisor
    return venda.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

def calculate_item_totals(
    vlr_unit_venda: Decimal,
    quantidade: Decimal,
    desconto_percent: Decimal = Decimal('0')
) -> dict:
    """
    Calcula os totais de um item de orçamento considerando desconto.
    Retorna um dicionário com os valores calculados.
    """
    subtotal = vlr_unit_venda * quantidade
    desconto_valor = subtotal * (desconto_percent / Decimal('100'))
    total = subtotal - desconto_valor
    
    return {
        'subtotal': subtotal.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP),
        'desconto_valor': desconto_valor.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP),
        'total': total.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
    }

def check_low_margin(margem_contrib: Decimal, threshold: Decimal = Decimal('0.15')) -> bool:
    """
    Verifica se a margem de contribuição está abaixo do limite de alerta.
    """
    return margem_contrib < threshold
