'use client';
import { useState, useRef } from 'react';

const DRINK_OPTIONS    = ['Coffee', 'Matcha', 'Other'];
const INCLUDED_DRINKS  = 2;
const INCLUDED_FLAVORS = 4;

function toggle(list, value) {
  return list.includes(value) ? list.filter(v => v !== value) : [...list, value];
}

export default function BookingForm({ flavors = [] }) {
  const [status, setStatus]   = useState('idle'); // idle | sending | success | error
  const [drinks, setDrinks]   = useState([]);
  const [picked, setPicked]   = useState([]);     // selected flavors
  const [drinkError, setDrinkError] = useState(false);
  const formRef               = useRef(null);

  const minDate = new Date().toISOString().split('T')[0];

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formRef.current.checkValidity()) { formRef.current.reportValidity(); return; }
    if (drinks.length === 0) { setDrinkError(true); return; }

    setStatus('sending');
    const data = {
      ...Object.fromEntries(new FormData(formRef.current)),
      drinks:  drinks.join(', '),
      flavors: picked.join(', '),
    };

    try {
      const res = await fetch('/api/bookings', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <section className="book-section" id="book">
        <div className="container">
          <div className="form-success">
            <div className="success-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h3>Request Received!</h3>
            <p>Thanks for reaching out. We&apos;ll get back to you within 48 hours.</p>
            <p>Heads up: your date isn&apos;t reserved until the deposit is paid.</p>
            <a href="mailto:cafein.coffeecart@gmail.com" className="btn btn-ghost-dark">Email Us Directly</a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="book-section" id="book">
      <div className="container">
        <p className="label light">Ready to Book?</p>
        <h2 className="section-title light">Bring CAFE!N to Your Event</h2>
        <p className="section-sub light">
          Fill out the form and we&apos;ll get back to you within 48 hours. Or email us directly at{' '}
          <a href="mailto:cafein.coffeecart@gmail.com" className="inline-link">cafein.coffeecart@gmail.com</a>
        </p>

        <form className="booking-form" ref={formRef} onSubmit={handleSubmit} noValidate>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Your Name <span className="req">*</span></label>
              <input type="text" id="name" name="name" required placeholder="Jane Smith"/>
            </div>
            <div className="form-group">
              <label htmlFor="email">Email Address <span className="req">*</span></label>
              <input type="email" id="email" name="email" required placeholder="jane@example.com"/>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input type="tel" id="phone" name="phone" placeholder="(615) 000-0000"/>
            </div>
            <div className="form-group">
              <label htmlFor="event_type">Event Type <span className="req">*</span></label>
              <select id="event_type" name="event_type" required defaultValue="">
                <option value="" disabled>Select type...</option>
                <option value="Wedding">Wedding</option>
                <option value="Corporate Event">Corporate Event</option>
                <option value="Birthday Party">Birthday Party</option>
                <option value="Baby Shower">Baby Shower</option>
                <option value="Brunch / Private Party">Brunch / Private Party</option>
                <option value="Market / Pop-up">Market / Pop-up</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="event_date">Event Date <span className="req">*</span></label>
              <input type="date" id="event_date" name="event_date" required min={minDate}/>
            </div>
            <div className="form-group">
              <label htmlFor="guests">Estimated Guest Count</label>
              <input type="number" id="guests" name="guests" min="1" placeholder="e.g. 75"/>
            </div>
          </div>
          <div className="form-group full">
            <label htmlFor="location">Event Location / Venue</label>
            <input type="text" id="location" name="location" placeholder="City, TN or venue name"/>
          </div>
          <fieldset className="form-group full choice-group">
            <legend>What do you want us to serve? <span className="req">*</span></legend>
            <div className="choice-chips">
              {DRINK_OPTIONS.map(d => (
                <label key={d} className={`choice-chip${drinks.includes(d) ? ' selected' : ''}`}>
                  <input
                    type="checkbox"
                    checked={drinks.includes(d)}
                    onChange={() => { setDrinks(toggle(drinks, d)); setDrinkError(false); }}
                  />
                  {d}
                </label>
              ))}
            </div>
            <p className={`choice-hint${drinks.length > INCLUDED_DRINKS ? ' upcharge' : ''}`}>
              {drinkError
                ? 'Please pick at least one.'
                : `Pick one or more — up to ${INCLUDED_DRINKS} are included, a 3rd option is an additional charge.`}
            </p>
          </fieldset>

          {flavors.length > 0 && (
            <fieldset className="form-group full choice-group">
              <legend>Pick your flavors</legend>
              <div className="choice-chips">
                {flavors.map(f => (
                  <label key={f} className={`choice-chip${picked.includes(f) ? ' selected' : ''}`}>
                    <input type="checkbox" checked={picked.includes(f)} onChange={() => setPicked(toggle(picked, f))}/>
                    {f}
                  </label>
                ))}
              </div>
              <p className={`choice-hint${picked.length > INCLUDED_FLAVORS ? ' upcharge' : ''}`}>
                {picked.length > INCLUDED_FLAVORS
                  ? `${picked.length} selected — ${picked.length - INCLUDED_FLAVORS} extra flavor${picked.length - INCLUDED_FLAVORS > 1 ? 's' : ''} will be an additional charge.`
                  : `Up to ${INCLUDED_FLAVORS} flavors included (${picked.length}/${INCLUDED_FLAVORS}). Each extra flavor is an additional charge.`}
              </p>
            </fieldset>
          )}

          <div className="form-group full">
            <label htmlFor="message">Anything else we should know?</label>
            <textarea id="message" name="message" rows={4} placeholder="Theme, special requests, questions..."/>
          </div>

          {status === 'error' && (
            <p style={{ color:'#f87171', fontSize:'14px', marginBottom:'12px' }}>
              Something went wrong. Please email us at cafein.coffeecart@gmail.com
            </p>
          )}

          <button type="submit" className="btn btn-submit" disabled={status === 'sending'}>
            {status === 'sending' ? 'Sending...' : 'Send Booking Request'}
          </button>
          <p className="deposit-note">
            Your date is not reserved until the deposit is paid. We&apos;ll send deposit details once we confirm availability.
          </p>
        </form>
      </div>
    </section>
  );
}
