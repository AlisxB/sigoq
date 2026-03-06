import api from './client';
import { Fornecedor } from '../types';

export const fornecedorApi = {
    list: (): Promise<Fornecedor[]> => api.get('fornecedores/api/fornecedores/').then(res => {
        const data = res.data;
        if (data && typeof data === 'object' && !Array.isArray(data)) {
            return Object.values(data) as Fornecedor[];
        }
        return data || [];
    }),
    get: (id: string | number): Promise<Fornecedor> => api.get(`fornecedores/api/fornecedores/${id}/`).then(res => res.data),
    create: (data: Partial<Fornecedor>): Promise<Fornecedor> => api.post('fornecedores/api/fornecedores/', data).then(res => res.data),
    update: (id: string | number, data: Partial<Fornecedor>): Promise<Fornecedor> => api.put(`fornecedores/api/fornecedores/${id}/`, data).then(res => res.data),
    delete: (id: string | number): Promise<void> => api.delete(`fornecedores/api/fornecedores/${id}/`).then(res => res.data),
};
