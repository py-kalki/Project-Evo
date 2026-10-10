'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatPrice, formatEventDate, CATEGORY_LABELS } from '@/lib/format';
import { useReminder } from '@/hooks/useReminder';
import { EventItem } from '@/components/EventCard';

interface CardDesign {
  theme: string;
  stickers: string[];
}

interface EventDetailResponse {
  event: EventItem;
  reminded: boolean;
  card: CardDesign | null;
}

export default function EventDetailPage({
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
    // Check local session
    const token = localStorage.getItem('evo_token');
    setIsLoggedIn(Boolean(token));

    async function loadEvent() {
      try {
        const res = await fetch(`/api/events/${id}`);
        if (res.status === 404) {
          setNotFound(true);
          return;
        }
        if (!res.ok) {
          throw new Error('Failed to load event');
        }
        const json = await res.json();
        setData(json);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    loadEvent();
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
        Loading event details...
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
          padding: '24px',
        }}
      >
        <div
          style={{
            maxWidth: '440px',
            textAlign: 'center',
            backgroundColor: '#050505',
            border: '1px solid #292d30',
            borderRadius: '16px',
            padding: '40px 24px',
          }}
        >
          <div style={{ fontSize: '36px', marginBottom: '16px' }}>📍</div>
          <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#ffffff', marginBottom: '8px' }}>
            Event Not Found
          </h1>
          <p style={{ fontSize: '14px', color: '#a1a4a5', marginBottom: '24px', lineHeight: 1.5 }}>
            This event does not exist, has been removed, or is currently inactive.
          </p>
          <Link
            href="/events"
            style={{
              display: 'inline-block',
              padding: '10px 20px',
              backgroundColor: '#ffffff',
              color: '#000000',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            Browse All Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <EventDetailContent
      event={data.event}
      initialReminded={data.reminded}
      initialCard={data.card}
      isLoggedIn={isLoggedIn}
      onNavigateLogin={() => router.push(`/login?next=/events/${data.event.id}`)}
    />
  );
}

function EventDetailContent({
  event,
  initialReminded,
  initialCard,
  isLoggedIn,
  onNavigateLogin,
}: {
  event: EventItem;
  initialReminded: boolean;
  initialCard: CardDesign | null;
  isLoggedIn: boolean;
  onNavigateLogin: () => void;
}) {
  const isPast = new Date(event.startsAt) < new Date();

  const { reminded, loading: reminderLoading, error: reminderError, toggleReminder } = useReminder({
    eventId: event.id,
    initialReminded,
    isLoggedIn,
  });

  async function handleReminderClick() {
    if (!isLoggedIn) {
      onNavigateLogin();
      return;
    }
    await toggleReminder();
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 60px)', backgroundColor: '#000000', paddingBottom: '80px' }}>
      <main className="container" style={{ paddingTop: '32px' }}>
        {/* Breadcrumb */}
        <div style={{ marginBottom: '24px' }}>
          <Link
            href="/events"
            style={{
              fontSize: '13px',
              color: '#a1a4a5',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            ← Back to all events
          </Link>
        </div>

        {/* Hero Cover Image */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '380px',
            borderRadius: '16px',
            overflow: 'hidden',
            border: '1px solid #292d30',
            backgroundColor: '#111111',
            marginBottom: '32px',
          }}
        >
          <img
            src={event.imageUrl}
            alt={event.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '24px',
              left: '24px',
              right: '24px',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              gap: '16px',
            }}
          >
            <div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <span
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 600,
                    backgroundColor: 'rgba(146, 129, 247, 0.25)',
                    backdropFilter: 'blur(8px)',
                    color: '#baa7ff',
                    border: '1px solid rgba(146, 129, 247, 0.4)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.4px',
                  }}
                >
                  {CATEGORY_LABELS[event.category] || event.category}
                </span>
                <span
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 600,
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    backdropFilter: 'blur(8px)',
                    color: '#ffffff',
                    border: '1px solid #292d30',
                  }}
                >
                  📍 {event.city}
                </span>
              </div>
              <h1
                style={{
                  fontSize: '32px',
                  fontWeight: 600,
                  color: '#ffffff',
                  letterSpacing: '-0.8px',
                  margin: 0,
                  textShadow: '0 2px 10px rgba(0,0,0,0.5)',
                }}
              >
                {event.title}
              </h1>
            </div>

            <div
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                backdropFilter: 'blur(10px)',
                border: '1px solid #292d30',
                fontSize: '20px',
                fontWeight: 600,
                color: '#ffffff',
              }}
            >
              {formatPrice(event.price)}
            </div>
          </div>
        </div>

        {/* Content Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
          {/* Main Info */}
          <div>
            <div
              style={{
                backgroundColor: '#050505',
                border: '1px solid #292d30',
                borderRadius: '16px',
                padding: '28px',
                marginBottom: '24px',
              }}
            >
              <h2
                style={{
                  fontSize: '18px',
                  fontWeight: 600,
                  color: '#ffffff',
                  marginTop: 0,
                  marginBottom: '16px',
                }}
              >
                About this event
              </h2>
              <p
                style={{
                  fontSize: '15px',
                  lineHeight: 1.7,
                  color: '#f0f0f0',
                  margin: 0,
                  whiteSpace: 'pre-line',
                }}
              >
                {event.description}
              </p>
            </div>

            {/* Custom Card CTA Banner */}
            <div
              style={{
                backgroundColor: '#050505',
                border: '1px solid #292d30',
                borderRadius: '16px',
                padding: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '18px' }}>🎨</span>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#ffffff', margin: 0 }}>
                    Event Card Designer
                  </h3>
                </div>
                <p style={{ fontSize: '13px', color: '#a1a4a5', margin: 0 }}>
                  {initialCard
                    ? `Theme: ${initialCard.theme} • ${initialCard.stickers.length} stickers chosen`
                    : 'Customize your personal souvenir card with dynamic color themes and stickers.'}
                </p>
              </div>

              <Link
                href={`/events/${event.id}/card`}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(146, 129, 247, 0.12)',
                  color: '#baa7ff',
                  border: '1px solid rgba(146, 129, 247, 0.3)',
                  fontSize: '13px',
                  fontWeight: 500,
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  transition: 'all 150ms ease-out',
                }}
              >
                {initialCard ? 'Edit Card Design ✏️' : 'Design Card ✨'}
              </Link>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div
              style={{
                backgroundColor: '#050505',
                border: '1px solid #292d30',
                borderRadius: '16px',
                padding: '24px',
              }}
            >
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#ffffff', marginTop: 0, marginBottom: '20px' }}>
                Event Details
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#a1a4a5', marginBottom: '4px' }}>Date & Time</div>
                  <div style={{ fontSize: '14px', color: '#ffffff', fontWeight: 500 }}>
                    {formatEventDate(event.startsAt)}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '12px', color: '#a1a4a5', marginBottom: '4px' }}>City</div>
                  <div style={{ fontSize: '14px', color: '#ffffff', fontWeight: 500 }}>
                    {event.city}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '12px', color: '#a1a4a5', marginBottom: '4px' }}>Ticket Price</div>
                  <div style={{ fontSize: '14px', color: '#ffffff', fontWeight: 500 }}>
                    {formatPrice(event.price)}
                  </div>
                </div>
              </div>

              {/* Remind Me Action */}
              {isPast ? (
                <div
                  style={{
                    padding: '12px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(110, 114, 122, 0.1)',
                    border: '1px solid #292d30',
                    color: '#a1a4a5',
                    fontSize: '13px',
                    textAlign: 'center',
                  }}
                >
                  This event has already taken place
                </div>
              ) : (
                <div>
                  <button
                    onClick={handleReminderClick}
                    disabled={reminderLoading}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: 500,
                      cursor: reminderLoading ? 'not-allowed' : 'pointer',
                      backgroundColor: reminded ? 'rgba(58, 211, 137, 0.12)' : '#ffffff',
                      color: reminded ? '#3ad389' : '#000000',
                      border: reminded ? '1px solid rgba(58, 211, 137, 0.3)' : 'none',
                      transition: 'all 150ms ease-out',
                    }}
                  >
                    {reminderLoading
                      ? 'Updating...'
                      : !isLoggedIn
                      ? 'Log in to set reminder 🔔'
                      : reminded
                      ? 'Reminder set ✓'
                      : 'Remind me 🔔'}
                  </button>

                  {reminderError && (
                    <div
                      role="alert"
                      style={{
                        marginTop: '10px',
                        padding: '8px 10px',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(255, 100, 101, 0.1)',
                        border: '1px solid rgba(255, 149, 146, 0.3)',
                        color: '#ff9592',
                        fontSize: '12px',
                        lineHeight: 1.4,
                      }}
                    >
                      {reminderError}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
