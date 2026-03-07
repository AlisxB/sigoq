import api from './client';

export const analyticsApi = {
    getFunnel: (): Promise<any[]> => api.get('comercial/api/oportunidade/estatisticas/').then(res => res.data),
    getFinance: (): Promise<any> => api.get('orcamentos/api/orcamentos/analytics/').then(res => res.data),
};
