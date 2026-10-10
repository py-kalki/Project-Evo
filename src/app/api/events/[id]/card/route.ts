import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireUser, isErrorResponse } from '@/lib/auth';
import { err, validationError, handle } from '@/lib/api';
import { THEMES, STICKERS, MAX_STICKERS, DEFAULT_THEME } from '@/lib/card';

const saveCardSchema = z.object({
  theme: z.enum(THEMES, {
    errorMap: () => ({ message: `Theme must be one of: ${THEMES.join(', ')}` }),
  }),
  stickers: z
    .array(z.enum(STICKERS))
    .max(MAX_STICKERS, `You can add at most ${MAX_STICKERS} stickers`),
});

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return handle(async () => {
    const auth = await requireUser(req);
    if (isErrorResponse(auth)) return auth;

    const { id } = await context.params;
    if (!id) return err('Event ID is required', 400);

    const event = await db.event.findFirst({
      where: { id, isActive: true },
      select: { id: true },
    });

    if (!event) return err('Event not found', 404);

    const card = await db.eventCard.findUnique({
      where: {
        userId_eventId: {
          userId: auth.sub,
          eventId: id,
        },
      },
    });

    if (!card) {
      return NextResponse.json(
        { theme: DEFAULT_THEME, stickers: [] },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { theme: card.theme, stickers: card.stickers },
      { status: 200 }
    );
  });
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return handle(async () => {
    const auth = await requireUser(req);
    if (isErrorResponse(auth)) return auth;

    const { id } = await context.params;
    if (!id) return err('Event ID is required', 400);

    const event = await db.event.findFirst({
      where: { id, isActive: true },
      select: { id: true },
    });

    if (!event) return err('Event not found', 404);

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return err('Invalid JSON body', 400);
    }

    const parsed = saveCardSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const { theme, stickers } = parsed.data;

    const saved = await db.eventCard.upsert({
      where: {
        userId_eventId: {
          userId: auth.sub,
          eventId: id,
        },
      },
      update: {
        theme,
        stickers,
      },
      create: {
        userId: auth.sub,
        eventId: id,
        theme,
        stickers,
      },
      select: {
        theme: true,
        stickers: true,
      },
    });

    return NextResponse.json(saved, { status: 200 });
  });
}
