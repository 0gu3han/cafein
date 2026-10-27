import { NextResponse } from 'next/server';
import { signToken, setSessionCookie } from '@/lib/auth';

export async function POST(req) {
  const { password } = await req.json();

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }

  const token = await signToken();
  const res   = NextResponse.json({ success: true });
  setSessionCookie(res, token);
  return res;
}
