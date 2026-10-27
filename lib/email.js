import { Resend } from 'resend';

export async function sendBookingNotification(booking) {
  if (!process.env.RESEND_API_KEY) return; // skip if not configured

  const resend = new Resend(process.env.RESEND_API_KEY);

  const date = new Date(booking.event_date).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const row = (label, value) =>
    `<tr>
      <td style="padding:10px 0;border-bottom:1px solid #ecdcc8;color:#7a6055;width:130px;vertical-align:top;">${label}</td>
      <td style="padding:10px 0;border-bottom:1px solid #ecdcc8;font-weight:500;">${value || '—'}</td>
    </tr>`;

  await resend.emails.send({
    from: 'CAFEIN Bookings <no-reply@resend.dev>',
    to:   'cafein.coffeecart@gmail.com',
    subject: `New Booking Request — ${booking.name} (${date})`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;background:#fff;">
        <div style="margin-bottom:24px;">
          <span style="font-size:28px;font-weight:700;color:#2c1810;font-family:Georgia,serif;">CAFE<span style="color:#a0632e">!</span>N</span>
        </div>
        <h1 style="font-size:20px;color:#2c1810;margin-bottom:4px;">New Booking Request</h1>
        <p style="color:#7a6055;margin-bottom:24px;font-size:15px;">Someone wants to book the cart for their event!</p>
        <table style="width:100%;border-collapse:collapse;">
          ${row('Name',       booking.name)}
          ${row('Email',      `<a href="mailto:${booking.email}" style="color:#a0632e;">${booking.email}</a>`)}
          ${row('Phone',      booking.phone)}
          ${row('Event Type', booking.event_type)}
          ${row('Date',       date)}
          ${row('Guests',     booking.guests)}
          ${row('Location',   booking.location)}
          ${row('Message',    booking.message)}
        </table>
        <div style="margin-top:24px;padding:16px;background:#f5ede0;border-radius:12px;">
          <p style="margin:0;color:#7a6055;font-size:13px;">
            Reply to <a href="mailto:${booking.email}" style="color:#a0632e;">${booking.email}</a> to respond to this request.
          </p>
        </div>
      </div>`,
  });
}
