import api from './client';
import { Fornecedor } from '../types';

export const fornecedorApi = {
    list: (params?: { page?: number, search?: string, page_size?: number }): Promise<Fornecedor[]> => 
        api.get('fornecedores/api/fornecedores/', { params: { page_size: 1000, ...params } }).then(res => {
            const data = res.data;
            if (data && data.results && Array.isArray(data.results)) return data.results;
            return Array.isArray(data) ? data : [];
        }),
    get: (id: string | number): Promise<Fornecedor> => api.get(`fornecedores/api/fornecedores/${id}/`).then(res => res.data),
    create: (data: Partial<Fornecedor>): Promise<Fornecedor> => api.post('fornecedores/api/fornecedores/', data).then(res => res.data),
    update: (id: string | number, data: Partial<Fornecedor>): Promise<Fornecedor> => api.put(`fornecedores/api/fornecedores/${id}/`, data).then(res => res.data),
    delete: (id: string | number): Promise<void> => api.delete(`fornecedores/api/fornecedores/${id}/`).then(res => res.data),
};
