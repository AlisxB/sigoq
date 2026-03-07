import api from './client';
import { AnalyticsData } from '../types';

export const analyticsApi = {
    getFunnel: (): Promise<any[]> => api.get('comercial/api/oportunidade/estatisticas/').then(res => {
        const data = res.data;
        if (data && data.results && Array.isArray(data.results)) return data.results;
        return Array.isArray(data) ? data : [];
    }),
    getFinance: (params?: { periodo: string }): Promise<AnalyticsData> => 
        api.get('orcamentos/api/orcamentos/analytics/', { params }).then(res => res.data),
};
