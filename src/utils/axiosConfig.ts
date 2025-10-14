import axios from 'axios';
import { logNetworkRequest, logNetworkResponse, logNetworkError } from './networkDebug';

// 全局默认直连后端（保障所有相对URL也会走同一后端）
axios.defaults.baseURL = 'http://172.20.10.11:8080/api';
axios.defaults.headers.common['Content-Type'] = 'application/json';

axios.interceptors.request.use(
  (config) => {
    try {
      logNetworkRequest(config);
    } catch {}
    return config;
  },
  (error) => {
    try {
      logNetworkError(error);
    } catch {}
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => {
    try {
      logNetworkResponse(response);
    } catch {}
    return response;
  },
  (error) => {
    try {
      logNetworkError(error);
    } catch {}
    return Promise.reject(error);
  }
);

export {};


