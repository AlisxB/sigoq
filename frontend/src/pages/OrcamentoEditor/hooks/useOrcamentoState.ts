import { useState, useEffect, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { orcamentoApi } from '../../../api/orcamentos';
import { Orcamento, Kit, ItemOrcamento, Produto } from '../../../types';
import { usePricingCalculations } from './usePricingCalculations';

export const useOrcamentoState = (id: string | undefined, initialData?: Orcamento, config?: any) => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { performGlobalCalculation } = usePricingCalculations(config?.[0]);

    const [localOrcamento, setLocalOrcamento] = useState<Partial<Orcamento>>({
        status: 'RASCUNHO',
        margem_contrib: '0.2000',
        desconto_percent: '0.00',
        kits: [],
        ...initialData
    });

    useEffect(() => {
        if (initialData) {
            setLocalOrcamento(initialData);
        }
    }, [initialData]);

    const updateCalculations = useCallback((kits: Kit[], margin?: string, discount?: string) => {
        const result = performGlobalCalculation(
            kits,
            margin || localOrcamento.margem_contrib || '0.2000',
            discount || localOrcamento.desconto_percent || '0'
        );
        
        setLocalOrcamento(prev => ({
            ...prev,
            kits: result.kits,
            custo_total: result.custoTotal.toFixed(2),
            valor_total: result.valorTotal.toFixed(2)
        }));
    }, [localOrcamento.margem_contrib, localOrcamento.desconto_percent, performGlobalCalculation]);

    const addKit = () => {
        const newKit: Kit = {
            nome: `Novo Kit ${(localOrcamento.kits?.length || 0) + 1}`,
            descricao: '',
            orcamento: id ? parseInt(id) : 0,
            ordem: (localOrcamento.kits?.length || 0) + 1,
            itens: []
        };
        const updatedKits = [...(localOrcamento.kits || []), newKit];
        setLocalOrcamento(prev => ({ ...prev, kits: updatedKits }));
    };

    const deleteKit = (index: number) => {
        const updatedKits = (localOrcamento.kits || []).filter((_, i) => i !== index);
        updateCalculations(updatedKits);
    };

    const updateKitName = (index: number, name: string) => {
        const updatedKits = [...(localOrcamento.kits || [])];
        updatedKits[index] = { ...updatedKits[index], nome: name };
        setLocalOrcamento(prev => ({ ...prev, kits: updatedKits }));
    };

    const addItemToKit = (kitIndex: number, produto: Produto) => {
        const newItem: ItemOrcamento = {
            kit: 0,
            produto: produto.id,
            codigo: produto.codigo,
            descricao: produto.descricao,
            quantidade: '1',
            custo_unit_snapshot: produto.custo_base,
            vlr_unit_venda: '0',
            desconto_unit_valor: '0',
            desconto_percent_item: '0'
        };

        const updatedKits = [...(localOrcamento.kits || [])];
        updatedKits[kitIndex] = {
            ...updatedKits[kitIndex],
            itens: [...updatedKits[kitIndex].itens, newItem]
        };

        updateCalculations(updatedKits);
    };

    const deleteItem = (kitIndex: number, itemIndex: number) => {
        const updatedKits = [...(localOrcamento.kits || [])];
        const updatedItens = updatedKits[kitIndex].itens.filter((_, i) => i !== itemIndex);
        updatedKits[kitIndex] = { ...updatedKits[kitIndex], itens: updatedItens };
        updateCalculations(updatedKits);
    };

    const updateItemQuantity = (kitIndex: number, itemIndex: number, quantity: string) => {
        const updatedKits = [...(localOrcamento.kits || [])];
        const updatedItens = [...updatedKits[kitIndex].itens];
        updatedItens[itemIndex] = { ...updatedItens[itemIndex], quantidade: quantity };
        updatedKits[kitIndex] = { ...updatedKits[kitIndex], itens: updatedItens };
        updateCalculations(updatedKits);
    };

    const updateBasicInfo = (field: keyof Orcamento, value: any) => {
        const updated = { ...localOrcamento, [field]: value };
        setLocalOrcamento(updated);
        
        if (field === 'margem_contrib' || field === 'desconto_percent') {
            updateCalculations(
                localOrcamento.kits || [], 
                field === 'margem_contrib' ? value : localOrcamento.margem_contrib,
                field === 'desconto_percent' ? value : localOrcamento.desconto_percent
            );
        }
    };

    return {
        localOrcamento,
        setLocalOrcamento,
        addKit,
        deleteKit,
        updateKitName,
        addItemToKit,
        deleteItem,
        updateItemQuantity,
        updateBasicInfo,
        recalculate: () => updateCalculations(localOrcamento.kits || [])
    };
};
