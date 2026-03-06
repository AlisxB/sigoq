import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Função auxiliar para obter cookie
function getCookie(name: string) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Interceptor para CSRF token do Django
api.interceptors.request.use((config) => {
    const token = getCookie('csrftoken');
    if (token) {
        config.headers['X-CSRFToken'] = token;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Interceptor de Resposta para lidar com erros 403 de CSRF
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Se recebermos um 403 e a mensagem mencionar CSRF, pode ser que o token expirou
        if (error.response?.status === 403 && error.response?.data?.detail?.includes('CSRF')) {
            console.warn("Erro de CSRF detectado. Tentando recuperar...");
            // Opcional: Redirecionar para login se o problema persistir
        }
        return Promise.reject(error);
    }
);

export default api;
