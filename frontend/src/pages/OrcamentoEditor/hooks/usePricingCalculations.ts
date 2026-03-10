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
        // Fallback robusto caso não haja configuração no banco (Markup padrão de ~33% de encargos + margem)
        const activeConfig = config || {
            markup_engenharia: '0.1000',
            markup_capitalizacao: '0.0500',
            markup_frete: '0.0300',
            markup_imposto: '0.1500',
            markup_comissao: '0.0000',
            markup_difal: '0.0000',
            markup_frete_especial: '0.0000'
        };

        const margin = parseFloat(marginStr || '0.2000');
        const discount = parseFloat(discountStr || '0') / 100;

        const somaEncargos = 
            parseFloat(activeConfig.markup_engenharia || '0') +
            parseFloat(activeConfig.markup_capitalizacao || '0') +
            parseFloat(activeConfig.markup_frete || '0') +
            parseFloat(activeConfig.markup_imposto || '0') +
            parseFloat(activeConfig.markup_comissao || '0') +
            parseFloat(activeConfig.markup_difal || '0') +
            parseFloat(activeConfig.markup_frete_especial || '0');

        let totalCusto = 0;
        let totalVenda = 0;

        const updatedKits = kits.map(kit => {
            const updatedItens = kit.itens.map(item => {
                const custoUnit = parseFloat(item.custo_unit_snapshot);
                const qtdRaw = parseFloat(item.quantidade || '0');
                const quantidade = qtdRaw > 0 ? qtdRaw : 0; // Impede quantidades negativas

                const { vlrVendaUnit, subtotal } = calculateItemTotals(
                    custoUnit,
                    quantidade,
                    somaEncargos,
                    margin,
                    parseFloat(item.desconto_unit_valor || '0')
                );

                totalCusto += custoUnit * quantidade;
                totalVenda += subtotal;

                return { ...item, vlr_unit_venda: vlrVendaUnit.toFixed(2), quantidade: quantidade.toString() };
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
