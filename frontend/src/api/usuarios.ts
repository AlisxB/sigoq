import api from './client';
import { User } from '../types';

export const usuarioApi = {
    list: (params?: any): Promise<User[]> => api.get('usuarios/api/users/', { params }).then(res => res.data),
    get: (id: string | number): Promise<User> => api.get(`usuarios/api/users/${id}/`).then(res => res.data),
};
