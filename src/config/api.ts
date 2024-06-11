import { getAuthToken } from "@utils/helpers";
import type { InternalAxiosRequestConfig } from "axios";
import axios from "axios";

const coreApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { "Content-Type": "application/json" },
});

const authApi = axios.create({
  baseURL: import.meta.env.VITE_AUTH_URL,
  headers: { "Content-Type": "application/json" },
});

function onFulfilledRequest(config: InternalAxiosRequestConfig) {
  const token = getAuthToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
}

coreApi.interceptors.request.use(onFulfilledRequest, error => Promise.reject(error));

authApi.interceptors.request.use(onFulfilledRequest, error => Promise.reject(error));

export { authApi, coreApi };
