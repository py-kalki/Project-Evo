/**
 * auth.ts — password hashing, JWT signing/verifying, and session guards.
 * Every guard that needs login calls requireUser() or requireAdmin().
 */
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { err } from './api';
import { NextResponse } from 'next/server';

const BCRYPT_COST = 12;
const JWT_EXPIRY = '7d';
const COOKIE_NAME = 'token';

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set');
  return new TextEncoder().encode(secret);
}

// ── Password ──────────────────────────────────────────────────────────────────

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_COST);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// ── JWT ───────────────────────────────────────────────────────────────────────

export interface SessionPayload {
  sub: string;   // userId
  role: 'USER' | 'ADMIN';
}

export async function signToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ role: payload.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRY)
    .sign(getSecret());
}

async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (!payload.sub || !payload.role) return null;
    return { sub: payload.sub, role: payload.role as 'USER' | 'ADMIN' };
  } catch {
    return null;
  }
}

// ── Cookie helpers ────────────────────────────────────────────────────────────

export function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge,
  };
}

export async function setTokenCookie(res: NextResponse, token: string): Promise<void> {
  res.cookies.set(COOKIE_NAME, token, cookieOptions(60 * 60 * 24 * 7)); // 7 days
}

export async function clearTokenCookie(res: NextResponse): Promise<void> {
  res.cookies.set(COOKIE_NAME, '', cookieOptions(0));
}

// ── Session reading ───────────────────────────────────────────────────────────

/**
 * Read the session from Authorization header (Bearer token) first,
 * then fall back to the httpOnly cookie. Returns null if not logged in.
 */
export async function getSession(req?: NextRequest): Promise<SessionPayload | null> {
  // 1. Authorization header — for API/mobile clients
  const authHeader = req?.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    return verifyToken(token);
  }

  // 2. httpOnly cookie — for web clients
  try {
    const store = await cookies();
    const token = store.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyToken(token);
  } catch {
    return null;
  }
}

// ── Guards ────────────────────────────────────────────────────────────────────

/**
 * Returns the session or throws a 401 NextResponse.
 * Usage: const session = await requireUser(req);
 */
export async function requireUser(
  req?: NextRequest
): Promise<SessionPayload | NextResponse> {
  const session = await getSession(req);
  if (!session) return err('Please log in', 401);
  return session;
}

/**
 * Returns the session or throws 401/403.
 * Usage: const session = await requireAdmin(req);
 */
export async function requireAdmin(
  req?: NextRequest
): Promise<SessionPayload | NextResponse> {
  const session = await getSession(req);
  if (!session) return err('Please log in', 401);
  if (session.role !== 'ADMIN') return err('Admins only', 403);
  return session;
}

/** Type guard: check if the result is an error response. */
export function isErrorResponse(v: unknown): v is NextResponse {
  return v instanceof NextResponse;
}
