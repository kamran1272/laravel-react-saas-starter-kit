import axios from 'axios';

const client = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api`,
  headers: {
    Accept: 'application/json',
  },
});

// Attach the auth token on every request.
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('saas_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On a 401, clear the token and send the user back to the login page,
// unless they're already on /login or /register.
client.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const path = window.location.pathname;
    if (status === 401 && path !== '/login' && path !== '/register') {
      localStorage.removeItem('saas_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default client;
