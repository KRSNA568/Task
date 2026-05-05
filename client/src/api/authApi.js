import axios from 'axios';

const base = '/api/v1/auth';

export const authApi = {
  login: (email, password) =>
    axios.post(`${base}/login`, { email, password }, { withCredentials: true }),

  signup: (name, email, password) =>
    axios.post(`${base}/signup`, { name, email, password }, { withCredentials: true }),

  refresh: () =>
    axios.post(`${base}/refresh`, {}, { withCredentials: true }),

  logout: (api) =>
    api.post(`${base}/logout`),
};
