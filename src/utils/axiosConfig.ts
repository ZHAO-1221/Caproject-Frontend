import axios from 'axios';
import { logNetworkRequest, logNetworkResponse, logNetworkError } from './networkDebug';

// 清空 baseURL，改为各服务显式使用 '/api' 前缀，避免重复 '/api/api'
axios.defaults.baseURL = '';
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


