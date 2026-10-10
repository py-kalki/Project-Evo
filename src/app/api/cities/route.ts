import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { handle } from '@/lib/api';

/**
 * GET /api/cities
 * Returns distinct cities that have active, upcoming events, sorted alphabetically.
 */
export async function GET() {
  return handle(async () => {
    const records = await db.event.findMany({
      where: {
        isActive: true,
        startsAt: { gte: new Date() },
      },
      distinct: ['city'],
      select: { city: true },
      orderBy: { city: 'asc' },
    });

    const cities = records.map((r) => r.city);
    return NextResponse.json({ cities }, { status: 200 });
  });
}
