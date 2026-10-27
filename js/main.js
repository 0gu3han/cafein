// CAFEIN — main.js

// --- Sticky nav on scroll ---
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

// --- Mobile nav toggle ---
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', open);
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// --- Menu rendering ---
function fmtPrice(price, isAddon) {
  const str = price % 1 === 0 ? `$${price}` : `$${price.toFixed(2)}`;
  return isAddon ? '+' + str : str;
}

function buildMenuCard(item) {
  const isAddon = item.category === 'addons';
  const nutri = [];
  if (item.caffeine > 0) {
    nutri.push(`<span class="nutr-badge caff"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>${item.caffeine}mg caffeine</span>`);
  }
  if (item.calories > 0) {
    nutri.push(`<span class="nutr-badge cals"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>${item.calories} cal</span>`);
  }

  return `
    <div class="menu-item${item.featured ? ' featured' : ''}">
      <div class="menu-item-main">
        <div class="menu-item-top">
          <h4>${item.name}${item.badge ? `<span class="badge-new">${item.badge}</span>` : ''}</h4>
          <span class="price">${fmtPrice(item.price, isAddon)}</span>
        </div>
        <p class="menu-desc">${item.description}</p>
        ${item.ingredients ? `<p class="menu-ingredients"><span class="ing-label">Ingredients:</span> ${item.ingredients}</p>` : ''}
        ${nutri.length ? `<div class="menu-nutrition">${nutri.join('')}</div>` : ''}
      </div>
    </div>`;
}

function renderMenu() {
  const items = getMenuData();
  ['coffee', 'matcha', 'addons'].forEach(cat => {
    const grid = document.querySelector(`#panel-${cat} .menu-grid`);
    if (!grid) return;
    const catItems = items.filter(i => i.category === cat);
    grid.innerHTML = catItems.length
      ? catItems.map(buildMenuCard).join('')
      : '<p class="menu-empty">No items yet.</p>';
  });
}

// --- Menu tabs ---
document.querySelectorAll('.tab').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.tab;
    document.querySelectorAll('.tab').forEach(t => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    document.querySelectorAll('.menu-panel').forEach(panel => panel.classList.remove('active'));
    document.getElementById('panel-' + target).classList.add('active');
  });
});

// --- Booking form ---
const form       = document.getElementById('bookingForm');
const successBox = document.getElementById('formSuccess');
const submitBtn  = document.getElementById('submitBtn');

const dateInput = document.getElementById('date');
if (dateInput) {
  dateInput.setAttribute('min', new Date().toISOString().split('T')[0]);
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!form.checkValidity()) { form.reportValidity(); return; }

  submitBtn.textContent = 'Sending...';
  submitBtn.disabled = true;

  const action = form.getAttribute('action');

  if (action.includes('YOUR_FORM_ID')) {
    const data = new FormData(form);
    const lines = [];
    data.forEach((val, key) => { if (val) lines.push(key + ': ' + val); });
    window.location.href = 'mailto:cafein.coffeecart@gmail.com?subject='
      + encodeURIComponent('CAFEIN Booking Request')
      + '&body=' + encodeURIComponent(lines.join('\n'));
    submitBtn.textContent = 'Send Booking Request';
    submitBtn.disabled = false;
    return;
  }

  try {
    const res = await fetch(action, {
      method: 'POST',
      body: new FormData(form),
      headers: { 'Accept': 'application/json' }
    });
    if (res.ok) {
      form.classList.add('hidden');
      successBox.classList.remove('hidden');
    } else { throw new Error(); }
  } catch {
    submitBtn.textContent = 'Send Booking Request';
    submitBtn.disabled = false;
    alert('Something went wrong. Please email us at cafein.coffeecart@gmail.com');
  }
});

// --- Active nav on scroll ---
const sections    = document.querySelectorAll('section[id], footer[id]');
const navLinksAll = document.querySelectorAll('.nav-link');

const scrollObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinksAll.forEach(l => l.classList.remove('active'));
      const a = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
      if (a) a.classList.add('active');
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => scrollObserver.observe(s));

// --- Init ---
renderMenu();
