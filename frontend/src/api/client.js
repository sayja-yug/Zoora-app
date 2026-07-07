import axios from 'axios';
import { mockApi } from './mock';

// ─── Mock mode detection ─────────────────────────────────────────────────────
// Enabled when VITE_USE_MOCK=true OR the env var is unset (no backend running)
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

const API_BASE = import.meta.env.VITE_API_URL || '';

export const api = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT from localStorage to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('zoora_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Redirect to login on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('zoora_token');
      localStorage.removeItem('zoora_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────
export const login = (email, password) =>
  USE_MOCK ? mockApi.login(email, password) : api.post('/auth/login', { email, password });

export const register = (data) =>
  USE_MOCK ? mockApi.register(data) : api.post('/auth/register', data);

// ─── Startups (investor-facing — read only) ───────────────────────────────
export const getLeaderboard = () =>
  USE_MOCK ? mockApi.getLeaderboard() : api.get('/startups');

export const getStartupDetail = (id) =>
  USE_MOCK ? mockApi.getStartupDetail(id) : api.get(`/startups/${id}`);

// ─── Documents (founder-facing) ───────────────────────────────────────────
export const getUploadUrl = (startupId, docType, filename, contentType) =>
  USE_MOCK ? mockApi.getUploadUrl(startupId, docType, filename, contentType) 
           : api.post('/documents', { startup_id: startupId, doc_type: docType, filename, content_type: contentType });

export const uploadDocumentDirect = (url, file, contentType) =>
  USE_MOCK ? mockApi.uploadDocumentDirect(url, file, contentType)
           : axios.put(url, file, { headers: { 'Content-Type': contentType } });

export const getDocuments = (startupId) =>
  USE_MOCK ? mockApi.getDocuments(startupId) : api.get(`/documents?startup_id=${startupId}`);

export const deleteDocument = (docId) =>
  USE_MOCK ? mockApi.deleteDocument(docId) : api.delete(`/documents/${docId}`);

// ─── Admin Documents ───────────────────────────────────────────────────────
export const getAdminDocuments = () =>
  USE_MOCK ? mockApi.getAdminDocuments() : api.get('/admin/documents');

export const verifyDocument = (docId, action) =>
  USE_MOCK ? mockApi.verifyDocument(docId, action) : api.post(`/admin/documents/${docId}/verify`, { action });
