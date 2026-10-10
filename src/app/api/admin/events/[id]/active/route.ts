import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAdmin, isErrorResponse } from '@/lib/auth';
import { err, validationError, handle } from '@/lib/api';

const toggleActiveSchema = z.object({
  isActive: z.boolean({
    required_error: 'isActive is required and must be a boolean',
  }),
});

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return handle(async () => {
    const auth = await requireAdmin(req);
    if (isErrorResponse(auth)) return auth;

    const { id } = await context.params;
    if (!id) {
      return err('Event ID is required', 400);
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return err('Invalid JSON body', 400);
    }

    const parsed = toggleActiveSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const existing = await db.event.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return err('Event not found', 404);
    }

    const updated = await db.event.update({
      where: { id },
      data: { isActive: parsed.data.isActive },
      select: { id: true, isActive: true },
    });

    return NextResponse.json({ id: updated.id, isActive: updated.isActive }, { status: 200 });
  });
}
