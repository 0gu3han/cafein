'use client';
import { useEffect, useState } from 'react';

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen]         = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const close = () => setOpen(false);

  return (
    <nav className={`nav${scrolled ? ' scrolled' : ''}`} id="nav">
      <div className="nav-inner">
        <a href="/" className="nav-logo">CAFE<span>!</span>N</a>

        <button
          className="nav-toggle"
          aria-label="Open menu"
          aria-expanded={open}
          onClick={() => setOpen(o => !o)}
        >
          <span/><span/><span/>
        </button>

        <ul className={`nav-links${open ? ' open' : ''}`} id="navLinks">
          <li><a href="#about"  className="nav-link" onClick={close}>About</a></li>
          <li><a href="#menu"   className="nav-link" onClick={close}>Menu</a></li>
          <li><a href="#book"   className="nav-link btn-nav" onClick={close}>Book the Cart</a></li>
        </ul>
      </div>
    </nav>
  );
}
