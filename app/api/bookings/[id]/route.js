import { NextResponse } from 'next/server';
import { updateBookingStatus } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function PATCH(req, { params }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id }     = await params;
  const { status } = await req.json();

  const allowed = ['pending', 'confirmed', 'declined'];
  if (!allowed.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const booking = await updateBookingStatus(id, status);
  return NextResponse.json(booking);
}
