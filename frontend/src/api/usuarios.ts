import api from './client';
import { User } from '../types';

export const usuarioApi = {
    list: (params?: any): Promise<User[]> => api.get('usuarios/api/users/', { params }).then(res => res.data),
    get: (id: string | number): Promise<User> => api.get(`usuarios/api/users/${id}/`).then(res => res.data),
    create: (data: any): Promise<User> => api.post('usuarios/api/users/', data).then(res => res.data),
    update: (id: string | number, data: any): Promise<User> => api.patch(`usuarios/api/users/${id}/`, data).then(res => res.data),
    delete: (id: string | number): Promise<void> => api.delete(`usuarios/api/users/${id}/`).then(res => res.data),
    
    login: (credentials: any): Promise<User> => api.post('usuarios/api/auth/login/', credentials).then(res => res.data),
    logout: (): Promise<void> => api.post('usuarios/api/auth/logout/').then(res => res.data),
    me: (): Promise<User> => api.get('usuarios/api/auth/me/').then(res => res.data),
    
    resetPassword: (id: string | number): Promise<any> => api.post(`usuarios/api/users/${id}/reset_password/`).then(res => res.data),
};
