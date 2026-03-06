import { useCallback } from 'react';
import { Kit, ConfiguracaoPreco } from '../../types';

export const usePricingCalculations = (config: ConfiguracaoPreco | undefined) => {
    
    const calculateItemTotals = useCallback((
        custoUnit: number,
        quantidade: number,
        somaEncargos: number,
        margin: number,
        descontoUnitValor: number = 0
    ) => {
        const divisor = 1 - (somaEncargos + margin);
        // Previne divisão por zero ou margens impossíveis (> 100%)
        const safeDivisor = divisor > 0 ? divisor : 0.01;
        
        const vlrVendaUnit = custoUnit / safeDivisor;
        const subtotal = (vlrVendaUnit - descontoUnitValor) * quantidade;
        
        return {
            vlrVendaUnit,
            subtotal
        };
    }, []);

    const performGlobalCalculation = useCallback((
        kits: Kit[],
        marginStr: string,
        discountStr: string
    ) => {
        if (!config) return { kits, custoTotal: 0, valorTotal: 0 };

        const margin = parseFloat(marginStr || '0.2000');
        const discount = parseFloat(discountStr || '0') / 100;

        const somaEncargos = 
            parseFloat(config.markup_engenharia) +
            parseFloat(config.markup_capitalizacao) +
            parseFloat(config.markup_frete) +
            parseFloat(config.markup_imposto) +
            parseFloat(config.markup_comissao) +
            parseFloat(config.markup_difal) +
            parseFloat(config.markup_frete_especial);

        let totalCusto = 0;
        let totalVenda = 0;

        const updatedKits = kits.map(kit => {
            const updatedItens = kit.itens.map(item => {
                const custoUnit = parseFloat(item.custo_unit_snapshot);
                const { vlrVendaUnit, subtotal } = calculateItemTotals(
                    custoUnit,
                    parseFloat(item.quantidade),
                    somaEncargos,
                    margin,
                    parseFloat(item.desconto_unit_valor || '0')
                );

                totalCusto += custoUnit * parseFloat(item.quantidade);
                totalVenda += subtotal;

                return { ...item, vlr_unit_venda: vlrVendaUnit.toFixed(2) };
            });
            return { ...kit, itens: updatedItens };
        });

        const finalVenda = totalVenda * (1 - discount);

        return {
            kits: updatedKits,
            custoTotal: totalCusto,
            valorTotal: finalVenda
        };
    }, [config, calculateItemTotals]);

    return {
        performGlobalCalculation,
        calculateItemTotals
    };
};
