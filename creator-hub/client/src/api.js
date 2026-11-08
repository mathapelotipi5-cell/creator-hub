import { mockApi } from './mockApi.js';

const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api';
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

async function request(path, options = {}, token = '') {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(BASE + path, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
}

const real = {
  getProfile: () => request('/creator/profile'),
  getContents: (params = {}) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();
    return request('/contents' + (qs ? `?${qs}` : ''));
  },
  getContent: (id) => request(`/contents/${id}`),
  getComments: (contentId) => request(`/comments/${contentId}`),
  addComment: (payload) => request('/comments', { method: 'POST', body: JSON.stringify(payload) }),
  toggleLike: (payload) => request('/likes', { method: 'POST', body: JSON.stringify(payload) }),
};

export const creatorApi = {
  login: (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  stats: (token) => request('/dashboard/stats', {}, token),
  contents: (token) => request('/dashboard/contents', {}, token),
  comments: (token) => request('/comments?status=pending', {}, token),
  createContent: (payload, token) => request('/contents', { method: 'POST', body: JSON.stringify(payload) }, token),
  updateContent: (id, payload, token) => request(`/contents/${id}`, { method: 'PUT', body: JSON.stringify(payload) }, token),
  deleteContent: (id, token) => request(`/contents/${id}`, { method: 'DELETE' }, token),
  setCommentStatus: (id, status, token) => request(`/comments/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }, token),
  deleteComment: (id, token) => request(`/comments/${id}`, { method: 'DELETE' }, token),
  profile: (token) => request('/dashboard/profile', {}, token),
};

export const api = USE_MOCK ? mockApi : real;
