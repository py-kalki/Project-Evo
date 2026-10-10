import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { hashPassword, signToken, setTokenCookie } from '@/lib/auth';
import { err, validationError, handle } from '@/lib/api';

const signupSchema = z.object({
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function POST(req: NextRequest) {
  return handle(async () => {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return err('Invalid JSON body', 400);
    }

    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const { email, password } = parsed.data;

    const existing = await db.user.findUnique({
      where: { email },
    });

    if (existing) {
      return err('Email already registered', 409);
    }

    const passwordHash = await hashPassword(password);

    const user = await db.user.create({
      data: {
        email,
        passwordHash,
        role: 'USER',
      },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    const token = await signToken({
      sub: user.id,
      role: user.role,
    });

    const res = NextResponse.json(
      {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );

    await setTokenCookie(res, token);
    return res;
  });
}
