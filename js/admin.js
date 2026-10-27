// CAFEIN — admin.js
// Change this password before deploying!
const ADMIN_PASSWORD = 'cafein2025';
const AUTH_KEY = 'cafein_admin_auth';

// ---- Auth ----
function isLoggedIn() {
  return sessionStorage.getItem(AUTH_KEY) === 'true';
}

function showDashboard() {
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('dashboard').classList.remove('hidden');
  renderList();
}

function showLogin() {
  document.getElementById('loginScreen').classList.remove('hidden');
  document.getElementById('dashboard').classList.add('hidden');
}

document.getElementById('loginForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const pw = document.getElementById('password').value;
  const err = document.getElementById('loginError');
  if (pw === ADMIN_PASSWORD) {
    sessionStorage.setItem(AUTH_KEY, 'true');
    err.classList.add('hidden');
    showDashboard();
  } else {
    err.classList.remove('hidden');
    document.getElementById('password').value = '';
    document.getElementById('password').focus();
  }
});

document.getElementById('logoutBtn').addEventListener('click', () => {
  sessionStorage.removeItem(AUTH_KEY);
  showLogin();
});

// ---- State ----
let activeCategory = 'all';

// ---- Category tabs ----
document.querySelectorAll('.adm-tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.adm-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    activeCategory = btn.dataset.cat;
    renderList();
  });
});

// ---- Render item list ----
const ICONS = {
  zap: `<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  flame: `<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`,
  edit: `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>`,
  trash: `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>`,
};

function fmtPrice(price, cat) {
  const s = price % 1 === 0 ? `$${price}` : `$${price.toFixed(2)}`;
  return cat === 'addons' ? '+' + s : s;
}

function catLabel(cat) {
  return { coffee: 'Coffee', matcha: 'Matcha', addons: 'Add-on' }[cat] || cat;
}

function renderList() {
  const items = getMenuData();
  const filtered = activeCategory === 'all' ? items : items.filter(i => i.category === activeCategory);
  const list = document.getElementById('itemList');

  if (!filtered.length) {
    list.innerHTML = `<div class="empty-state"><p>No items in this category.</p><button class="adm-btn adm-btn-primary" onclick="openModal()">Add First Item</button></div>`;
    return;
  }

  list.innerHTML = filtered.map(item => `
    <div class="item-row" data-id="${item.id}">
      <div class="item-row-body">
        <div class="item-row-top">
          <span class="item-name">${item.name}</span>
          <span class="cat-pill ${item.category}">${catLabel(item.category)}</span>
          ${item.badge ? `<span class="item-badge">${item.badge}</span>` : ''}
          ${item.featured ? `<span class="featured-star" title="Featured">&#9733;</span>` : ''}
        </div>
        ${item.description ? `<p class="item-desc">${item.description}</p>` : ''}
        ${item.ingredients ? `<p class="item-ing"><strong>Ingredients:</strong> ${item.ingredients}</p>` : ''}
        <div class="item-meta">
          <span class="item-price">${fmtPrice(item.price, item.category)}</span>
          ${item.caffeine > 0 ? `<span class="nutr-chip caff">${ICONS.zap}${item.caffeine}mg</span>` : ''}
          ${item.calories > 0 ? `<span class="nutr-chip cals">${ICONS.flame}${item.calories} cal</span>` : ''}
        </div>
      </div>
      <div class="item-row-actions">
        <button class="adm-btn-icon" title="Edit" onclick="openModal('${item.id}')">${ICONS.edit}</button>
        <button class="adm-btn-icon danger" title="Delete" onclick="deleteItem('${item.id}')">${ICONS.trash}</button>
      </div>
    </div>
  `).join('');
}

// ---- Modal ----
const overlay   = document.getElementById('modalOverlay');
const modalTitle = document.getElementById('modalTitle');
const itemForm  = document.getElementById('itemForm');

function openModal(id) {
  itemForm.reset();
  document.getElementById('itemId').value = '';

  if (id) {
    const items = getMenuData();
    const item = items.find(i => i.id === id);
    if (!item) return;
    modalTitle.textContent = 'Edit Menu Item';
    document.getElementById('itemId').value = item.id;
    document.getElementById('iName').value = item.name;
    document.getElementById('iCategory').value = item.category;
    document.getElementById('iDescription').value = item.description || '';
    document.getElementById('iPrice').value = item.price;
    document.getElementById('iBadge').value = item.badge || '';
    document.getElementById('iIngredients').value = item.ingredients || '';
    document.getElementById('iCaffeine').value = item.caffeine || 0;
    document.getElementById('iCalories').value = item.calories || 0;
    document.getElementById('iFeatured').checked = !!item.featured;
  } else {
    modalTitle.textContent = 'Add Menu Item';
  }

  overlay.classList.remove('hidden');
  document.getElementById('iName').focus();
}

function closeModal() {
  overlay.classList.add('hidden');
}

document.getElementById('addItemBtn').addEventListener('click', () => openModal());
document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('cancelBtn').addEventListener('click', closeModal);
overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });

// Close on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

// ---- Save item ----
itemForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const name = document.getElementById('iName').value.trim();
  const category = document.getElementById('iCategory').value;
  const price = parseFloat(document.getElementById('iPrice').value);

  if (!name || !category || isNaN(price)) {
    showToast('Please fill in all required fields.');
    return;
  }

  const items = getMenuData();
  const existingId = document.getElementById('itemId').value;

  const itemData = {
    id: existingId || Date.now().toString(36),
    category,
    name,
    description: document.getElementById('iDescription').value.trim(),
    price,
    ingredients: document.getElementById('iIngredients').value.trim(),
    caffeine: parseInt(document.getElementById('iCaffeine').value) || 0,
    calories: parseInt(document.getElementById('iCalories').value) || 0,
    badge: document.getElementById('iBadge').value.trim(),
    featured: document.getElementById('iFeatured').checked,
  };

  if (existingId) {
    const idx = items.findIndex(i => i.id === existingId);
    if (idx !== -1) items[idx] = itemData;
  } else {
    items.push(itemData);
  }

  saveMenuData(items);
  closeModal();
  renderList();
  showToast(existingId ? 'Item updated.' : 'Item added.');
});

// ---- Delete item ----
function deleteItem(id) {
  const items = getMenuData();
  const item = items.find(i => i.id === id);
  if (!item) return;
  if (!confirm(`Delete "${item.name}"?`)) return;
  saveMenuData(items.filter(i => i.id !== id));
  renderList();
  showToast('Item deleted.');
}

// ---- Reset to default ----
document.getElementById('resetBtn').addEventListener('click', () => {
  if (!confirm('Reset the entire menu to the default? All your custom changes will be lost.')) return;
  resetMenuData();
  renderList();
  showToast('Menu reset to default.');
});

// ---- Export JSON ----
document.getElementById('exportBtn').addEventListener('click', () => {
  const data = JSON.stringify(getMenuData(), null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'cafein-menu.json';
  a.click();
  URL.revokeObjectURL(url);
  showToast('Menu exported.');
});

// ---- Import JSON ----
document.getElementById('importFile').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (evt) => {
    try {
      const parsed = JSON.parse(evt.target.result);
      if (!Array.isArray(parsed)) throw new Error('Not an array');
      saveMenuData(parsed);
      renderList();
      showToast(`Imported ${parsed.length} items.`);
    } catch {
      showToast('Import failed — invalid file.');
    }
    e.target.value = '';
  };
  reader.readAsText(file);
});

// ---- Toast ----
let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.add('hidden'), 2800);
}

// ---- Init ----
if (isLoggedIn()) {
  showDashboard();
} else {
  showLogin();
}
