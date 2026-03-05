export interface User {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
}

export interface Cliente {
    id: number;
    razao_social: string;
    nome_fantasia: string;
    cnpj: string;
}

export interface Produto {
    id: number;
    codigo: string;
    descricao: string;
    custo_base: string; // Decimal comes as string from DRF
}

export interface ItemOrcamento {
    id?: number;
    kit: number;
    produto: number;
    codigo: string;
    descricao: string;
    quantidade: string;
    custo_unit_snapshot: string;
    vlr_unit_venda: string;
    desconto_unit_valor: string;
    desconto_percent_item: string;
}

export interface Kit {
    id?: number;
    orcamento: number;
    nome: string;
    descricao: string;
    ordem: number;
    itens: ItemOrcamento[];
}

export type OrcamentoStatus = 'RASCUNHO' | 'ELABORACAO' | 'REVISAO' | 'ENVIADO' | 'APROVADO' | 'REPROVADO' | 'CANCELADO';

export interface Orcamento {
    id: number;
    numero: number;
    revisao: number;
    versao_pai: number | null;
    cliente: number;
    cliente_detalhe: Cliente;
    resp_orcam: number | null;
    status: OrcamentoStatus;
    custo_total: string;
    valor_total: string;
    margem_contrib: string;
    desconto_percent: string;
    validade_dias: number;
    prazo_entrega: string;
    condicao_pagamento: string;
    observacoes: string;
    aprovado_gerencia: boolean;
    motivo_rejeicao: string;
    kits: Kit[];
}

export interface ConfiguracaoPreco {
    id: number;
    nome: string;
    markup_engenharia: string;
    markup_capitalizacao: string;
    markup_frete: string;
    markup_imposto: string;
    markup_comissao: string;
    markup_difal: string;
    markup_frete_especial: string;
    margem_contribuicao_padrao: string;
    ativo: boolean;
}
