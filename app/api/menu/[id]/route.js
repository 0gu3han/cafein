import { NextResponse } from 'next/server';
import { updateMenuItem, deleteMenuItem } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function PUT(req, { params }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body   = await req.json();
  const item   = await updateMenuItem(id, body);
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(item);
}

export async function DELETE(req, { params }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  await deleteMenuItem(id);
  return NextResponse.json({ success: true });
}
