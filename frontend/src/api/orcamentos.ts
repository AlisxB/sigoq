import api from './client';
import { Orcamento } from '../types';

export const orcamentoApi = {
    list: (): Promise<Orcamento[]> => api.get('orcamentos/api/orcamentos/').then(res => res.data),
    get: (id: string | number): Promise<Orcamento> => api.get(`orcamentos/api/orcamentos/${id}/`).then(res => res.data),
    create: (data: Partial<Orcamento>): Promise<Orcamento> => api.post('orcamentos/api/orcamentos/', data).then(res => res.data),
    update: (id: string | number, data: Partial<Orcamento>): Promise<Orcamento> => api.put(`orcamentos/api/orcamentos/${id}/`, data).then(res => res.data),
    delete: (id: string | number): Promise<void> => api.delete(`orcamentos/api/orcamentos/${id}/`).then(res => res.data),
    getConfig: (): Promise<any[]> => api.get('orcamentos/api/config-preco/').then(res => res.data),
};
