import api from './client';
import { AnalyticsData } from '../types';

export const analyticsApi = {
    getFunnel: (): Promise<any> => api.get('comercial/api/oportunidade/estatisticas/').then(res => res.data),
    getFinance: (params?: { periodo: string }): Promise<AnalyticsData> => 
        api.get('orcamentos/api/orcamentos/analytics/', { params }).then(res => res.data),
};
