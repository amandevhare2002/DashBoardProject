import axios from 'axios';

const api = axios.create({
    baseURL: 'https://logpanel.insurancepolicy4u.com/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

export function Interceptor() {
    api.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response && error.response.status === 401) {
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('token');
                    localStorage.removeItem('username');
                    window.location.href = '/login';
                }
            }
            return Promise.reject(error);
        }
    );
}

export default api;