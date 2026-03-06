import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8001/',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para CSRF token do Django
api.interceptors.request.use((config) => {
    const name = 'csrftoken';
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
    if (cookieValue) {
        config.headers['X-CSRFToken'] = cookieValue;
    }
    return config;
});

export default api;
