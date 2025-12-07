// src/api.js

const apiUrl = process.env.API_URL || 'http://localhost:8080';
console.log('API_URL from env:', apiUrl);

function authHeaders(user, type) {
  const headers = { Authorization: `Bearer ${user.idToken}` };
  if (type) headers['Content-Type'] = type;
  return headers;
}

export async function listFragments(user, { expand = false } = {}) {
  const url = new URL('/v1/fragments', apiUrl);
  if (expand) url.searchParams.set('expand', '1');
  const res = await fetch(url, { headers: authHeaders(user) });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json(); // { fragments:[ids] } or { fragments:[{...meta}] }
}

export async function getFragmentData(user, id, { ext = '', as = 'text' } = {}) {
  const url = new URL(`/v1/fragments/${id}${ext}`, apiUrl);
  const res = await fetch(url, { headers: authHeaders(user) });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  if (as === 'blob') return res.blob();
  if (as === 'json') return res.json();
  return res.text();
}

export async function createFragment(user, { type, data }) {
  const url = new URL('/v1/fragments', apiUrl);
  const res = await fetch(url, {
    method: 'POST',
    headers: authHeaders(user, type),
    body: data,
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => '');
    console.error('POST /v1/fragments failed', res.status, msg);
    throw new Error(`POST failed: ${res.status}`);
  }
  return res.json();
}

export async function updateFragment(user, id, { type, data }) {
  const url = new URL(`/v1/fragments/${id}`, apiUrl);
  const res = await fetch(url, {
    method: 'PUT',
    headers: authHeaders(user, type),
    body: data,
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => '');
    console.error('PUT /v1/fragments failed', res.status, msg);
    throw new Error(`PUT failed: ${res.status}`);
  }
  return res.json();
}

export async function deleteFragment(user, id) {
  const url = new URL(`/v1/fragments/${id}`, apiUrl);
  const res = await fetch(url, {
    method: 'DELETE',
    headers: authHeaders(user),
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}
