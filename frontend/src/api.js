const API_URL = import.meta.env.VITE_API_URL ?? '/api';

async function request(path, options) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const itemsApi = {
  list: () => request('/items'),
  create: (item) => request('/items', { method: 'POST', body: JSON.stringify(item) }),
  update: (id, item) => request(`/items/${id}`, { method: 'PATCH', body: JSON.stringify(item) }),
  remove: (id) => request(`/items/${id}`, { method: 'DELETE' }),
};
