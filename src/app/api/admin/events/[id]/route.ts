import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAdmin, isErrorResponse } from '@/lib/auth';
import { err, validationError, handle } from '@/lib/api';
import { Category } from '@prisma/client';

const updateEventSchema = z.object({
  title: z.string().trim().min(3).max(120),
  category: z.nativeEnum(Category),
  city: z.string().trim().min(2).max(60),
  startsAt: z.coerce.date(),
  price: z.number().int().min(0).max(10000000),
  description: z.string().trim().min(10).max(2000),
  imageUrl: z.string().trim().url(),
});

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Ctx) {
  return handle(async () => {
    const auth = await requireAdmin(req);
    if (isErrorResponse(auth)) return auth;
    const { id } = await params;
    const event = await db.event.findUnique({ where: { id } });
    if (!event) return err('Event not found', 404);
    return NextResponse.json(event, { status: 200 });
  });
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  return handle(async () => {
    const auth = await requireAdmin(req);
    if (isErrorResponse(auth)) return auth;
    const { id } = await params;
    const existing = await db.event.findUnique({ where: { id } });
    if (!existing) return err('Event not found', 404);
    let body: unknown;
    try { body = await req.json(); } catch { return err('Invalid JSON body', 400); }
    const parsed = updateEventSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);
    const data = parsed.data;
    const updated = await db.event.update({
      where: { id },
      data: {
        title: data.title,
        category: data.category,
        city: data.city,
        startsAt: data.startsAt,
        price: data.price,
        description: data.description,
        imageUrl: data.imageUrl,
      },
    });
    return NextResponse.json(updated, { status: 200 });
  });
}