import api from './client';
import { Produto, Categoria } from '../types';

export const produtoApi = {
    list: (): Promise<Produto[]> => api.get('produtos/api/produtos/').then(res => res.data),
    get: (id: string | number): Promise<Produto> => api.get(`produtos/api/produtos/${id}/`).then(res => res.data),
    create: (data: Partial<Produto>): Promise<Produto> => api.post('produtos/api/produtos/', data).then(res => res.data),
    update: (id: string | number, data: Partial<Produto>): Promise<Produto> => api.put(`produtos/api/produtos/${id}/`, data).then(res => res.data),
    delete: (id: string | number): Promise<void> => api.delete(`produtos/api/produtos/${id}/`).then(res => res.data),
};

export const categoriaApi = {
    list: (): Promise<Categoria[]> => api.get('produtos/api/categorias/').then(res => res.data),
    get: (id: string | number): Promise<Categoria> => api.get(`produtos/api/categorias/${id}/`).then(res => res.data),
    create: (data: Partial<Categoria>): Promise<Categoria> => api.post('produtos/api/categorias/', data).then(res => res.data),
    update: (id: string | number, data: Partial<Categoria>): Promise<Categoria> => api.put(`produtos/api/categorias/${id}/`, data).then(res => res.data),
    delete: (id: string | number): Promise<void> => api.delete(`produtos/api/categorias/${id}/`).then(res => res.data),
};
