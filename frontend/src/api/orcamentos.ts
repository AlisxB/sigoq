import api from './client';
import { Orcamento } from '../types';

export const orcamentoApi = {
    list: (): Promise<Orcamento[]> => api.get('orcamentos/').then(res => res.data),
    get: (id: string | number): Promise<Orcamento> => api.get(`orcamentos/${id}/`).then(res => res.data),
    create: (data: Partial<Orcamento>): Promise<Orcamento> => api.post('orcamentos/', data).then(res => res.data),
    update: (id: string | number, data: Partial<Orcamento>): Promise<Orcamento> => api.put(`orcamentos/${id}/`, data).then(res => res.data),
    delete: (id: string | number): Promise<void> => api.delete(`orcamentos/${id}/`).then(res => res.data),
    getConfig: (): Promise<any[]> => api.get('config-preco/').then(res => res.data),
};
