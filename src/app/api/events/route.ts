import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { validationError, handle } from '@/lib/api';
import { Category, Prisma } from '@prisma/client';

const querySchema = z.object({
  category: z.nativeEnum(Category).optional(),
  city: z.string().trim().min(1).optional(),
  q: z.string().trim().min(1).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(9),
});

export async function GET(req: NextRequest) {
  return handle(async () => {
    const url = req.nextUrl;
    const rawParams = {
      category: url.searchParams.get('category') || undefined,
      city: url.searchParams.get('city') || undefined,
      q: url.searchParams.get('q') || undefined,
      page: url.searchParams.get('page') || undefined,
      limit: url.searchParams.get('limit') || undefined,
    };

    const parsed = querySchema.safeParse(rawParams);
    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const { category, city, q, page, limit } = parsed.data;

    // Base condition: active, upcoming events only
    const where: Prisma.EventWhereInput = {
      isActive: true,
      startsAt: { gte: new Date() },
    };

    if (category) {
      where.category = category;
    }

    if (city) {
      where.city = { equals: city, mode: 'insensitive' };
    }

    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [items, total] = await db.$transaction([
      db.event.findMany({
        where,
        orderBy: { startsAt: 'asc' }, // nearest first
        skip,
        take: limit,
      }),
      db.event.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json(
      {
        items,
        page,
        limit,
        total,
        totalPages,
      },
      { status: 200 }
    );
  });
}
