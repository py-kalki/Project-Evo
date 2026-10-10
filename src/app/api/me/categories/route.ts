import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireUser, isErrorResponse } from '@/lib/auth';
import { err, validationError, handle } from '@/lib/api';
import { Category } from '@prisma/client';

const categoriesSchema = z.object({
  categories: z
    .array(z.nativeEnum(Category))
    .max(5, 'At most 5 categories can be selected')
    .transform((cats) => Array.from(new Set(cats))),
});

export async function GET(req: NextRequest) {
  return handle(async () => {
    const auth = await requireUser(req);
    if (isErrorResponse(auth)) return auth;

    const rows = await db.userCategory.findMany({
      where: { userId: auth.sub },
      select: { category: true },
    });

    const categories = rows.map((r) => r.category);
    return NextResponse.json({ categories }, { status: 200 });
  });
}

export async function PUT(req: NextRequest) {
  return handle(async () => {
    const auth = await requireUser(req);
    if (isErrorResponse(auth)) return auth;

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return err('Invalid JSON body', 400);
    }

    const parsed = categoriesSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const uniqueCategories = parsed.data.categories;

    await db.$transaction([
      db.userCategory.deleteMany({
        where: { userId: auth.sub },
      }),
      db.userCategory.createMany({
        data: uniqueCategories.map((cat) => ({
          userId: auth.sub,
          category: cat,
        })),
      }),
    ]);

    return NextResponse.json({ categories: uniqueCategories }, { status: 200 });
  });
}
