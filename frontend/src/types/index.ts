export type Role = 'ADMIN' | 'VENDEDOR' | 'ORCAMENTISTA';

export interface User {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    full_name?: string;
    email?: string;
    role: Role;
    celular?: string;
    avatar_url?: string;
}

export interface Cliente {
    id: number;
    razao_social: string;
    nome_fantasia: string;
    cnpj: string | null;
    cpf: string | null;
    inscricao_estadual: string;
    email: string;
    telefone: string;
    cep?: string;
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade: string;
    estado: string;
    vendedor: number | null;
    vendedor_nome?: string;
    observacoes: string;
}

export interface Fornecedor {
    id: number;
    razao_social: string;
    nome_fantasia: string;
    cnpj: string;
    email: string;
    telefone: string;
    contato_nome: string;
    prazo_entrega_medio: number;
    observacoes: string;
}

export interface Categoria {
    id: number;
    nome: string;
    descricao: string;
}

export interface Produto {
    id: number;
    codigo: string;
    descricao: string;
    categoria: number;
    categoria_nome?: string;
    fornecedor: number;
    fornecedor_nome?: string;
    unidade_medida: 'UN' | 'M' | 'KG' | 'PC' | 'CJ';
    custo_base: string; // Decimal comes as string from DRF
    estoque_minimo: number;
    estoque_atual: number;
    ncm: string;
    observacoes: string;
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
    oportunidade: number | null;
    cliente: number;
    cliente_detalhe: Cliente;
    resp_orcam: number | null;
    vendedor: number | null;
    vendedor_nome?: string;
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
export interface StatusOportunidade {
    id: number;
    nome: string;
    cor: string;
    ordem: number;
    notifica_setor_tecnico: boolean;
}

export interface Oportunidade {
    id: number;
    numero: number;
    titulo: string;
    descricao: string;
    cliente: number;
    cliente_detalhe?: Cliente;
    status: number;
    status_detalhe?: StatusOportunidade;
    status_nome?: string;
    valor_estimado: string;
    margem_lucro: string;
    probabilidade: number;
    data_prevista_fechamento: string | null;
    fonte: 'INDICACAO' | 'SITE' | 'PROSPECCAO' | 'WHATSAPP' | 'OUTRO';
    prioridade: 'BAIXA' | 'MEDIA' | 'ALTA';
    vendedor: number | null;
    vendedor_nome?: string;
    criado_em?: string;
}

export interface MetaMensal {
    id?: number;
    mes: number;
    mes_nome?: string;
    ano: number;
    valor_meta: string;
    vendedor?: number;
    vendedor_nome?: string;
}
