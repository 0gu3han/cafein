import { NextResponse } from 'next/server';
import { initDB, getBookings, createBooking } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { sendBookingNotification } from '@/lib/email';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await initDB();
  const bookings = await getBookings();
  return NextResponse.json(bookings);
}

export async function POST(req) {
  await initDB();
  const body = await req.json();

  if (!body.name || !body.email || !body.event_type || !body.event_date) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const booking = await createBooking(body);
  sendBookingNotification(booking).catch(console.error); // non-blocking
  return NextResponse.json(booking, { status: 201 });
}
