import api from './client';
import { Orcamento } from '../types';

export const orcamentoApi = {
    list: (): Promise<Orcamento[]> => api.get('orcamentos/api/orcamentos/').then(res => {
        const data = res.data;
        // Lida com DRF Paginated Response { results: [...] }
        if (data && data.results && Array.isArray(data.results)) {
            return data.results;
        }
        // Fallback para array simples
        if (Array.isArray(data)) return data;
        // Caso venha como objeto (map), converte para array
        if (data && typeof data === 'object') return Object.values(data);
        return [];
    }),
    get: (id: string | number): Promise<Orcamento> => api.get(`orcamentos/api/orcamentos/${id}/`).then(res => res.data),
    create: (data: Partial<Orcamento>): Promise<Orcamento> => api.post('orcamentos/api/orcamentos/', data).then(res => res.data),
    update: (id: string | number, data: Partial<Orcamento>): Promise<Orcamento> => api.put(`orcamentos/api/orcamentos/${id}/`, data).then(res => res.data),
    delete: (id: string | number): Promise<void> => api.delete(`orcamentos/api/orcamentos/${id}/`).then(res => res.data),
    getConfig: (): Promise<any[]> => api.get('orcamentos/api/config-preco/').then(res => {
        const data = res.data;
        if (data && data.results && Array.isArray(data.results)) return data.results;
        if (Array.isArray(data)) return data;
        if (data && typeof data === 'object') return Object.values(data);
        return [];
    }),
    updateConfig: (id: number, data: any): Promise<any> => api.patch(`orcamentos/api/config-preco/${id}/`, data).then(res => res.data),
    createConfig: (data: any): Promise<any> => api.post('orcamentos/api/config-preco/', data).then(res => res.data),
    createRevision: (id: string | number): Promise<Orcamento> => api.post(`orcamentos/api/orcamentos/${id}/revisao/`).then(res => res.data),
};
