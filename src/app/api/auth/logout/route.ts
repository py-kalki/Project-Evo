import { NextResponse } from 'next/server';
import { clearTokenCookie } from '@/lib/auth';
import { handle } from '@/lib/api';

export async function POST() {
  return handle(async () => {
    const res = NextResponse.json({ ok: true }, { status: 200 });
    await clearTokenCookie(res);
    return res;
  });
}
