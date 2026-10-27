import { initDB, getMenuItems } from '@/lib/db';
import Nav from '@/app/components/Nav';
import MenuSection from '@/app/components/MenuSection';
import BookingForm from '@/app/components/BookingForm';

// ── Static SVG icons ──────────────────────────────────────────────────────
const HeartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
  </svg>
);
const SparklesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5.8 11.3 2 22l10.7-3.79"/><path d="M4 3h.01"/><path d="M22 8h.01"/><path d="M15 2h.01"/><path d="M22 20h.01"/>
    <path d="m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10"/>
    <path d="m22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11c-.11.7-.72 1.22-1.43 1.22H17"/>
    <path d="m11 2 .33.82c.34.86-.2 1.82-1.11 1.98C9.52 4.9 9 5.52 9 6.23V7"/>
    <path d="M11 13c1.93 1.93 2.83 4.17 2 5-.83.83-3.07-.07-5-2-1.93-1.93-2.83-4.17-2-5 .83-.83 3.07.07 5 2Z"/>
  </svg>
);
const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const CoffeeSmIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/>
    <line x1="6" x2="6" y1="2" y2="4"/><line x1="10" x2="10" y1="2" y2="4"/><line x1="14" x2="14" y1="2" y2="4"/>
  </svg>
);
const LeafSmIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
  </svg>
);
const MapPinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const HeartSmIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
  </svg>
);
const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

// ── Page (server component — fetches menu from DB) ────────────────────────
export default async function Page() {
  await initDB();
  const items = await getMenuItems();
  // Ensure numeric fields are numbers (Postgres NUMERIC comes back as string)
  const safeItems = items.map(item => ({
    ...item,
    price:    parseFloat(item.price),
    caffeine: Number(item.caffeine),
    calories: Number(item.calories),
  }));

  return (
    <>
      <Nav />

      {/* ── Hero ── */}
      <section className="hero" id="home">
        <div className="hero-bg-beans" aria-hidden="true">
          {/* bean 1 — large, top left */}
          <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="100" cy="100" rx="78" ry="48" stroke="#7a4828" strokeWidth="3" fill="none"/>
            <path d="M100 52 Q125 85 100 148" stroke="#7a4828" strokeWidth="2" fill="none"/>
          </svg>
          {/* bean 2 — medium, left middle */}
          <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="100" cy="100" rx="78" ry="48" stroke="#7a4828" strokeWidth="3" fill="none"/>
            <path d="M100 52 Q125 85 100 148" stroke="#7a4828" strokeWidth="2" fill="none"/>
          </svg>
          {/* bean 3 — large, top right */}
          <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="100" cy="100" rx="78" ry="48" stroke="#7a4828" strokeWidth="3" fill="none"/>
            <path d="M100 52 Q125 85 100 148" stroke="#7a4828" strokeWidth="2" fill="none"/>
          </svg>
          {/* bean 4 — small, bottom right */}
          <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="100" cy="100" rx="78" ry="48" stroke="#7a4828" strokeWidth="3" fill="none"/>
            <path d="M100 52 Q125 85 100 148" stroke="#7a4828" strokeWidth="2" fill="none"/>
          </svg>
          {/* bean 5 — tiny, center */}
          <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="100" cy="100" rx="78" ry="48" stroke="#7a4828" strokeWidth="3" fill="none"/>
            <path d="M100 52 Q125 85 100 148" stroke="#7a4828" strokeWidth="2" fill="none"/>
          </svg>
          {/* bean 6 — small, bottom left */}
          <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="100" cy="100" rx="78" ry="48" stroke="#7a4828" strokeWidth="3" fill="none"/>
            <path d="M100 52 Q125 85 100 148" stroke="#7a4828" strokeWidth="2" fill="none"/>
          </svg>
        </div>
        <div className="hero-content">
          <h1 className="hero-title">CAFE<span className="bang">!</span>N</h1>
          <p className="hero-tagline">&quot;The brew that comes to you&quot;</p>
          <div className="hero-tags">
            <span>Events</span>
            <span>Weddings</span>
            <span>Private Bookings</span>
          </div>
          <div className="hero-drinks">
            <span className="drink-pill coffee">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/>
                <line x1="6" x2="6" y1="2" y2="4"/><line x1="10" x2="10" y1="2" y2="4"/><line x1="14" x2="14" y1="2" y2="4"/>
              </svg>
              Coffee
            </span>
            <span className="drink-pill matcha">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
                <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
              </svg>
              Matcha
            </span>
          </div>
          <a href="#book" className="btn btn-primary">Book the Cart</a>
          <a href="#menu" className="btn btn-ghost">View Menu</a>
        </div>
        <div className="hero-cart" aria-hidden="true">
          <img src="/CafeinLogo.jpg" alt="CAFEIN coffee cart" className="hero-logo-img"/>
        </div>
      </section>

      {/* ── About ── */}
      <section className="about" id="about">
        <div className="container">
          <p className="label">Who We Are</p>
          <h2 className="section-title">We Bring the <em>Cafe Experience</em> to Your Event</h2>
          <p className="section-sub">
            CAFE!N is a mobile coffee &amp; matcha cart based in Middle Tennessee. Skip the coffee shop
            line &mdash; we set up right at your venue and craft every drink fresh, just the way your guests like it.
          </p>
          <div className="service-cards">
            <div className="service-card">
              <div className="service-icon"><HeartIcon /></div>
              <h3>Weddings</h3>
              <p>An elegant cart experience for your reception, ceremony, or cocktail hour. Customized to match your aesthetic.</p>
            </div>
            <div className="service-card">
              <div className="service-icon"><SparklesIcon /></div>
              <h3>Events</h3>
              <p>Corporate gatherings, markets, pop-ups, school events &mdash; we fuel any crowd, big or small.</p>
            </div>
            <div className="service-card">
              <div className="service-icon"><HomeIcon /></div>
              <h3>Private Bookings</h3>
              <p>Baby showers, birthdays, brunch parties &mdash; make your gathering unforgettable with a barista on-site.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Menu (client component) ── */}
      <MenuSection items={safeItems} />

      {/* ── Booking form (client component) ── */}
      <BookingForm />

      {/* ── Footer ── */}
      <footer className="footer" id="contact">
        <div className="container">
          <div className="footer-logo">CAFE<span>!</span>N</div>
          <p className="footer-tagline">&quot;The brew that comes to you&quot;</p>
          <div className="footer-details">
            <span><CoffeeSmIcon /> Coffee &amp; <LeafSmIcon /> Matcha Cart</span>
            <span><MapPinIcon /> Middle Tennessee</span>
            <span><HeartSmIcon /> Events &middot; Weddings &middot; Private Bookings</span>
          </div>
          <a href="mailto:cafein.coffeecart@gmail.com" className="footer-email">
            <MailIcon /> cafein.coffeecart@gmail.com
          </a>
          <p className="footer-copy">
            &copy; 2025 CAFE!N. All rights reserved.
            &nbsp;&middot;&nbsp;
            <a href="/admin" className="admin-link">Admin</a>
          </p>
        </div>
      </footer>
    </>
  );
}
