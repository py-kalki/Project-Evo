import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAdmin, isErrorResponse } from '@/lib/auth';
import { err, validationError, handle } from '@/lib/api';
import { Category } from '@prisma/client';

const createEventSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Title must be at least 3 characters')
    .max(120, 'Title must be at most 120 characters'),
  category: z.nativeEnum(Category, {
    errorMap: () => ({ message: 'Category must be one of: MUSIC, WORKSHOP, FOOD, SPORTS, KIDS' }),
  }),
  city: z
    .string()
    .trim()
    .min(2, 'City must be at least 2 characters')
    .max(60, 'City must be at most 60 characters'),
  startsAt: z.coerce.date({
    errorMap: () => ({ message: 'Valid startsAt date is required' }),
  }),
  price: z
    .number()
    .int('Price must be an integer')
    .min(0, 'Price must be greater than or equal to 0')
    .max(10000000, 'Price cannot exceed 10,000,000'),
  description: z
    .string()
    .trim()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must be at most 2000 characters'),
  imageUrl: z.string().trim().url('Image URL must be a valid URL'),
});

export async function GET(req: NextRequest) {
  return handle(async () => {
    const auth = await requireAdmin(req);
    if (isErrorResponse(auth)) return auth;

    const items = await db.event.findMany({
      orderBy: { startsAt: 'desc' },
    });

    return NextResponse.json({ items }, { status: 200 });
  });
}

export async function POST(req: NextRequest) {
  return handle(async () => {
    const auth = await requireAdmin(req);
    if (isErrorResponse(auth)) return auth;

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return err('Invalid JSON body', 400);
    }

    const parsed = createEventSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const data = parsed.data;

    const event = await db.event.create({
      data: {
        title: data.title,
        category: data.category,
        city: data.city,
        startsAt: data.startsAt,
        price: data.price,
        description: data.description,
        imageUrl: data.imageUrl,
        isActive: true,
      },
    });

    return NextResponse.json(event, { status: 201 });
  });
}
