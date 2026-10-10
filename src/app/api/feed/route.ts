import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireUser, isErrorResponse } from '@/lib/auth';
import { validationError, handle } from '@/lib/api';

const feedQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(9),
});

export async function GET(req: NextRequest) {
  return handle(async () => {
    const auth = await requireUser(req);
    if (isErrorResponse(auth)) return auth;

    const url = req.nextUrl;
    const parsed = feedQuerySchema.safeParse({
      page: url.searchParams.get('page') || undefined,
      limit: url.searchParams.get('limit') || undefined,
    });

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const { page, limit } = parsed.data;

    // Fetch user favourite categories
    const userCategories = await db.userCategory.findMany({
      where: { userId: auth.sub },
      select: { category: true },
    });

    const categories = userCategories.map((c) => c.category);

    if (categories.length === 0) {
      return NextResponse.json(
        {
          items: [],
          page: 1,
          limit,
          total: 0,
          totalPages: 0,
          needsCategories: true,
        },
        { status: 200 }
      );
    }

    const where = {
      isActive: true,
      startsAt: { gte: new Date() },
      category: { in: categories },
    };

    const skip = (page - 1) * limit;

    const [items, total] = await db.$transaction([
      db.event.findMany({
        where,
        orderBy: { startsAt: 'asc' },
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
        needsCategories: false,
      },
      { status: 200 }
    );
  });
}
