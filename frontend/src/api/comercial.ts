import api from './client';
import { Oportunidade, StatusOportunidade, MetaMensal, ArquivoOportunidade } from '../types';

export const comercialApi = {
    // Oportunidades
    list: (): Promise<Oportunidade[]> => api.get('comercial/api/oportunidade/').then(res => {
        const data = res.data;
        if (data && data.results && Array.isArray(data.results)) return data.results;
        if (Array.isArray(data)) return data;
        if (data && typeof data === 'object') return Object.values(data);
        return [];
    }),
    get: (id: string | number): Promise<Oportunidade> => api.get(`comercial/api/oportunidade/${id}/`).then(res => res.data),
    create: (data: Partial<Oportunidade>): Promise<Oportunidade> => api.post('comercial/api/oportunidade/', data).then(res => res.data),
    update: (id: string | number, data: Partial<Oportunidade>): Promise<Oportunidade> => api.patch(`comercial/api/oportunidade/${id}/`, data).then(res => res.data),
    delete: (id: string | number): Promise<void> => api.delete(`comercial/api/oportunidade/${id}/`).then(res => res.data),
    updateStatus: (id: number, statusId: number): Promise<any> => api.post('comercial/api/oportunidade/update-status/', { id, status_id: statusId }),

    // Arquivos
    listArquivos: (oportunidadeId: number): Promise<ArquivoOportunidade[]> => 
        api.get(`comercial/api/oportunidade/${oportunidadeId}/arquivos/`).then(res => res.data),
    
    uploadArquivos: (oportunidadeId: number, files: File[], paths: string[]): Promise<ArquivoOportunidade[]> => {
        const formData = new FormData();
        files.forEach(file => formData.append('files', file));
        paths.forEach(path => formData.append('paths[]', path));
        
        return api.post(`comercial/api/oportunidade/${oportunidadeId}/upload_arquivos/`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }).then(res => res.data);
    },
    
    deleteArquivo: (arquivoId: number): Promise<void> => 
        api.delete(`comercial/api/arquivos/${arquivoId}/`).then(res => res.data),

    getZipUrl: (oportunidadeId: number, path?: string): string => {
        let url = `http://localhost:8000/comercial/api/oportunidade/${oportunidadeId}/download_zip/`;
        if (path) url += `?path=${encodeURIComponent(path)}`;
        return url;
    },

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
