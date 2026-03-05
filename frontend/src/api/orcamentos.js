import api from './client';

export const orcamentoApi = {
    list: () => api.get('orcamentos/').then(res => res.data),
    get: (id) => api.get(`orcamentos/${id}/`).then(res => res.data),
    create: (data) => api.post('orcamentos/', data).then(res => res.data),
    update: (id, data) => api.put(`orcamentos/${id}/`, data).then(res => res.data),
    delete: (id) => api.delete(`orcamentos/${id}/`).then(res => res.data),
};
