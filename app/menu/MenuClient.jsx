'use client';
import { useState } from 'react';
import './menu.css';

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
  { id: 'coffee', label: 'Coffee' },
  { id: 'matcha', label: 'Matcha' },
  { id: 'addons', label: 'Add-ons' },
];

function fmtPrice(price, isAddon) {
  const n = parseFloat(price);
  const s = n % 1 === 0 ? `$${n}` : `$${n.toFixed(2)}`;
  return isAddon ? '+' + s : s;
}

function MenuItem({ item }) {
  const isAddon = item.category === 'addons';
  return (
    <div className={`m-item${item.featured ? ' featured' : ''}`}>
      {item.image_url && (
        <div className="m-item-img">
          <img src={item.image_url} alt={item.name} loading="lazy"/>
        </div>
      )}
      <div className="m-item-body">
        <div className="m-item-top">
          <h3 className="m-item-name">
            {item.name}
            {item.badge && <span className="m-badge">{item.badge}</span>}
          </h3>
          <span className="m-price">{fmtPrice(item.price, isAddon)}</span>
        </div>
        {item.description && <p className="m-desc">{item.description}</p>}
        {item.ingredients && (
          <p className="m-ing"><span className="m-ing-label">Ingredients:</span> {item.ingredients}</p>
        )}
        {(item.caffeine > 0 || item.calories > 0) && (
          <div className="m-nutrition">
            {item.caffeine > 0 && <span className="m-nutr caff"><ZapIcon />{item.caffeine}mg caffeine</span>}
            {item.calories  > 0 && <span className="m-nutr cals"><FlameIcon />{item.calories} cal</span>}
          </div>
        )}
      </div>
    </div>
  );
}

export default function MenuClient({ items }) {
  const [tab, setTab] = useState('coffee');
  const filtered = items.filter(i => i.category === tab);

  return (
    <div className="menu-page">

      {/* Header */}
      <header className="m-header">
        <div className="m-logo">CAFE<span>!</span>N</div>
        <p className="m-tagline">&quot;The brew that comes to you&quot;</p>
        <div className="m-pills">
          <span className="m-pill coffee">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/>
              <line x1="6" x2="6" y1="2" y2="4"/><line x1="10" x2="10" y1="2" y2="4"/><line x1="14" x2="14" y1="2" y2="4"/>
            </svg>
            Coffee
          </span>
          <span className="m-pill matcha">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
              <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
            </svg>
            Matcha
          </span>
        </div>
      </header>

      {/* Tabs */}
      <div className="m-tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`m-tab${tab === t.id ? ' active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Items */}
      <div className="m-list">
        {filtered.length > 0
          ? filtered.map(item => <MenuItem key={item.id} item={item} />)
          : <p className="m-empty">No items yet.</p>
        }
      </div>

      {/* Footer CTA */}
      <div className="m-footer">
        <p className="m-footer-text">Interested in booking the cart for your event?</p>
        <a href="/#book" className="m-book-btn">Book the Cart</a>
        <a href="mailto:cafein.coffeecart@gmail.com" className="m-email">cafein.coffeecart@gmail.com</a>
        <p className="m-note">* Prices may vary by event. Custom menus available.</p>
      </div>

    </div>
  );
}
