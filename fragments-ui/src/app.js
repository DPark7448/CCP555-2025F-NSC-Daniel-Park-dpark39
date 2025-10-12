// src/app.js
import { signIn, getUser } from './auth';
import { getUserFragments, createTextFragment, getFragmentById } from './api';

async function init() {
  const userSection = document.querySelector('#user');
  const loginBtn     = document.querySelector('#login');
  const createBtn    = document.querySelector('#create');
  const openBtn      = document.querySelector('#open');
  const out          = document.querySelector('#out');
  const dataOut      = document.querySelector('#data');

  loginBtn.onclick = () => signIn();

  const user = await getUser();
  if (!user) return;

  userSection.hidden = false;
  userSection.querySelector('.username').innerText = user.username;
  loginBtn.disabled = true;

  let lastId = null;

  async function refreshList() {
    const list = await getUserFragments(user);
    out.textContent = JSON.stringify(list, null, 2);
    // capture newest id if present
    if (list?.fragments?.length) {
      lastId = list.fragments[list.fragments.length - 1];
    }
  }

  await refreshList();

  createBtn.onclick = async () => {
    const { fragment } = await createTextFragment(user, 'hello from UI');
    lastId = fragment.id;
    await refreshList(); // show the id in the list
    alert(`Created: ${fragment.id}`);
  };

  openBtn.onclick = async () => {
    if (!lastId) {
      alert('No fragment id yet — create one first.');
      return;
    }
    const text = await getFragmentById(user, lastId);
    dataOut.textContent = text;
  };
}

addEventListener('DOMContentLoaded', init);
