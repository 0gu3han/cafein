'use client';
import { useState, useRef } from 'react';

export default function BookingForm() {
  const [status, setStatus]   = useState('idle'); // idle | sending | success | error
  const formRef               = useRef(null);

  const minDate = new Date().toISOString().split('T')[0];

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formRef.current.checkValidity()) { formRef.current.reportValidity(); return; }

    setStatus('sending');
    const data = Object.fromEntries(new FormData(formRef.current));

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
        </form>
      </div>
    </section>
  );
}
