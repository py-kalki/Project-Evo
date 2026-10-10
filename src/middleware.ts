/**
 * middleware.ts — Layer 1 of admin protection.
 * Blocks /admin/* pages for non-admin visitors and redirects to /login.
 * The second layer is admin/layout.tsx, which re-checks the session server-side.
 * The third and decisive layer is requireAdmin() called in every /api/admin/* handler.
 */
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set');
  return new TextEncoder().encode(secret);
}

export async function middleware(req: NextRequest): Promise<NextResponse> {
  const pathname = req.nextUrl.pathname;

  // Only guard /admin paths
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // Try Authorization header first, then the httpOnly cookie
  const authHeader = req.headers.get('authorization');
  const tokenFromHeader = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;
  const tokenFromCookie = req.cookies.get('token')?.value ?? null;
  const token = tokenFromHeader ?? tokenFromCookie;

  if (!token) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (payload.role !== 'ADMIN') {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  } catch {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ['/admin/:path*'],
};
