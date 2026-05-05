import axios from 'axios';

export function createApiClient(tokenRef, onLogout) {
  const api = axios.create({
    baseURL: '/api/v1',
    withCredentials: true,
  });

  api.interceptors.request.use((config) => {
    const token = tokenRef?.current;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  let isRefreshing = false;
  let queue = [];

  const processQueue = (err, token) => {
    queue.forEach((p) => (err ? p.reject(err) : p.resolve(token)));
    queue = [];
  };

  api.interceptors.response.use(
    (res) => res,
    async (error) => {
      const orig = error.config;
      if (error.response?.status === 401 && !orig._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            queue.push({ resolve, reject });
          }).then((token) => {
            orig.headers.Authorization = `Bearer ${token}`;
            return api(orig);
          });
        }
        orig._retry = true;
        isRefreshing = true;
        try {
          const { data } = await axios.post(
            '/api/v1/auth/refresh',
            {},
            { withCredentials: true }
          );
          const newToken = data.data.accessToken;
          if (tokenRef) tokenRef.current = newToken;
          processQueue(null, newToken);
          orig.headers.Authorization = `Bearer ${newToken}`;
          return api(orig);
        } catch (refreshErr) {
          processQueue(refreshErr, null);
          onLogout?.();
          return Promise.reject(refreshErr);
        } finally {
          isRefreshing = false;
        }
      }
      return Promise.reject(error);
    }
  );

  return api;
}

// Default singleton (replaced by hook in practice)
let _api = null;
export function getApi() { return _api; }
export function setApi(instance) { _api = instance; }
