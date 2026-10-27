'use client';
import { useState } from 'react';

// ── Icon helpers ──────────────────────────────────────────────────────────
const ZapIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);
const FlameIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
  </svg>
);

const TABS = [
  {
    id: 'coffee', label: 'Coffee',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/>
        <line x1="6" x2="6" y1="2" y2="4"/><line x1="10" x2="10" y1="2" y2="4"/><line x1="14" x2="14" y1="2" y2="4"/>
      </svg>
    ),
  },
  {
    id: 'matcha', label: 'Matcha',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
        <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
      </svg>
    ),
  },
  {
    id: 'addons', label: 'Add-ons',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/>
      </svg>
    ),
  },
];

function fmtPrice(price, isAddon) {
  const n   = parseFloat(price);
  const str = n % 1 === 0 ? `$${n}` : `$${n.toFixed(2)}`;
  return isAddon ? '+' + str : str;
}

function MenuItem({ item }) {
  const isAddon = item.category === 'addons';
  return (
    <div className={`menu-item${item.featured ? ' featured' : ''}`}>
      {item.image_url && (
        <div className="menu-item-img">
          <img src={item.image_url} alt={item.name} loading="lazy" />
        </div>
      )}
      <div className="menu-item-main">
        <div className="menu-item-top">
          <h4>
            {item.name}
            {item.badge && <span className="badge-new">{item.badge}</span>}
          </h4>
          <span className="price">{fmtPrice(item.price, isAddon)}</span>
        </div>
        {item.description && <p className="menu-desc">{item.description}</p>}
        {item.ingredients && (
          <p className="menu-ingredients">
            <span className="ing-label">Ingredients:</span> {item.ingredients}
          </p>
        )}
        {(item.caffeine > 0 || item.calories > 0) && (
          <div className="menu-nutrition">
            {item.caffeine > 0 && (
              <span className="nutr-badge caff"><ZapIcon />{item.caffeine}mg caffeine</span>
            )}
            {item.calories > 0 && (
              <span className="nutr-badge cals"><FlameIcon />{item.calories} cal</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function MenuSection({ items }) {
  const [activeTab, setActiveTab] = useState('coffee');
  const filtered = items.filter(i => i.category === activeTab);

  return (
    <section className="menu-section" id="menu">
      <div className="container">
        <p className="label">What We Serve</p>
        <h2 className="section-title">Our Menu</h2>
        <p className="section-sub">Every drink is made to order. Custom event menus available &mdash; just ask.</p>

        <div className="menu-tabs" role="tablist">
          {TABS.map(({ id, label, icon }) => (
            <button
              key={id}
              className={`tab${activeTab === id ? ' active' : ''}`}
              role="tab"
              aria-selected={activeTab === id}
              onClick={() => setActiveTab(id)}
            >
              {icon} {label}
            </button>
          ))}
        </div>

        <div className="menu-grid">
          {filtered.length > 0
            ? filtered.map(item => <MenuItem key={item.id} item={item} />)
            : <p className="menu-empty">No items in this category.</p>
          }
        </div>

        <div className="menu-footer">
          <p className="menu-note">* Prices may vary by event. Custom menus available upon request.</p>
          <a href="/menu" className="btn btn-primary menu-full-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18 15 12 9 6"/>
            </svg>
            View Full Menu
          </a>
        </div>
      </div>
    </section>
  );
}
