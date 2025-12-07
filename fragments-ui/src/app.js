// src/app.js
import { signIn, getUser } from './auth';
import {
  listFragments,
  createFragment,
  getFragmentData,
  updateFragment,
  deleteFragment,
} from './api';

function setStatus(el, msg, tone = 'muted') {
  el.textContent = msg;
  el.style.color = tone === 'error' ? '#ff8b8b' : '#9da3b0';
}

function asDataUrl(blob) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}

async function init() {
  const userSection = document.querySelector('#user');
  const loginBtn = document.querySelector('#login');
  const statusEl = document.querySelector('#status');
  const usernameEl = userSection.querySelector('.username');
  const fragmentsBody = document.querySelector('#fragments-body');
  const previewText = document.querySelector('#preview-text');
  const previewContainer = document.querySelector('#preview');
  const selectedIdInput = document.querySelector('#selected-id');
  const selectedMeta = document.querySelector('#selected-meta');
  const createType = document.querySelector('#create-type');
  const createText = document.querySelector('#create-text');
  const createFile = document.querySelector('#create-file');
  const createBtn = document.querySelector('#create-btn');
  const loadBtn = document.querySelector('#load-btn');
  const convertExt = document.querySelector('#convert-ext');
  const updateText = document.querySelector('#update-text');
  const updateBtn = document.querySelector('#update-btn');
  const deleteBtn = document.querySelector('#delete-btn');

  loginBtn.onclick = () => signIn();

  const user = await getUser();
  if (!user) return;

  userSection.hidden = false;
  usernameEl.innerText = user.username;
  loginBtn.disabled = true;

  let fragments = [];

  function findFragment(id) {
    return fragments.find((f) => f.id === id);
  }

  function setPreview({ text = '', html = '', imgUrl = '' } = {}) {
    if (imgUrl) {
      previewContainer.innerHTML = `<img src="${imgUrl}" alt="fragment preview" />`;
      return;
    }
    if (html) {
      previewContainer.innerHTML = `<div class="muted">Rendered HTML</div><div style="background:#1c1c25;padding:.75rem;border-radius:8px">${html}</div>`;
      return;
    }
    previewContainer.innerHTML = '<pre id="preview-text"></pre>';
    previewContainer.querySelector('pre').textContent = text || '';
  }

  function renderTable() {
    if (!fragments.length) {
      fragmentsBody.innerHTML = `<tr><td colspan="4" class="muted">No fragments yet.</td></tr>`;
      return;
    }
    fragmentsBody.innerHTML = fragments
      .map(
        (f) => `
        <tr data-id="${f.id}">
          <td>${f.id}</td>
          <td>${f.type}</td>
          <td>${f.size ?? 0}</td>
          <td class="actions">
            <button data-action="view">View</button>
            ${
              f.type.startsWith('text/markdown')
                ? '<button data-action="html">HTML</button>'
                : ''
            }
            ${f.type.startsWith('image/') ? '<button data-action="jpg">JPG</button>' : ''}
            <button data-action="delete" style="background:#b22">Delete</button>
          </td>
        </tr>`
      )
      .join('');
  }

  async function refreshFragments() {
    setStatus(statusEl, 'Loading fragments...');
    const { fragments: list } = await listFragments(user, { expand: true });
    fragments = list || [];
    renderTable();
    setStatus(statusEl, `Loaded ${fragments.length} fragment(s).`);
  }

  async function handleCreate() {
    const selectedType = createType.value;
    const file = createFile.files?.[0];
    let body = createText.value;
    let type = selectedType;

    if (file) {
      body = file;
      type = file.type || selectedType;
    }

    if (!body) {
      alert('Please enter text/JSON or choose a file.');
      return;
    }

    setStatus(statusEl, 'Creating fragment...');
    const { fragment } = await createFragment(user, { type, data: body });
    await refreshFragments();
    selectedIdInput.value = fragment.id;
    setStatus(statusEl, `Created fragment ${fragment.id}`);
  }

  async function loadPreview(ext = '') {
    const id = selectedIdInput.value.trim();
    if (!id) {
      alert('Select a fragment first.');
      return;
    }
    const frag = findFragment(id);
    if (!frag) {
      setStatus(statusEl, 'Unknown fragment id', 'error');
      return;
    }

    selectedMeta.textContent = `${frag.type} • ${frag.size ?? 0} bytes`;

    try {
      if (ext === '.jpg' || ext === '.png' || frag.type.startsWith('image/')) {
        const blob = await getFragmentData(user, id, { ext, as: 'blob' });
        const url = await asDataUrl(blob);
        setPreview({ imgUrl: url });
      } else if (ext === '.html') {
        const html = await getFragmentData(user, id, { ext, as: 'text' });
        setPreview({ html });
      } else {
        const text = await getFragmentData(user, id, { ext, as: 'text' });
        setPreview({ text });
        updateText.value = text;
      }
      setStatus(statusEl, `Loaded ${id}${ext}`);
    } catch (err) {
      setStatus(statusEl, err.message, 'error');
    }
  }

  async function handleUpdate() {
    const id = selectedIdInput.value.trim();
    const frag = findFragment(id);
    if (!frag) {
      alert('Select a fragment first.');
      return;
    }
    if (!frag.type.startsWith('text/')) {
      alert('Update only supports text/markdown/json fragments here.');
      return;
    }
    const body = updateText.value;
    if (!body) {
      alert('Enter updated content first.');
      return;
    }
    setStatus(statusEl, `Updating ${id}...`);
    await updateFragment(user, id, { type: frag.type, data: body });
    await refreshFragments();
    setStatus(statusEl, `Updated ${id}`);
  }

  async function handleDelete(id) {
    if (!id) return;
    if (!confirm(`Delete ${id}?`)) return;
    await deleteFragment(user, id);
    fragments = fragments.filter((f) => f.id !== id);
    renderTable();
    setPreview();
    selectedIdInput.value = '';
    updateText.value = '';
    setStatus(statusEl, `Deleted ${id}`);
  }

  fragmentsBody.addEventListener('click', async (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const tr = btn.closest('tr');
    const id = tr?.dataset.id;
    if (!id) return;
    selectedIdInput.value = id;
    switch (btn.dataset.action) {
      case 'view':
        convertExt.value = '';
        await loadPreview('');
        break;
      case 'html':
        convertExt.value = '.html';
        await loadPreview('.html');
        break;
      case 'jpg':
        convertExt.value = '.jpg';
        await loadPreview('.jpg');
        break;
      case 'delete':
        await handleDelete(id);
        break;
      default:
        break;
    }
  });

  createBtn.onclick = () => handleCreate().catch((err) => setStatus(statusEl, err.message, 'error'));
  loadBtn.onclick = () => loadPreview(convertExt.value);
  updateBtn.onclick = () => handleUpdate().catch((err) => setStatus(statusEl, err.message, 'error'));
  deleteBtn.onclick = () => handleDelete(selectedIdInput.value.trim());

  await refreshFragments();
}

addEventListener('DOMContentLoaded', () => {
  init().catch((err) => console.error(err));
});
