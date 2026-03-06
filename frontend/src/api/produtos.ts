import api from './client';
import { Produto, Categoria } from '../types';

export const produtoApi = {
    list: (): Promise<Produto[]> => api.get('produtos/api/produtos/').then(res => {
        const data = res.data;
        if (data && typeof data === 'object' && !Array.isArray(data)) {
            return Object.values(data) as Produto[];
        }
        return data || [];
    }),
    get: (id: string | number): Promise<Produto> => api.get(`produtos/api/produtos/${id}/`).then(res => res.data),
    create: (data: Partial<Produto>): Promise<Produto> => api.post('produtos/api/produtos/', data).then(res => res.data),
    update: (id: string | number, data: Partial<Produto>): Promise<Produto> => api.put(`produtos/api/produtos/${id}/`, data).then(res => res.data),
    delete: (id: string | number): Promise<void> => api.delete(`produtos/api/produtos/${id}/`).then(res => res.data),
    search: (query: string, filters?: { categoria?: number, fornecedor?: number }): Promise<Produto[]> => {
        let url = `produtos/api/produtos/?search=${query}`;
        if (filters?.categoria) url += `&categoria=${filters.categoria}`;
        if (filters?.fornecedor) url += `&fornecedor=${filters.fornecedor}`;
        
        return api.get(url).then(res => {
            const data = res.data;
            if (data && typeof data === 'object' && !Array.isArray(data)) {
                return Object.values(data) as Produto[];
            }
            return data || [];
        });
    },
};

export const categoriaApi = {
    list: (): Promise<Categoria[]> => api.get('produtos/api/categorias/').then(res => {
        const data = res.data;
        if (data && typeof data === 'object' && !Array.isArray(data)) {
            return Object.values(data) as Categoria[];
        }
        return data || [];
    }),
    get: (id: string | number): Promise<Categoria> => api.get(`produtos/api/categorias/${id}/`).then(res => res.data),
    create: (data: Partial<Categoria>): Promise<Categoria> => api.post('produtos/api/categorias/', data).then(res => res.data),
    update: (id: string | number, data: Partial<Categoria>): Promise<Categoria> => api.put(`produtos/api/categorias/${id}/`, data).then(res => res.data),
    delete: (id: string | number): Promise<void> => api.delete(`produtos/api/categorias/${id}/`).then(res => res.data),
};
