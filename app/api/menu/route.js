import { NextResponse } from 'next/server';
import { initDB, getMenuItems, createMenuItem } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  await initDB();
  const items = await getMenuItems();
  return NextResponse.json(items);
}

export async function POST(req) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  if (!body.name || !body.category || body.price === undefined) {
    return NextResponse.json({ error: 'name, category, and price are required' }, { status: 400 });
  }

  await initDB();
  const item = await createMenuItem(body);
  return NextResponse.json(item, { status: 201 });
}
