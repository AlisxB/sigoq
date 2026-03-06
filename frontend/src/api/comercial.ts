import client from './client';
import { Oportunidade, StatusOportunidade } from '../types';

export const comercialApi = {
    oportunidades: {
        list: () => client.get<Oportunidade[]>('/comercial/api/oportunidades/').then(r => {
            const data = r.data;
            if (data && typeof data === 'object' && !Array.isArray(data)) {
                return Object.values(data) as Oportunidade[];
            }
            return data || [];
        }),
        get: (id: string | number) => client.get<Oportunidade>(`/comercial/api/oportunidades/${id}/`).then(r => r.data),
        create: (data: Partial<Oportunidade>) => client.post<Oportunidade>('/comercial/api/oportunidades/', data).then(r => r.data),
        update: (id: string | number, data: Partial<Oportunidade>) => client.patch<Oportunidade>(`/comercial/api/oportunidades/${id}/`, data).then(r => r.data),
        delete: (id: string | number) => client.delete(`/comercial/api/oportunidades/${id}/`),
        updateStatus: (id: number, statusId: number) => client.post('/comercial/api/oportunidade/update-status/', { id, status_id: statusId }).then(r => r.data),
    },
    status: {
        list: () => client.get<StatusOportunidade[]>('/comercial/api/status/').then(r => {
            const data = r.data;
            if (data && typeof data === 'object' && !Array.isArray(data)) {
                return Object.values(data) as StatusOportunidade[];
            }
            return data || [];
        }),
    }
};
