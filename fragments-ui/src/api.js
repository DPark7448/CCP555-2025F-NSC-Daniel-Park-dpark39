// src/api.js

const apiUrl = process.env.API_URL || 'http://localhost:8080';
console.log('API_URL from env:', apiUrl);

export async function getUserFragments(user) {
  console.log('Requesting user fragments data...');
  const url = new URL('/v1/fragments', apiUrl);
  const res = await fetch(url, { headers: user.authorizationHeaders() });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json(); // { status:'ok', fragments:[id,...] }
}

export async function createTextFragment(user, text) {
  const url = new URL('/v1/fragments', apiUrl);
  const res = await fetch(url, {
    method: 'POST',
    headers: user.authorizationHeaders('text/plain'),
    body: text,
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => '');
    console.error('POST /v1/fragments failed', res.status, msg);
    throw new Error(`POST failed: ${res.status}`);
  }
  return res.json(); // { status:'ok', fragment:{ id, ... } }
}

// NEW: GET /v1/fragments/:id (returns text/plain for this assignment)
export async function getFragmentById(user, id) {
  const url = new URL(`/v1/fragments/${id}`, apiUrl);
  const res = await fetch(url, {
    headers: user.authorizationHeaders('text/plain'),
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.text(); // "hello from UI"
}
