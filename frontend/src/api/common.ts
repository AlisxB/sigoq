import api from './client';
import { Cliente, Produto } from '../types';

export const clienteApi = {
    list: (): Promise<Cliente[]> => api.get('http://localhost:8000/clientes/api/').then(res => res.data),
};

export const produtoApi = {
    search: (query: string): Promise<Produto[]> =>
        api.get(`http://localhost:8000/produtos/api/?search=${query}`).then(res => res.data),
};
