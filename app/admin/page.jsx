'use client';
import './admin.css';
import { useState, useEffect, useCallback } from 'react';

// ── Icon helpers ──────────────────────────────────────────────────────────
const Icon = ({ d, size = 15, points, cx, cy, r, ...rest }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...rest}>
    {d && <path d={d}/>}
    {points && <polyline points={points}/>}
    {cx && <circle cx={cx} cy={cy} r={r}/>}
  </svg>
);

// ── Utility ───────────────────────────────────────────────────────────────
function fmtPrice(price, cat) {
  const n = parseFloat(price);
  const s = n % 1 === 0 ? `$${n}` : `$${n.toFixed(2)}`;
  return cat === 'addons' ? '+' + s : s;
}
function catLabel(cat) {
  return { coffee: 'Coffee', matcha: 'Matcha', addons: 'Add-on' }[cat] || cat;
}
function statusColor(s) {
  return { pending: '#a0632e', confirmed: '#6a8f55', declined: '#c0393a' }[s] || '#888';
}
function statusBg(s) {
  return { pending: '#fff3e0', confirmed: '#e8f0e0', declined: '#fce8e8' }[s] || '#f0f0f0';
}

// ── EMPTY ITEM TEMPLATE ───────────────────────────────────────────────────
const emptyItem = { name:'', category:'', description:'', price:'', ingredients:'', caffeine:'', calories:'', badge:'', featured:false, image_url:'' };

// ── MAIN COMPONENT ────────────────────────────────────────────────────────
export default function AdminPage() {
  const [authState, setAuthState]   = useState('loading'); // loading|login|dashboard
  const [password,  setPassword]    = useState('');
  const [loginErr,  setLoginErr]    = useState('');
  const [activeTab, setActiveTab]   = useState('menu');    // menu|bookings
  const [catFilter, setCatFilter]   = useState('all');
  const [menuItems, setMenuItems]   = useState([]);
  const [bookings,  setBookings]    = useState([]);
  const [modal,     setModal]       = useState(null);      // null | {mode:'add'|'edit', item}
  const [formData,  setFormData]    = useState(emptyItem);
  const [saving,    setSaving]      = useState(false);
  const [uploading, setUploading]   = useState(false);
  const [qrOpen,    setQrOpen]      = useState(false);
  const [toast,     setToast]       = useState(null);
  const [toastTimer, setToastTimer] = useState(null);

  // ── Auth check on mount ────────────────────────────────────────────────
  useEffect(() => {
    fetch('/api/auth/check')
      .then(r => r.ok ? setAuthState('dashboard') : setAuthState('login'))
      .catch(() => setAuthState('login'));
  }, []);

  // ── Fetch data after auth ──────────────────────────────────────────────
  const fetchMenu = useCallback(async () => {
    const r = await fetch('/api/menu');
    if (r.ok) setMenuItems(await r.json());
  }, []);

  const fetchBookings = useCallback(async () => {
    const r = await fetch('/api/bookings');
    if (r.ok) setBookings(await r.json());
  }, []);

  useEffect(() => {
    if (authState !== 'dashboard') return;
    fetchMenu();
    fetchBookings();
  }, [authState, fetchMenu, fetchBookings]);

  // ── Toast ──────────────────────────────────────────────────────────────
  function showToast(msg) {
    setToast(msg);
    if (toastTimer) clearTimeout(toastTimer);
    setToastTimer(setTimeout(() => setToast(null), 2800));
  }

  // ── Login ──────────────────────────────────────────────────────────────
  async function handleLogin(e) {
    e.preventDefault();
    setLoginErr('');
    const r = await fetch('/api/auth/login', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ password }),
    });
    if (r.ok) {
      setAuthState('dashboard');
    } else {
      setLoginErr('Incorrect password. Try again.');
      setPassword('');
    }
  }

  // ── Logout ─────────────────────────────────────────────────────────────
  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setAuthState('login');
    setPassword('');
  }

  // ── Open modal ─────────────────────────────────────────────────────────
  function openAdd() {
    setFormData(emptyItem);
    setModal({ mode: 'add' });
  }
  function openEdit(item) {
    setFormData({
      name:        item.name,
      category:    item.category,
      description: item.description || '',
      price:       item.price,
      ingredients: item.ingredients || '',
      caffeine:    item.caffeine || 0,
      calories:    item.calories || 0,
      badge:       item.badge || '',
      featured:    item.featured || false,
      image_url:   item.image_url || '',
      _id:         item.id,
    });
    setModal({ mode: 'edit', item });
  }
  function closeModal() { setModal(null); }

  // ── Save menu item ─────────────────────────────────────────────────────
  async function handleSave(e) {
    e.preventDefault();
    if (!formData.name || !formData.category || formData.price === '') return;
    setSaving(true);

    const payload = {
      ...formData,
      price:    parseFloat(formData.price),
      caffeine: parseInt(formData.caffeine)  || 0,
      calories: parseInt(formData.calories)  || 0,
    };

    const isEdit = modal.mode === 'edit';
    const url    = isEdit ? `/api/menu/${formData._id}` : '/api/menu';
    const method = isEdit ? 'PUT' : 'POST';

    const r = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });

    setSaving(false);
    if (r.ok) {
      await fetchMenu();
      closeModal();
      showToast(isEdit ? 'Item updated.' : 'Item added.');
    } else {
      showToast('Something went wrong.');
    }
  }

  // ── Delete menu item ───────────────────────────────────────────────────
  async function handleDelete(item) {
    if (!confirm(`Delete "${item.name}"?`)) return;
    const r = await fetch(`/api/menu/${item.id}`, { method: 'DELETE' });
    if (r.ok) { await fetchMenu(); showToast('Item deleted.'); }
  }

  // ── Update booking status ──────────────────────────────────────────────
  async function handleStatus(booking, status) {
    const r = await fetch(`/api/bookings/${booking.id}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ status }),
    });
    if (r.ok) { await fetchBookings(); showToast(`Marked as ${status}.`); }
  }

  // ── Image upload ───────────────────────────────────────────────────────
  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    const r = await fetch('/api/upload', { method: 'POST', body: fd });
    setUploading(false);
    if (r.ok) {
      const { url } = await r.json();
      setFormData(d => ({ ...d, image_url: url }));
    } else {
      showToast('Image upload failed.');
    }
  }

  // ── Field change helper ────────────────────────────────────────────────
  const field = (key) => ({
    value:    formData[key],
    onChange: (e) => setFormData(d => ({ ...d, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })),
  });

  // ── Filtered menu items ────────────────────────────────────────────────
  const visibleItems = catFilter === 'all' ? menuItems : menuItems.filter(i => i.category === catFilter);

  // ── Render ─────────────────────────────────────────────────────────────

  // Loading
  if (authState === 'loading') {
    return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'#f5ede0', fontFamily:'sans-serif', color:'#7a6055' }}>Loading...</div>;
  }

  // Login
  if (authState === 'login') {
    return (
      <div className="login-screen">
        <div className="login-card">
          <div className="login-logo">CAFE<span>!</span>N</div>
          <p className="login-sub">Menu Admin</p>
          <form onSubmit={handleLogin} autoComplete="off">
            <div className="field">
              <label htmlFor="pw">Password</label>
              <input
                type="password" id="pw" placeholder="Enter admin password"
                value={password} onChange={e => setPassword(e.target.value)}
                autoComplete="current-password" required
              />
            </div>
            {loginErr && <p className="login-error">{loginErr}</p>}
            <button type="submit" className="btn-login">Sign In</button>
          </form>
          <a href="/" className="back-link">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            Back to site
          </a>
        </div>
      </div>
    );
  }

  // Dashboard
  return (
    <>
      {/* Header */}
      <header className="adm-header">
        <div className="adm-header-inner">
          <div className="adm-logo">CAFE<span>!</span>N <span className="adm-badge">Admin</span></div>
          <div className="adm-header-actions">
            <button className="adm-btn adm-btn-ghost" onClick={() => setQrOpen(true)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                <rect x="5" y="5" width="3" height="3" fill="currentColor" stroke="none"/>
                <rect x="16" y="5" width="3" height="3" fill="currentColor" stroke="none"/>
                <rect x="5" y="16" width="3" height="3" fill="currentColor" stroke="none"/>
                <path d="M14 14h3v3h-3z"/><path d="M17 17h4"/><path d="M17 21v-4"/>
              </svg>
              QR Code
            </button>
            <a href="/" target="_blank" className="adm-btn adm-btn-ghost">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/>
              </svg>
              View Site
            </a>
            <button className="adm-btn adm-btn-danger-ghost" onClick={handleLogout}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>
              </svg>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main tabs */}
      <main className="adm-main">
        <div className="adm-page-tabs">
          <button className={`adm-page-tab${activeTab === 'menu' ? ' active' : ''}`} onClick={() => setActiveTab('menu')}>
            Menu Items <span className="tab-count">{menuItems.length}</span>
          </button>
          <button className={`adm-page-tab${activeTab === 'bookings' ? ' active' : ''}`} onClick={() => setActiveTab('bookings')}>
            Bookings
            {bookings.filter(b => b.status === 'pending').length > 0 && (
              <span className="tab-count pending">{bookings.filter(b => b.status === 'pending').length}</span>
            )}
          </button>
        </div>

        {/* ── MENU TAB ── */}
        {activeTab === 'menu' && (
          <>
            <div className="adm-toolbar">
              <div className="adm-tabs">
                {['all','coffee','matcha','addons'].map(cat => (
                  <button key={cat} className={`adm-tab${catFilter === cat ? ' active' : ''}`} onClick={() => setCatFilter(cat)}>
                    {cat === 'all' ? 'All' : catLabel(cat)}
                  </button>
                ))}
              </div>
              <div className="adm-toolbar-right">
                <button className="adm-btn adm-btn-primary" onClick={openAdd}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14"/><path d="M12 5v14"/>
                  </svg>
                  Add Item
                </button>
              </div>
            </div>

            <div className="item-list">
              {visibleItems.length === 0 ? (
                <div className="empty-state">
                  <p>No items in this category.</p>
                  <button className="adm-btn adm-btn-primary" onClick={openAdd}>Add First Item</button>
                </div>
              ) : visibleItems.map(item => (
                <div className={`item-row${item.image_url ? ' has-thumb' : ''}`} key={item.id}>
                  {item.image_url && (
                    <div className="item-thumb">
                      <img src={item.image_url} alt={item.name} />
                    </div>
                  )}
                  <div className="item-row-body">
                    <div className="item-row-top">
                      <span className="item-name">{item.name}</span>
                      <span className={`cat-pill ${item.category}`}>{catLabel(item.category)}</span>
                      {item.badge && <span className="item-badge">{item.badge}</span>}
                      {item.featured && <span className="featured-star" title="Featured">★</span>}
                    </div>
                    {item.description && <p className="item-desc">{item.description}</p>}
                    {item.ingredients && <p className="item-ing"><strong>Ingredients:</strong> {item.ingredients}</p>}
                    <div className="item-meta">
                      <span className="item-price">{fmtPrice(item.price, item.category)}</span>
                      {item.caffeine > 0 && (
                        <span className="nutr-chip caff">
                          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                          </svg>
                          {item.caffeine}mg
                        </span>
                      )}
                      {item.calories > 0 && (
                        <span className="nutr-chip cals">
                          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
                          </svg>
                          {item.calories} cal
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="item-row-actions">
                    <button className="adm-btn-icon" title="Edit" onClick={() => openEdit(item)}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                      </svg>
                    </button>
                    <button className="adm-btn-icon danger" title="Delete" onClick={() => handleDelete(item)}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── BOOKINGS TAB ── */}
        {activeTab === 'bookings' && (
          <div className="bookings-list">
            {bookings.length === 0 ? (
              <div className="empty-state"><p>No booking requests yet.</p></div>
            ) : bookings.map(b => {
              const date = new Date(b.event_date).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });
              const created = new Date(b.created_at).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });
              return (
                <div className="booking-row" key={b.id}>
                  <div className="booking-row-header">
                    <div className="booking-row-top">
                      <span className="booking-name">{b.name}</span>
                      <span className="booking-status-badge" style={{ background: statusBg(b.status), color: statusColor(b.status) }}>
                        {b.status}
                      </span>
                    </div>
                    <div className="booking-meta">
                      <span>{b.event_type}</span>
                      <span>&middot;</span>
                      <span>{date}</span>
                      {b.guests && <><span>&middot;</span><span>{b.guests} guests</span></>}
                      {b.location && <><span>&middot;</span><span>{b.location}</span></>}
                    </div>
                  </div>
                  <div className="booking-contact">
                    <a href={`mailto:${b.email}`}>{b.email}</a>
                    {b.phone && <span>{b.phone}</span>}
                  </div>
                  {b.message && <p className="booking-message">&ldquo;{b.message}&rdquo;</p>}
                  <div className="booking-row-footer">
                    <span className="booking-received">Received {created}</span>
                    <div className="booking-actions">
                      {b.status !== 'confirmed' && (
                        <button className="adm-btn adm-btn-confirm" onClick={() => handleStatus(b, 'confirmed')}>Confirm</button>
                      )}
                      {b.status !== 'declined' && (
                        <button className="adm-btn adm-btn-decline" onClick={() => handleStatus(b, 'declined')}>Decline</button>
                      )}
                      {b.status !== 'pending' && (
                        <button className="adm-btn adm-btn-ghost" onClick={() => handleStatus(b, 'pending')}>Reset</button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ── MODAL ── */}
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">{modal.mode === 'add' ? 'Add Menu Item' : 'Edit Menu Item'}</h2>
              <button className="modal-close" onClick={closeModal} aria-label="Close">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                </svg>
              </button>
            </div>
            <form className="modal-form" onSubmit={handleSave} noValidate>
              <div className="modal-row">
                <div className="modal-field">
                  <label>Name <span className="req">*</span></label>
                  <input type="text" required placeholder="e.g. Iced Latte" {...field('name')}/>
                </div>
                <div className="modal-field">
                  <label>Category <span className="req">*</span></label>
                  <select required {...field('category')}>
                    <option value="" disabled>Select...</option>
                    <option value="coffee">Coffee</option>
                    <option value="matcha">Matcha</option>
                    <option value="addons">Add-on</option>
                  </select>
                </div>
              </div>
              <div className="modal-field">
                <label>Description</label>
                <input type="text" placeholder="Short description" {...field('description')}/>
              </div>
              <div className="modal-row">
                <div className="modal-field">
                  <label>Price ($) <span className="req">*</span></label>
                  <input type="number" required min="0" step="0.25" placeholder="5.00" {...field('price')}/>
                </div>
                <div className="modal-field">
                  <label>Badge Label</label>
                  <input type="text" placeholder="e.g. Fan Fave" {...field('badge')}/>
                </div>
              </div>
              <div className="modal-field">
                <label>Ingredients</label>
                <input type="text" placeholder="e.g. Espresso, oat milk, vanilla" {...field('ingredients')}/>
              </div>
              <div className="modal-row">
                <div className="modal-field">
                  <label>Caffeine (mg)</label>
                  <input type="number" min="0" placeholder="0" {...field('caffeine')}/>
                </div>
                <div className="modal-field">
                  <label>Calories</label>
                  <input type="number" min="0" placeholder="0" {...field('calories')}/>
                </div>
              </div>
              <div className="modal-field">
                <label>Photo</label>
                <div className="img-upload-area">
                  {formData.image_url ? (
                    <div className="img-preview">
                      <img src={formData.image_url} alt="preview" />
                      <button type="button" className="img-remove" onClick={() => setFormData(d => ({ ...d, image_url: '' }))}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <label className="img-upload-btn">
                      {uploading ? (
                        <span>Uploading...</span>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/>
                          </svg>
                          <span>Upload photo</span>
                          <small>JPG, PNG, WEBP · max 5MB</small>
                        </>
                      )}
                      <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageUpload} disabled={uploading} style={{ display:'none' }} />
                    </label>
                  )}
                </div>
              </div>
              <div className="modal-check">
                <label className="check-label">
                  <input type="checkbox" checked={formData.featured} onChange={e => setFormData(d => ({ ...d, featured: e.target.checked }))}/>
                  <span>Featured item <small>(highlighted on menu)</small></span>
                </label>
              </div>
              <div className="modal-actions">
                <button type="button" className="adm-btn adm-btn-ghost" onClick={closeModal}>Cancel</button>
                <button type="submit" className="adm-btn adm-btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── QR MODAL ── */}
      {qrOpen && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setQrOpen(false)}>
          <div className="modal qr-modal">
            <div className="modal-header">
              <h2 className="modal-title">Customer Menu QR Code</h2>
              <button className="modal-close" onClick={() => setQrOpen(false)} aria-label="Close">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                </svg>
              </button>
            </div>
            <div className="qr-body">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent((typeof window !== 'undefined' ? window.location.origin : '') + '/menu')}&color=2c1810&bgcolor=f5ede0`}
                alt="QR code for /menu"
                className="qr-img"
              />
              <p className="qr-url">{typeof window !== 'undefined' ? window.location.origin : ''}/menu</p>
              <p className="qr-hint">Print or screenshot this code. Customers scan it to view your live menu.</p>
              <div className="qr-actions">
                <a
                  href={`https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent((typeof window !== 'undefined' ? window.location.origin : '') + '/menu')}&color=2c1810&bgcolor=f5ede0`}
                  download="cafein-menu-qr.png"
                  className="adm-btn adm-btn-primary"
                  target="_blank"
                  rel="noreferrer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="3" y2="15"/>
                  </svg>
                  Download PNG
                </a>
                <a href="/menu" target="_blank" className="adm-btn adm-btn-ghost">Open Menu Page</a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TOAST ── */}
      {toast && <div className="toast">{toast}</div>}
    </>
  );
}
