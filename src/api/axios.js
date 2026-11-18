import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api', // Points to Spring Boot server
    headers: {
        'Content-Type': 'application/json',
    }
});

// Automatically attach the JWT token to every outgoing request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Automatically catch 401 Unauthorized errors (expired token) and log the user out
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login'; // Force redirect to login screen
        }
        return Promise.reject(error);
    }
);

export default api;