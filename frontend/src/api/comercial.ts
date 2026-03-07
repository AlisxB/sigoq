import api from './client';
import { Oportunidade, StatusOportunidade, MetaMensal } from '../types';

export const comercialApi = {
    // Oportunidades
    list: (): Promise<Oportunidade[]> => api.get('comercial/api/oportunidades/').then(res => {
        const data = res.data;
        if (data && data.results && Array.isArray(data.results)) return data.results;
        if (Array.isArray(data)) return data;
        if (data && typeof data === 'object') return Object.values(data);
        return [];
    }),
    get: (id: string | number): Promise<Oportunidade> => api.get(`comercial/api/oportunidades/${id}/`).then(res => res.data),
    create: (data: Partial<Oportunidade>): Promise<Oportunidade> => api.post('comercial/api/oportunidades/', data).then(res => res.data),
    update: (id: string | number, data: Partial<Oportunidade>): Promise<Oportunidade> => api.put(`comercial/api/oportunidades/${id}/`, data).then(res => res.data),
    delete: (id: string | number): Promise<void> => api.delete(`comercial/api/oportunidades/${id}/`).then(res => res.data),
    updateStatus: (id: number, statusId: number): Promise<any> => api.post('comercial/api/oportunidade/update-status/', { id, status_id: statusId }),

    // Status
    listStatus: (): Promise<StatusOportunidade[]> => api.get('comercial/api/status/').then(res => {
        const data = res.data;
        if (data && data.results && Array.isArray(data.results)) return data.results;
        if (Array.isArray(data)) return data;
        if (data && typeof data === 'object') return Object.values(data);
        return [];
    }),

    // Metas Mensais
    listMetas: (): Promise<MetaMensal[]> => api.get('comercial/api/metas/').then(res => {
        const data = res.data;
        if (data && data.results && Array.isArray(data.results)) return data.results;
        if (Array.isArray(data)) return data;
        if (data && typeof data === 'object') return Object.values(data);
        return [];
    }),
    createMeta: (data: Partial<MetaMensal>): Promise<MetaMensal> => api.post('comercial/api/metas/', data).then(res => res.data),
    updateMeta: (id: number, data: Partial<MetaMensal>): Promise<MetaMensal> => api.put(`comercial/api/metas/${id}/`, data).then(res => res.data),
    deleteMeta: (id: number): Promise<void> => api.delete(`comercial/api/metas/${id}/`).then(res => res.data),
};
