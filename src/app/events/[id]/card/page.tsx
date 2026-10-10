'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { CardDesigner } from '@/components/CardDesigner';
import { EventItem } from '@/components/EventCard';
import { Theme } from '@/lib/card';

interface EventDetailResponse {
  event: EventItem;
  reminded: boolean;
  card: {
    theme: string;
    stickers: string[];
  } | null;
}

export default function EventCardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  const [data, setData] = useState<EventDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('evo_token');
    setIsLoggedIn(Boolean(token));

    async function load() {
      try {
        const res = await fetch(`/api/events/${id}`);
        if (res.status === 404) {
          setNotFound(true);
          return;
        }
        if (!res.ok) throw new Error('Failed to load event');
        const json = await res.json();
        setData(json);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: 'calc(100vh - 60px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#000000',
          color: '#a1a4a5',
        }}
      >
        Loading designer...
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div
        style={{
          minHeight: 'calc(100vh - 60px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#000000',
        }}
      >
        <div style={{ textAlign: 'center', color: '#a1a4a5' }}>
          Event not found. <Link href="/events" style={{ color: '#ffffff' }}>Back to events</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 60px)', backgroundColor: '#000000', paddingBottom: '80px' }}>
      <main className="container" style={{ paddingTop: '32px' }}>
        {/* Back Link */}
        <div style={{ marginBottom: '24px' }}>
          <Link
            href={`/events/${data.event.id}`}
            style={{
              fontSize: '13px',
              color: '#a1a4a5',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <ArrowLeft size={14} style={{ flexShrink: 0 }} />
            Back to {data.event.title}
          </Link>
        </div>

        {/* Page Title */}
        <div style={{ marginBottom: '32px' }}>
          <h1
            style={{
              fontSize: '28px',
              fontWeight: 600,
              color: '#ffffff',
              letterSpacing: '-0.5px',
              margin: '0 0 6px 0',
            }}
          >
            Design Your Event Pass
          </h1>
          <p style={{ margin: 0, fontSize: '14px', color: '#a1a4a5' }}>
            Customize your personal digital souvenir pass with animated color themes and stickers.
          </p>
        </div>

        {/* Card Designer */}
        <CardDesigner
          event={data.event}
          initialTheme={(data.card?.theme as Theme) || 'sunset'}
          initialStickers={data.card?.stickers || []}
          isLoggedIn={isLoggedIn}
          onRequireLogin={() => router.push(`/login?next=/events/${data.event.id}/card`)}
        />
      </main>
    </div>
  );
}
