import axios from "axios";

import useAuthStore from "../store/authStore.js";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && useAuthStore.getState().token) {
      useAuthStore.getState().clearAuth();

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

export function getApiErrorMessage(error) {
  return error.response?.data?.message || error.message || "Terjadi kesalahan.";
}

export async function loginRequest(payload) {
  const response = await api.post("/auth/login", payload);
  return response.data.data;
}

export async function getConsoles() {
  const response = await api.get("/consoles");
  return response.data.data;
}

export async function getPackages() {
  const response = await api.get("/packages");
  return response.data.data;
}

export async function getProducts() {
  const response = await api.get("/products");
  return response.data.data;
}

export async function getActiveTransactions() {
  const response = await api.get("/transactions/active");
  return response.data.data;
}

export async function startOpenTransactionRequest(payload) {
  const response = await api.post("/transactions/open", payload);
  return response.data.data;
}

export async function startPackageTransactionRequest(payload) {
  const response = await api.post("/transactions/package", payload);
  return response.data.data;
}

export async function finishTransactionRequest(transactionId) {
  const response = await api.post(`/transactions/${transactionId}/finish`);
  return response.data.data;
}

export async function addTransactionItemRequest({
  transactionId,
  productId,
  quantity,
}) {
  const response = await api.post(`/transactions/${transactionId}/items`, {
    productId,
    quantity,
  });
  return response.data.data;
}

export async function moveTransactionConsoleRequest({
  transactionId,
  targetConsoleCode,
}) {
  const response = await api.patch(`/transactions/${transactionId}/console`, {
    targetConsoleCode,
  });
  return response.data.data;
}

export async function createAdminProductRequest(payload) {
  const response = await api.post("/admin/products", payload);
  return response.data.data;
}

export async function updateAdminProductRequest({ id, payload }) {
  const response = await api.patch(`/admin/products/${id}`, payload);
  return response.data.data;
}

export async function deleteAdminProductRequest(id) {
  const response = await api.delete(`/admin/products/${id}`);
  return response.data.data;
}

export async function createAdminPackageRequest(payload) {
  const response = await api.post("/admin/packages", payload);
  return response.data.data;
}

export async function updateAdminPackageRequest({ id, payload }) {
  const response = await api.patch(`/admin/packages/${id}`, payload);
  return response.data.data;
}

export async function deleteAdminPackageRequest(id) {
  const response = await api.delete(`/admin/packages/${id}`);
  return response.data.data;
}

export default api;
