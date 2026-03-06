import api from './client';
import { Cliente, Produto } from '../types';

export const clienteApi = {
    list: (): Promise<Cliente[]> => api.get('clientes/api/clientes/').then(res => res.data),
};

export const produtoApi = {
    search: (query: string): Promise<Produto[]> =>
        api.get(`produtos/api/produtos/?search=${query}`).then(res => res.data),
};
