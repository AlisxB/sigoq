import api from './client';
import { Cliente, Produto } from '../types';

export const clienteApi = {
    list: (): Promise<Cliente[]> => api.get('clientes/api/clientes/').then(res => {
        const data = res.data;
        if (data && data.results && Array.isArray(data.results)) return data.results;
        return Array.isArray(data) ? data : [];
    }),
};

export const produtoApi = {
    search: (query: string): Promise<Produto[]> =>
        api.get(`produtos/api/produtos/?search=${query}`).then(res => {
            const data = res.data;
            if (data && data.results && Array.isArray(data.results)) return data.results;
            return Array.isArray(data) ? data : [];
        }),
};
