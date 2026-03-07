import api from './client';
import { Cliente } from '../types';

export const clienteApi = {
    list: (): Promise<Cliente[]> => api.get('clientes/api/clientes/').then(res => {
        const data = res.data;
        if (data && data.results && Array.isArray(data.results)) return data.results;
        if (Array.isArray(data)) return data;
        if (data && typeof data === 'object') return Object.values(data);
        return [];
    }),
    get: (id: string | number): Promise<Cliente> => api.get(`clientes/api/clientes/${id}/`).then(res => res.data),
    create: (data: Partial<Cliente>): Promise<Cliente> => api.post('clientes/api/clientes/', data).then(res => res.data),
    update: (id: string | number, data: Partial<Cliente>): Promise<Cliente> => api.put(`clientes/api/clientes/${id}/`, data).then(res => res.data),
    delete: (id: string | number): Promise<void> => api.delete(`clientes/api/clientes/${id}/`).then(res => res.data),
};
