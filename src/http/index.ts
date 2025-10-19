import axios from 'axios';

const API_URL = 'http://localhost:5050/api';

const $api = axios.create({
    withCredentials: true,
    baseURL: API_URL
});

$api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

$api.interceptors.response.use(
    (config) => config,
    async (error) => {
        const originalRequest = error.config;
        if (error.response.status === 401 && !originalRequest._isRetry) {
            originalRequest._isRetry = true;
            try {
                const response = await axios.get(`${API_URL}/auth/refresh`, {
                    withCredentials: true
                });
                localStorage.setItem('accessToken', response.data.accessToken);
                return $api.request(originalRequest);
            } catch {
                console.log('Не авторизован');
            }
        }
        throw error;
    }
);

export default $api;