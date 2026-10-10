import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { err, handle } from '@/lib/api';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return handle(async () => {
    const { id } = await context.params;
    if (!id) {
      return err('Event ID is required', 400);
    }

    // Active events only (per specification)
    const event = await db.event.findFirst({
      where: {
        id,
        isActive: true,
      },
    });

    if (!event) {
      return err('Event not found', 404);
    }

    const session = await getSession(req);

    let reminded = false;
    let card: { theme: string; stickers: string[] } | null = null;

    if (session) {
      const [reminderRow, cardRow] = await Promise.all([
        db.reminder.findUnique({
          where: {
            userId_eventId: {
              userId: session.sub,
              eventId: id,
            },
          },
        }),
        db.eventCard.findUnique({
          where: {
            userId_eventId: {
              userId: session.sub,
              eventId: id,
            },
          },
        }),
      ]);

      reminded = Boolean(reminderRow);
      if (cardRow) {
        card = {
          theme: cardRow.theme,
          stickers: cardRow.stickers,
        };
      }
    }

    return NextResponse.json(
      {
        event,
        reminded,
        card,
      },
      { status: 200 }
    );
  });
}
