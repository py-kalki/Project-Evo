import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireUser, isErrorResponse } from '@/lib/auth';
import { err, handle } from '@/lib/api';

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return handle(async () => {
    const auth = await requireUser(req);
    if (isErrorResponse(auth)) return auth;

    const { id } = await context.params;
    if (!id) {
      return err('Event ID is required', 400);
    }

    const event = await db.event.findUnique({
      where: { id },
      select: { id: true, isActive: true, startsAt: true },
    });

    if (!event || !event.isActive) {
      return err('Event not found', 404);
    }

    // Server-enforced rule: cannot set reminders for events that have already started
    if (event.startsAt < new Date()) {
      return err('Event has already started', 409);
    }

    await db.reminder.upsert({
      where: {
        userId_eventId: {
          userId: auth.sub,
          eventId: id,
        },
      },
      update: {},
      create: {
        userId: auth.sub,
        eventId: id,
      },
    });

    return NextResponse.json({ reminded: true }, { status: 200 });
  });
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return handle(async () => {
    const auth = await requireUser(req);
    if (isErrorResponse(auth)) return auth;

    const { id } = await context.params;
    if (!id) {
      return err('Event ID is required', 400);
    }

    await db.reminder.deleteMany({
      where: {
        userId: auth.sub,
        eventId: id,
      },
    });

    return NextResponse.json({ reminded: false }, { status: 200 });
  });
}
